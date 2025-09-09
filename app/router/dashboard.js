const router = require('express').Router();
const { auth, hasPermission } = require('../../midleware/auth');
const { getDashboardIndexData } = require('../controllers/dashboard');
const { PERMISSIONS } = require('../../helpers/roleHelpers');

router.get('/', auth, hasPermission(PERMISSIONS.DASHBOARD_INDEX), getDashboardIndexData);
module.exports = router;
