const router = require('express').Router();
const { auth, hasPermission, isOwner } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  login,
  register,
  registerPenyuluh,
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
router.post('/login', login); // -> login
router.post('/register', upload.single('foto'), register);
router.post('/register-penyuluh', upload.single('foto'), registerPenyuluh); // -> register penyuluh
router.post('/petani-login', loginPetani); //login tani
router.post('/set-petani-password', setPetaniPassword);
router.post('/petani-register', upload.single('foto'), registerPetani); //register tani
router.get('/populate-penyuluh', opsiPenyuluh);
router.get('/populate-poktan', opsiPoktan);
router.get('/profile', getProfile); 
router.get('/detailprofile', auth, getDetailProfile); // -> get detail profile
router.post('/updateprofile', auth, isOwner, upload.single('foto'), updateDetailProfile); //update detail profile
router.get('/verify', getUserNotVerify); // -> get user not verify
// router.get('/verify/:id', verifikasi);
router.get('/peran/meta', auth, hasPermission(PERMISSIONS.UBAH_HAK_AKSES_INDEX), getMetaUserRole); //-> get peran meta //get meta role user count all role
router.get('/peran', auth, hasPermission(PERMISSIONS.UBAH_HAK_AKSES_INDEX), getPeran); // -> get peran
router.put('/peran/:id', auth, hasPermission(PERMISSIONS.UBAH_HAK_AKSES_EDIT), ubahPeran); // --> update peran/approve  //update to approve or reject user
router.put('/fix/kecamatan', auth, changeKecamatanToId);
router.put('/fix/desa', auth, changeDesaToId);
// router.put("/verify/:id", verifikasiUser)

module.exports = router;
