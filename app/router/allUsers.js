const router = require('express').Router();
const { auth, requireAdmin } = require('../../midleware/auth');
const {
  usersAll,
  searchPoktan,
  searchPetani,
  userVerify,
  getMetaUser,
  updateAccount,
  deleteUser
} = require('../controllers/users');

router.get('/users', auth, usersAll);
router.get('/search/poktan', searchPoktan);
router.get('/search/petani', searchPetani);
router.get('/verify', auth, requireAdmin, userVerify); //list verifikasi user
router.get('/verify/meta', auth, requireAdmin, getMetaUser);
router.put('/verify/:id', auth, requireAdmin, updateAccount); // ketika user di terima
router.delete('/delete-user/:id', auth, requireAdmin, deleteUser); //ketika user di tolak
module.exports = router;
