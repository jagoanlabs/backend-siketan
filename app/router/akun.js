const router = require('express').Router();
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  login,
  register,
  loginPetani,
  setPetaniPassword,
  registerPetani,
  getUserNotVerify,
  // verifikasi,
  getProfile,
  getDetailProfile,
  updateDetailProfile,
  getPeran,
  ubahPeran,
  getMetaUserRole,
  opsiPenyuluh,
  opsiPoktan,
  changeKecamatanToId,
  changeDesaToId
  // verifikasiUser,
} = require('../controllers/akun');
const { PERMISSIONS } = require('../../helpers/roleHelpers');
router.post('/login', login);
router.post('/register', upload.single('foto'), register);
router.post('/petani-login', loginPetani); //login tani
router.post('/set-petani-password', setPetaniPassword);
router.post('/petani-register', upload.single('foto'), registerPetani); //register tani
router.get('/populate-penyuluh', opsiPenyuluh);
router.get('/populate-poktan', opsiPoktan);
router.get('/profile', getProfile);
router.get('/detailprofile', auth, getDetailProfile);
router.post('/updateprofile', auth, upload.single('foto'), updateDetailProfile);
router.get('/verify', getUserNotVerify);
// router.get('/verify/:id', verifikasi);
router.get('/peran/meta', auth, hasPermission(PERMISSIONS.UBAH_HAK_AKSES_INDEX), getMetaUserRole); //get meta role user count all role
router.get('/peran', auth, hasPermission(PERMISSIONS.UBAH_HAK_AKSES_INDEX), getPeran);
router.put('/peran/:id', auth, hasPermission(PERMISSIONS.UBAH_HAK_AKSES_EDIT), ubahPeran); //update to approve or reject user
router.put('/fix/kecamatan', auth, changeKecamatanToId);
router.put('/fix/desa', auth, changeDesaToId);
// router.put("/verify/:id", verifikasiUser)

module.exports = router;
