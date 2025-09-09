const router = require('express').Router();
const { PERMISSIONS } = require('../../helpers/roleHelpers');
const { auth, hasPermission } = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
  deleteProduk,
  getDetailProduk,
  listProduk,
  getDetailProdukByName,
  listToko,
  metaProductPetani
} = require('../controllers/tokoTani');

router.post(
  '/daftar-penjual/:id',
  auth,
  hasPermission(PERMISSIONS.TOKO_PETANI_CREATE),
  upload.single('fotoTanaman'),
  tambahDaftarPenjual
);
router.get(
  '/product-penyuluh',
  auth,
  hasPermission(PERMISSIONS.TOKO_PETANI_INDEX),
  productPenyuluh
);
router.get('/product-petani', auth, hasPermission(PERMISSIONS.TOKO_PETANI_INDEX), productPetani);
router.get('/product-petani-no-auth', productPetani);
router.get('/product-petani/:id', getDetailProduk);
router.get('/list-product/:id', listProduk); //list product by id account
router.get('/list-toko', listToko);
router.get('/list-product/:name', getDetailProdukByName);
router.delete('/product-petani/:id', auth, deleteProduk);
router.get('/meta/product-petani', metaProductPetani);

module.exports = router;
