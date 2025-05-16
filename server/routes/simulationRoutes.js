const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const simulationController = require('../controllers/simulationController');

// Get phishing scenarios
router.get('/phishing', auth, simulationController.getPhishingScenarios);

// Get password attack scenarios
router.get('/password', auth, simulationController.getPasswordScenarios);

// Get social engineering scenarios
router.get('/social', auth, simulationController.getSocialScenarios);

// Submit phishing response
router.post('/phishing/submit', auth, simulationController.submitPhishingResponse);

// Submit password response
router.post('/password/submit', auth, simulationController.submitPasswordResponse);

// Submit social engineering response
router.post('/social/submit', auth, simulationController.submitSocialResponse);

module.exports = router;