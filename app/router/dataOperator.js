const router = require('express').Router();
const { auth, requireAdmin } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDataOperator,
  getDaftarOperator,
  deleteDaftarOperator,
  getOperatorDetail,
  updateOperatorDetail,
  uploadDataOperator
} = require('../controllers/dataOperator');

router.get('/daftar-operator', auth, requireAdmin, getDaftarOperator);
router.get('/daftar-operator/:id', auth, requireAdmin, getOperatorDetail);
router.post('/daftar-operator/add', auth, requireAdmin, upload.single('foto'), tambahDataOperator);
router.put('/daftar-operator/:id', auth, requireAdmin, upload.single('foto'), updateOperatorDetail);
router.delete('/daftar-operator/:id', auth, requireAdmin, deleteDaftarOperator);
router.post('/upload-data-operator', auth, requireAdmin, upload.single('file'), uploadDataOperator);
module.exports = router;
