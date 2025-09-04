const router = require('express').Router();
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const { PERMISSIONS } = require('../../helpers/roleHelpers');
const {
  tambahDataPenyuluh,
  presensiKehadiran,
  jurnalKegiatan,
  RiwayatChat,
  tambahJurnalKegiatan,
  tambahPresensiKehadiran,
  daftarPenyuluh,
  deleteDaftarPenyuluh,
  presensiKehadiranWeb,
  daftarPenyuluhById,
  updatePenyuluh,
  uploadDataPenyuluh,
  opsiPenyuluh,
  jurnalKegiatanbyId,
  deleteJurnalKegiatan,
  updateJurnalKegiatan,
  getKelompok,
  getPetani,
  changeKecamatanToId,
  changeDesaToId,
  refactorWilayahBinaan,
  tambahWilayahBinaan,
  deleteWilayahBinaan
} = require('../controllers/dataPenyuluh');

router.post(
  '/presensi-kehadiran/add',
  auth,
  hasPermission(PERMISSIONS.PENYULUH_CREATE),
  upload.single('FotoKegiatan'),
  tambahPresensiKehadiran
);
router.post(
  '/jurnal-kegiatan/add',
  auth,
  hasPermission(PERMISSIONS.JURNAL_PENYULUH_CREATE),
  upload.single('gambar'),
  tambahJurnalKegiatan
);
router.get(
  '/presensi-kehadiran',
  auth,
  hasPermission(PERMISSIONS.PENYULUH_INDEX),
  presensiKehadiran
);
router.get('/presensi-kehadiran/web', auth, presensiKehadiranWeb);
router.get(
  '/jurnal-kegiatan',
  auth,
  hasPermission(PERMISSIONS.JURNAL_PENYULUH_INDEX),
  jurnalKegiatan
);
router.get(
  '/jurnal-kegiatan/:id',
  auth,
  hasPermission(PERMISSIONS.JURNAL_PENYULUH_DETAIL),
  jurnalKegiatanbyId
);
router.put(
  '/jurnal-kegiatan/:id',
  auth,
  hasPermission(PERMISSIONS.JURNAL_PENYULUH_EDIT),
  upload.single('gambar'),
  updateJurnalKegiatan
);
router.delete(
  '/jurnal-kegiatan/:id',
  auth,
  hasPermission(PERMISSIONS.JURNAL_PENYULUH_DELETE),
  deleteJurnalKegiatan
);
router.get('/riwayat-chat', auth, RiwayatChat);

router.post(
  '/penyuluh/add',
  auth,
  hasPermission(PERMISSIONS.DATA_PENYULUH_CREATE),
  upload.single('foto'),
  tambahDataPenyuluh
);
router.get(
  '/daftar-penyuluh',
  auth,
  hasPermission(PERMISSIONS.DATA_PENYULUH_INDEX),
  daftarPenyuluh
);
router.get(
  '/daftar-penyuluh/:id',
  auth,
  hasPermission(PERMISSIONS.DATA_PENYULUH_DETAIL),
  daftarPenyuluhById
);
router.put(
  '/daftar-penyuluh/:id',
  auth,
  hasPermission(PERMISSIONS.DATA_PENYULUH_EDIT),
  upload.single('foto'),
  updatePenyuluh
);
router.delete(
  '/daftar-penyuluh/:id',
  auth,
  hasPermission(PERMISSIONS.DATA_PENYULUH_DELETE),
  deleteDaftarPenyuluh
);

router.post(
  '/upload-data-penyuluh',
  auth,
  hasPermission(PERMISSIONS.DATA_PENYULUH_CREATE),
  upload.single('file'),
  uploadDataPenyuluh
);

router.get('/opsi-penyuluh', opsiPenyuluh);
router.get('/kelompok-all', getKelompok);
router.get('/daftar-petani/:id', auth, getPetani);
router.put('/penyuluh/fix/kecamatan', auth, changeKecamatanToId);
router.put('/penyuluh/fix/desa', auth, changeDesaToId);
router.put('/penyuluh/fix/wilayahBinaan', auth, refactorWilayahBinaan);
router.post('/penyuluh/wilayah-binaan', auth, tambahWilayahBinaan);
router.delete('/penyuluh/wilayah-binaan', auth, deleteWilayahBinaan);

module.exports = router;
