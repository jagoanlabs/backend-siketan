const router = require('express').Router();
const auth = require('../../midleware/auth');
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
router.get('/verify', auth, userVerify); //list verifikasi user
router.get('/verify/meta', auth, getMetaUser);
router.put('/verify/:id', auth, updateAccount); // ketika user di terima
router.delete('/delete-user/:id', auth, deleteUser); //ketika user di tolak
module.exports = router;
