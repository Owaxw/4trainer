const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied: you do not have permission to perform this action' 
      });
    }
    next();
  };
};