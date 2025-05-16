const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// Get user progress report
router.get('/user/progress', auth, reportController.getUserProgressReport);

// Get organization-wide report (admin only)
router.get('/organization', auth, authorize(['admin', 'trainer']), reportController.getOrganizationReport);

// Get detailed simulation results
router.get('/simulations/:type', auth, reportController.getSimulationResults);

// Export reports
router.get('/export/:reportType', auth, authorize(['admin', 'trainer']), reportController.exportReport);

module.exports = router;