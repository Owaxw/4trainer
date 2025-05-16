const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['phishing', 'password', 'social'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // For phishing scenarios
  email: {
    from: String,
    to: String,
    subject: String,
    date: String,
    body: String,
    attachments: [{
      filename: String,
      type: String,
      size: String
    }]
  },
  // For password scenarios
  passwordContext: {
    systemName: String,
    requirements: [String],
    requiredStrength: Number
  },
  // For social engineering scenarios
  socialContext: {
    scenario: String,
    medium: String, // phone, in-person, chat
    script: String
  },
  correctAction: {
    type: String, // Depends on scenario type
    required: true
  },
  correctFeedback: {
    type: String,
    required: true
  },
  incorrectFeedback: {
    type: String,
    required: true
  },
  indicators: [String], // List of warning signs to look for
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scenario', ScenarioSchema);