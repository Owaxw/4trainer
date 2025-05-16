const Scenario = require('../models/Scenario');
const SimulationAttempt = require('../models/SimulationAttempt');
const logger = require('../utils/logger');

// Get all phishing scenarios
exports.getPhishingScenarios = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({ type: 'phishing' });
    res.json(scenarios);
  } catch (error) {
    logger.error('Error fetching phishing scenarios:', error);
    next(error);
  }
};

// Get all password attack scenarios
exports.getPasswordScenarios = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({ type: 'password' });
    res.json(scenarios);
  } catch (error) {
    logger.error('Error fetching password scenarios:', error);
    next(error);
  }
};

// Get all social engineering scenarios
exports.getSocialScenarios = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({ type: 'social' });
    res.json(scenarios);
  } catch (error) {
    logger.error('Error fetching social engineering scenarios:', error);
    next(error);
  }
};

// Submit phishing response
exports.submitPhishingResponse = async (req, res, next) => {
  try {
    const { scenarioId, action } = req.body;
    const userId = req.user.id;
    
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    // Check if the response is correct
    const isCorrect = scenario.correctAction === action;
    
    // Create new attempt record
    const attempt = new SimulationAttempt({
      user: userId,
      scenario: scenarioId,
      action,
      isCorrect,
      completedAt: Date.now()
    });
    
    await attempt.save();
    
    // Generate feedback based on scenario and action
    const feedback = {
      correct: isCorrect,
      message: isCorrect 
        ? scenario.correctFeedback 
        : scenario.incorrectFeedback,
      indicators: scenario.indicators || []
    };
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    logger.error('Error submitting phishing response:', error);
    next(error);
  }
};

// Submit password attack response
exports.submitPasswordResponse = async (req, res, next) => {
  try {
    const { scenarioId, password } = req.body;
    const userId = req.user.id;
    
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    // Evaluate password strength
    const strength = evaluatePasswordStrength(password);
    const isCorrect = strength >= scenario.requiredStrength;
    
    // Create new attempt record
    const attempt = new SimulationAttempt({
      user: userId,
      scenario: scenarioId,
      data: { password, strength },
      isCorrect,
      completedAt: Date.now()
    });
    
    await attempt.save();
    
    // Generate feedback
    const feedback = {
      correct: isCorrect,
      strength,
      message: isCorrect 
        ? 'This password meets the security requirements.' 
        : 'This password does not meet the security requirements.',
      improvements: getPasswordImprovements(password)
    };
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    logger.error('Error submitting password response:', error);
    next(error);
  }
};

// Helper function to evaluate password strength (simplified)
function evaluatePasswordStrength(password) {
  let strength = 0;
  
  // Length check
  if (password.length >= 12) {
    strength += 2;
  } else if (password.length >= 8) {
    strength += 1;
  }
  
  // Character type checks
  if (/[A-Z]/.test(password)) strength += 1; // Uppercase
  if (/[a-z]/.test(password)) strength += 1; // Lowercase
  if (/[0-9]/.test(password)) strength += 1; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
  
  // Check for common patterns
  if (!/^(?:123|abc|qwerty|password|admin|welcome)/.test(password.toLowerCase())) {
    strength += 1;
  }
  
  return Math.min(strength, 5); // Scale of 0-5
}

// Helper function to suggest password improvements
function getPasswordImprovements(password) {
  const improvements = [];
  
  if (password.length < 12) {
    improvements.push('Use at least 12 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    improvements.push('Include uppercase letters');
  }
  
  if (!/[a-z]/.test(password)) {
    improvements.push('Include lowercase letters');
  }
  
  if (!/[0-9]/.test(password)) {
    improvements.push('Include numbers');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    improvements.push('Include special characters');
  }
  
  return improvements;
}

// Submit social engineering response
exports.submitSocialResponse = async (req, res, next) => {
  try {
    const { scenarioId, action } = req.body;
    const userId = req.user.id;
    
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    
    // Check if the response is correct
    const isCorrect = scenario.correctAction === action;
    
    // Create new attempt record
    const attempt = new SimulationAttempt({
      user: userId,
      scenario: scenarioId,
      action,
      isCorrect,
      completedAt: Date.now()
    });
    
    await attempt.save();
    
    // Generate feedback based on scenario and action
    const feedback = {
      correct: isCorrect,
      message: isCorrect 
        ? scenario.correctFeedback 
        : scenario.incorrectFeedback,
      indicators: scenario.indicators || []
    };
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    logger.error('Error submitting social engineering response:', error);
    next(error);
  }
};