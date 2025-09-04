const router = require('express').Router();
const { auth, hasPermission } = require('../../midleware/auth');
const {
  usersAll,
  searchPoktan,
  searchPetani,
  userVerify,
  getMetaUser,
  updateAccount,
  deleteUser
} = require('../controllers/users');
const { PERMISSIONS } = require('../../helpers/roleHelpers');
router.get('/users', auth, usersAll);
router.get('/search/poktan', searchPoktan);
router.get('/search/petani', searchPetani);
router.get('/verify', auth, hasPermission(PERMISSIONS.VERIFIKASI_USER_INDEX), userVerify); //list verifikasi user
router.get('/verify/meta', auth, getMetaUser);
router.put('/verify/:id', auth, hasPermission(PERMISSIONS.VERIFIKASI_USER_APPROVE), updateAccount); // ketika user di terima
router.delete(
  '/delete-user/:id',
  auth,
  hasPermission(PERMISSIONS.VERIFIKASI_USER_REJECT),
  deleteUser
); //ketika user di tolak
module.exports = router;
