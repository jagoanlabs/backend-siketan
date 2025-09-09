const router = require('express').Router();
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  laporanPetani,
  laporanPenyuluh,
  tambahDaftarTani,
  tambahLaporanTani,
  daftarTani,
  deleteDaftarTani,
  dataTaniDetail,
  updateTaniDetail,
  getLaporanPetani,
  tambahTanamanPetani,
  getTanamanPetaniById,
  ubahTanamanPetaniById,
  deleteTanamanPetaniById,
  uploadDataPetani
} = require('../controllers/dataTani');
const {
  getAllTanamanPetani,
  // getTanamanPetaniById,
  tambahDataTanamanPetani,
  // ubahTanamanPetaniById,
  getDetailedDataTanamanPetani,
  deleteDatatanamanPetani,
  editDataTanamanPetani,
  uploadDataTanamanPetani
  // deleteTanamanPetaniById,
} = require('../controllers/tanamanPetani');
const { getAllDataTanaman } = require('../controllers/dataTanaman');
const { PERMISSIONS } = require('../../helpers/roleHelpers');

router.get('/daftar-tani', auth, hasPermission(PERMISSIONS.DATA_PETANI_INDEX), daftarTani);
router.post(
  '/daftar-tani/add',
  auth,
  upload.single('foto'),
  hasPermission(PERMISSIONS.DATA_PETANI_CREATE),
  tambahDaftarTani
);
router.get('/daftar-tani/:id', auth, hasPermission(PERMISSIONS.DATA_PETANI_DETAIL), dataTaniDetail);
router.put(
  '/daftar-tani/:id',
  auth,
  upload.single('foto'),
  hasPermission(PERMISSIONS.DATA_PETANI_EDIT),
  updateTaniDetail
);
router.delete(
  '/daftar-tani/:id',
  auth,
  hasPermission(PERMISSIONS.DATA_PETANI_DELETE),
  deleteDaftarTani
);

router.post('/laporan-tani/add', auth, upload.single('fotoTanaman'), tambahLaporanTani);
router.get('/laporan-petani', auth, laporanPetani);
router.get('/laporan-penyuluh', auth, laporanPenyuluh);
router.post('/tanaman-petani', auth, tambahTanamanPetani);
router.get('/tanaman-petani/detail/:id', auth, getTanamanPetaniById);
router.get('/statistik/', auth, getAllDataTanaman);
router.get('/tanaman-petani/:id', auth, getLaporanPetani);
router.put('/tanaman-petani/:id', auth, ubahTanamanPetaniById);
router.delete('/tanaman-petani/:id', auth, deleteTanamanPetaniById);
router.post('/upload-data-petani', auth, upload.single('file'), uploadDataPetani);

// Data tanaman petani
router.get(
  '/list-tanaman',
  auth,
  hasPermission(PERMISSIONS.TANAMAN_PETANI_INDEX),
  getAllTanamanPetani
);
router.put(
  '/list-tanaman/:id',
  auth,
  hasPermission(PERMISSIONS.TANAMAN_PETANI_EDIT),
  editDataTanamanPetani
);
router.get(
  '/list-tanaman/:id',
  auth,
  hasPermission(PERMISSIONS.TANAMAN_PETANI_DETAIL),
  getDetailedDataTanamanPetani
);
router.post(
  '/list-tanaman',
  auth,
  hasPermission(PERMISSIONS.TANAMAN_PETANI_CREATE),
  tambahDataTanamanPetani
);
router.post(
  '/upload-tanaman',
  auth,
  hasPermission(PERMISSIONS.TANAMAN_PETANI_CREATE),
  upload.single('file'),
  uploadDataTanamanPetani
);
router.delete(
  '/list-tanaman/:id',
  auth,
  hasPermission(PERMISSIONS.TANAMAN_PETANI_DELETE),
  deleteDatatanamanPetani
);

module.exports = router;
