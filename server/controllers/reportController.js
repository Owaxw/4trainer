const SimulationAttempt = require('../models/SimulationAttempt');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get user progress report
exports.getUserProgressReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all user attempts
    const attempts = await SimulationAttempt.find({ user: userId })
      .populate('scenario', 'title type difficulty')
      .sort({ completedAt: -1 });
    
    // Calculate statistics
    const stats = {
      total: attempts.length,
      correct: attempts.filter(a => a.isCorrect).length,
      incorrect: attempts.filter(a => !a.isCorrect).length,
      byType: {
        phishing: {
          total: 0,
          correct: 0,
          successRate: 0
        },
        password: {
          total: 0,
          correct: 0,
          successRate: 0
        },
        social: {
          total: 0,
          correct: 0,
          successRate: 0
        }
      }
    };
    
    // Calculate success rate
    stats.successRate = stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : 0;
    
    // Calculate by type
    attempts.forEach(attempt => {
      const type = attempt.scenario.type;
      
      stats.byType[type].total += 1;
      if (attempt.isCorrect) {
        stats.byType[type].correct += 1;
      }
    });
    
    // Calculate success rate by type
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      typeStats.successRate = typeStats.total > 0 
        ? (typeStats.correct / typeStats.total * 100).toFixed(1) 
        : 0;
    });
    
    // Get recent attempts
    const recentAttempts = attempts.slice(0, 10).map(a => ({
      id: a._id,
      scenarioTitle: a.scenario.title,
      type: a.scenario.type,
      isCorrect: a.isCorrect,
      date: a.completedAt
    }));
    
    res.json({
      stats,
      recentAttempts
    });
  } catch (error) {
    logger.error('Error fetching user progress report:', error);
    next(error);
  }
};

// Get organization-wide report
exports.getOrganizationReport = async (req, res, next) => {
  try {
    const organization = req.user.organization;
    
    // Get all users in the organization
    const users = await User.find({ organization });
    const userIds = users.map(user => user._id);
    
    // Get all attempts from users in the organization
    const attempts = await SimulationAttempt.find({ user: { $in: userIds } })
      .populate('scenario', 'title type difficulty')
      .populate('user', 'name email department');
    
    // Calculate overall statistics
    const stats = {
      totalUsers: users.length,
      activeUsers: attempts.map(a => a.user._id.toString()).filter((v, i, a) => a.indexOf(v) === i).length,
      totalAttempts: attempts.length,
      correctAttempts: attempts.filter(a => a.isCorrect).length,
      successRate: 0,
      byDepartment: {},
      byType: {
        phishing: { total: 0, correct: 0, successRate: 0 },
        password: { total: 0, correct: 0, successRate: 0 },
        social: { total: 0, correct: 0, successRate: 0 }
      }
    };
    
    // Calculate success rate
    stats.successRate = stats.totalAttempts > 0 
      ? (stats.correctAttempts / stats.totalAttempts * 100).toFixed(1) 
      : 0;
    
    // Calculate by type
    attempts.forEach(attempt => {
      const type = attempt.scenario.type;
      const department = attempt.user.department || 'Unassigned';
      
      // Type statistics
      stats.byType[type].total += 1;
      if (attempt.isCorrect) {
        stats.byType[type].correct += 1;
      }
      
      // Department statistics
      if (!stats.byDepartment[department]) {
        stats.byDepartment[department] = {
          total: 0,
          correct: 0,
          successRate: 0,
          userCount: 0
        };
      }
      
      stats.byDepartment[department].total += 1;
      if (attempt.isCorrect) {
        stats.byDepartment[department].correct += 1;
      }
    });
    
    // Calculate success rates
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      typeStats.successRate = typeStats.total > 0 
        ? (typeStats.correct / typeStats.total * 100).toFixed(1) 
        : 0;
    });
    
    // Calculate department statistics
    Object.keys(stats.byDepartment).forEach(dept => {
      const deptStats = stats.byDepartment[dept];
      deptStats.successRate = deptStats.total > 0 
        ? (deptStats.correct / deptStats.total * 100).toFixed(1) 
        : 0;
      
      // Count users in department
      deptStats.userCount = users.filter(u => (u.department || 'Unassigned') === dept).length;
    });
    
    res.json({
      stats
    });
  } catch (error) {
    logger.error('Error fetching organization report:', error);
    next(error);
  }
};

// Get detailed simulation results
exports.getSimulationResults = async (req, res, next) => {
  try {
    const { type } = req.params;
    const userId = req.user.id;
    
    // Validate simulation type
    if (!['phishing', 'password', 'social'].includes(type)) {
      return res.status(400).json({ message: 'Invalid simulation type' });
    }
    
    // Get all attempts for the specified type
    const attempts = await SimulationAttempt.find({ user: userId })
      .populate({
        path: 'scenario',
        match: { type },
        select: 'title difficulty indicators'
      })
      .sort({ completedAt: -1 });
    
    // Filter out attempts with null scenarios (type mismatch)
    const filteredAttempts = attempts.filter(a => a.scenario);
    
    // Format results
    const results = filteredAttempts.map(attempt => ({
      id: attempt._id,
      scenarioTitle: attempt.scenario.title,
      difficulty: attempt.scenario.difficulty,
      isCorrect: attempt.isCorrect,
      action: attempt.action,
      data: attempt.data,
      timeSpent: attempt.timeSpent,
      date: attempt.completedAt,
      indicators: attempt.scenario.indicators
    }));
    
    res.json(results);
  } catch (error) {
    logger.error(`Error fetching ${req.params.type} simulation results:`, error);
    next(error);
  }
};

// Export reports
exports.exportReport = async (req, res, next) => {
  try {
    const { reportType } = req.params;
    const format = req.query.format || 'json';
    
    // Validate report type
    if (!['user', 'organization', 'department'].includes(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }
    
    // Generate report data based on type
    let reportData = {};
    
    if (reportType === 'user') {
      const userId = req.query.userId || req.user.id;
      
      // Check permission if requesting another user's report
      if (userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      // Get user data
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get user attempts
      const attempts = await SimulationAttempt.find({ user: userId })
        .populate('scenario', 'title type difficulty')
        .sort({ completedAt: -1 });
      
      // Format report
      reportData = {
        user: {
          name: user.name,
          email: user.email,
          department: user.department,
          organization: user.organization
        },
        statistics: {
          total: attempts.length,
          correct: attempts.filter(a => a.isCorrect).length,
          successRate: attempts.length > 0 
            ? (attempts.filter(a => a.isCorrect).length / attempts.length * 100).toFixed(1) 
            : 0
        }
      };
    }
    
    // Return data in requested format
    if (format === 'csv') {
      // Convert to CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
      // Return CSV data
      res.send('CSV data would be here');
    } else {
      // Return JSON
      res.json(reportData);
    }
  } catch (error) {
    logger.error(`Error exporting ${req.params.reportType} report:`, error);
    next(error);
  }
};