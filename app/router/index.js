const { Router } = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../../docs/swagger.json');
const router = Router();
const { cekNik, cekNiP } = require('../controllers/cekNik');
const akun = require('./akun');
const auth = require('../../midleware/auth');
const dataTani = require('./dataTani');
const InfoTani = require('./InfoTani');
const tokoTani = require('./tokoTani');
const liveChat = require('./liveChat');
const statistik = require('./statistik');
const kelompok = require('./kelompok');
const dataPenyuluh = require('./dataPenyuluh');
const select = require('./select');
const allUsers = require('./allUsers');
const chart = require('./chart');
const laporanTanam = require('./laporanTanam');
const chatt = require('./chatt');
const footer = require('./footer');
const faq = require('./faq');
const tanamanPetani = require('./tanamanPetani');
const logActivity = require('./logActivity');
const dataOperator = require('./dataOperator');
const dashboard = require('./dashboard');
const wilayah = require('./wilayah');
const landingStatistik = require('./landingStatistik');
const { searchGlobal } = require('../controllers/search');

router.use('/api-docs', swaggerUI.serve);
router.get('/api-docs', swaggerUI.setup(swaggerDocument));

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running in NEW BE'
  });
});
router.post('/cek-nik', auth, cekNik);
router.post('/cek-nip', auth, cekNiP);
// search global
router.get('/search', searchGlobal);
router.use('/auth', akun);
router.use('/statistik', statistik);
router.use('/landing-statistik', landingStatistik); // Endpoint publik untuk landing page
router.use('/kelompok', kelompok);
router.use('/tanaman-petani', tanamanPetani);
router.use('/footer', footer);
router.use('/faq', faq);
router.use('/dashboard', dashboard);
router.use('/', dataTani);
router.use('/', InfoTani);
router.use('/', tokoTani);
router.use('/', liveChat);
router.use('/', dataPenyuluh);
router.use('/', select);
router.use('/', allUsers);
router.use('/', chart);
router.use('/', chatt);
router.use('/', laporanTanam);
router.use('/', logActivity);
router.use('/', dataOperator);
router.use('/wilayah', wilayah);

module.exports = router;
