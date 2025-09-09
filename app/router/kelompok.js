const router = require('express').Router();
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  uploadDataKelompoks,
  getAllKelompok,
  getAllKecamatan,
  getAllDesaInKecamatan,
  deleteKelompok,
  getKelompokById,
  editKelompokById,
  changeKecamatanToId,
  changeDesaToId,
  getMetaKelompok
} = require('../controllers/kelompok');
const { PERMISSIONS } = require('../../helpers/roleHelpers');
// router.get();
router.get('/', auth, hasPermission(PERMISSIONS.DATA_KELOMPOK_INDEX), getAllKelompok);
router.get('/meta', auth, getMetaKelompok);
router.get('/kecamatan', auth, getAllKecamatan);
router.get('/desa', auth, getAllDesaInKecamatan);
router.get('/:id', auth, hasPermission(PERMISSIONS.DATA_KELOMPOK_INDEX), getKelompokById);
router.put('/:id', auth, hasPermission(PERMISSIONS.DATA_KELOMPOK_EDIT), editKelompokById);
router.delete('/:id', auth, hasPermission(PERMISSIONS.DATA_KELOMPOK_DELETE), deleteKelompok);
router.put('/fix/kecamatan', auth, changeKecamatanToId);
router.put('/fix/desa', auth, changeDesaToId);
router.post(
  '/upload',
  auth,
  hasPermission(PERMISSIONS.DATA_KELOMPOK_CREATE),
  upload.single('file'),
  uploadDataKelompoks
);

module.exports = router;
