const router = require('express').Router();
const { getLandingStatistik } = require('../controllers/landingStatistik');

router.get('/', getLandingStatistik);

module.exports = router;
