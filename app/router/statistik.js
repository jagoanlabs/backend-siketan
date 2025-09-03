const router = require('express').Router();
const { PERMISSIONS } = require('../../helpers/roleHelpers');
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDataTanaman,
  getAllDataTanaman,
  getDetailedDataTanaman,
  editDataTanaman,
  hapusDataTanaman,
  uploadDataTanaman,
  fixKategori,
  fixKomoditas
} = require('../controllers/dataTanaman');

router.post('/', hasPermission(PERMISSIONS.STATISTIC_CREATE), auth, tambahDataTanaman);
router.get('/', hasPermission(PERMISSIONS.STATISTIC_INDEX), auth, getAllDataTanaman);
router.get('/:id', hasPermission(PERMISSIONS.STATISTIC_INDEX), auth, getDetailedDataTanaman);
router.put('/:id', hasPermission(PERMISSIONS.STATISTIC_EDIT), auth, editDataTanaman);
router.delete('/:id', hasPermission(PERMISSIONS.STATISTIC_DELETE), auth, hapusDataTanaman);
router.post(
  '/upload',
  hasPermission(PERMISSIONS.STATISTIC_CREATE),
  auth,
  upload.single('file'),
  uploadDataTanaman
);
router.put('/fix/category', hasPermission(PERMISSIONS.STATISTIC_EDIT), auth, fixKategori);
router.put('/fix/commodity', auth, fixKomoditas);

module.exports = router;
