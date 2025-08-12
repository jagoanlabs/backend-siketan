const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
  deleteProduk,
  getDetailProduk,
  listProduk,
  getDetailProdukByName,
  listToko
} = require('../controllers/tokoTani');

router.post('/daftar-penjual/:id', auth, upload.single('fotoTanaman'), tambahDaftarPenjual);
router.get('/product-penyuluh', auth, productPenyuluh);
router.get('/product-petani', auth, productPetani);
router.get('/product-petani-no-auth', productPetani);
router.get('/product-petani/:id', getDetailProduk);
router.get('/list-product/:id', listProduk); //list product by id account
router.get('/list-toko', listToko);
router.get('/list-product/:name', getDetailProdukByName);

router.delete('/product-petani/:id', auth, deleteProduk);

module.exports = router;
