const mongoose = require('mongoose');

const SimulationAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  action: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number // Time in seconds
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SimulationAttempt', SimulationAttemptSchema);