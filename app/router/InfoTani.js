const router = require('express').Router();
const { PERMISSIONS } = require('../../helpers/roleHelpers');
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  infoTani,
  tambahInfoTani,
  eventTani,
  tambahEventTani,
  deleteInfoTani,
  deleteEventTani,
  infoTaniById,
  eventTaniById,
  updateEventTani,
  updateInfoTani
} = require('../controllers/InfoTani');

router.post(
  '/info-tani/add',
  auth,
  hasPermission(PERMISSIONS.BERITA_PETANI_CREATE),
  upload.single('fotoBerita'),
  tambahInfoTani
);
router.get('/info-tani/:id', infoTaniById);
router.get('/info-tani', infoTani);
router.put(
  '/info-tani/:id',
  auth,
  hasPermission(PERMISSIONS.BERITA_PETANI_EDIT),
  upload.single('fotoBeritaBaru'),
  updateInfoTani
);
router.delete(
  '/info-tani/:id',
  auth,
  hasPermission(PERMISSIONS.BERITA_PETANI_DELETE),
  deleteInfoTani
);

router.post(
  '/event-tani/add',
  auth,
  hasPermission(PERMISSIONS.ACARA_PETANI_CREATE),
  upload.single('fotoKegiatan'),
  tambahEventTani
);
router.get('/event-tani', eventTani);
router.get('/event-tani/:id', eventTaniById);
router.delete(
  '/event-tani/:id',
  auth,
  hasPermission(PERMISSIONS.ACARA_PETANI_DELETE),
  deleteEventTani
);
router.put(
  '/event-tani/:id',
  auth,
  hasPermission(PERMISSIONS.ACARA_PETANI_EDIT),
  upload.single('fotoKegiatanBaru'),
  updateEventTani
);

module.exports = router;
