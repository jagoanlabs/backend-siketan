const { dataPenyuluh, penjual, tbl_akun: tblAkun, dataPetani } = require('../models');
const ApiError = require('../../utils/ApiError');
const imageKit = require('../../midleware/imageKit');
const { postActivity } = require('./logActivity');
const { Op } = require('sequelize');

const tambahDaftarPenjual = async (req, res) => {
  try {
    const { nik, profesiPenjual, namaProducts, stok, satuan, harga, deskripsi, status } = req.body;

    const { id: penjualId } = req.params;
    const { id: UserId } = req.user;

    let id;
    if (!nik) throw new ApiError(400, 'NIK tidak boleh kosong');

    if (profesiPenjual == 'penyuluh') {
      const person = await dataPenyuluh.findOne({
        where: { nik }
      });
      if (!person) throw new ApiError(400, `data dengan NIK ${nik} tidak terdaftar`);
      id = person.accountID;
    } else {
      const person = await dataPetani.findOne({
        where: { nik }
      });
      if (!person) throw new ApiError(400, `data dengan NIK ${nik} tidak terdaftar`);
      id = person.accountID;
    }
    const { file } = req;
    let imageUrl = null;
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        return res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format'
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`
      });
      imageUrl = img.url;
    }

    if (penjualId === 'add') {
      const newPenjual = await penjual.create({
        profesiPenjual,
        namaProducts,
        stok,
        satuan: satuan === '' ? 'Pcs' : satuan,
        harga,
        deskripsi,
        fotoTanaman: imageUrl,
        status,
        accountID: id
      });

      postActivity({
        user_id: UserId,
        activity: 'CREATE',
        type: 'PENJUAL',
        detail_id: newPenjual.id
      });

      const dataPenjual = await penjual.findOne({
        where: { id: newPenjual.id },
        include: [
          {
            model: tblAkun
          }
        ]
      });

      return res.status(200).json({
        message: 'Berhasil Membuat Data Penjual',
        dataPenjual
      });
    } else {
      const dataPenjual = await penjual.findOne({
        where: { id: penjualId },
        include: [
          {
            model: tblAkun
          }
        ]
      });

      await dataPenjual.update({
        profesiPenjual,
        namaProducts,
        stok,
        satuan: satuan === '' ? 'Pcs' : satuan,
        harga,
        deskripsi,
        fotoTanaman: imageUrl,
        status,
        accountID: id
      });

      postActivity({
        user_id: UserId,
        activity: 'EDIT',
        type: 'PENJUAL',
        detail_id: dataPenjual.id
      });

      return res.status(200).json({
        message: 'Berhasil Memperbarui Data Penjual',
        dataPenjual
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const productPetani = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    const limitFilter = Number(limit);
    const pageFilter = Number(page);

    const query = {
      include: [
        {
          model: tblAkun,
          attributes: {
            exclude: ['password']
          },
          include: [
            {
              model: dataPetani,
              as: 'petani' // 👈 Tambahkan alias ini
            },
            {
              model: dataPenyuluh,
              as: 'penyuluh' // 👈 Tambahkan alias ini juga
            }
          ]
        }
      ],
      where: {},
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter
    };

    // kalau ada search, filter namaProduct (penjual) atau namaLengkap (tblAkun)
    if (search) {
      query.where = {
        [Op.or]: [
          { namaProducts: { [Op.like]: `%${search}%` } }, // cari di penjual
          { '$tbl_akun.nama$': { [Op.like]: `%${search}%` } } // cari di relasi tblAkun
        ]
      };
    }

    const data = await penjual.findAll(query);

    const total = await penjual.count({
      ...query,
      distinct: true // biar nggak double count karena join
    });

    res.status(200).json({
      message: 'Berhasil Mendapatkan Product Petani',
      data,
      total,
      currentPages: pageFilter,
      limit: limitFilter,
      maxPages: Math.ceil(total / limitFilter),
      from: (pageFilter - 1) * limitFilter + 1,
      to: (pageFilter - 1) * limitFilter + data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getDetailProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await penjual.findOne({
      where: {
        id
      },
      include: [
        {
          model: tblAkun,
          include: [
            {
              model: dataPetani,
              as: 'petani'
            },
            {
              model: dataPenyuluh,
              as: 'penyuluh'
            }
          ]
        }
      ]
    });

    if (!data) throw new ApiError(404, 'Data Tidak Ditemukan');
    res.status(200).json({
      message: 'Berhasil Mendapatkan Detail Produk',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: UserId } = req.user;
    const data = await penjual.destroy({
      where: {
        id
      }
    });

    postActivity({
      user_id: UserId,
      activity: 'DELETE',
      type: 'PENJUAL',
      detail_id: id
    });

    res.status(200).json({
      message: 'Berhasil Menghapus Data Penjual',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const productPenyuluh = async (req, res) => {
  try {
    const data = await penjual.findAll({
      include: [
        {
          model: tblAkun,
          required: true
        }
      ],
      where: {
        profesiPenjual: 'Penyuluh'
      }
    });
    res.status(200).json({
      message: 'Berhasil Mendapatkan Product Penyuluh',
      productPenyuluh: data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const listProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await penjual.findAll({
      include: [
        {
          model: tblAkun,
          required: true,
          where: { id } // Filter berdasarkan ID user di tblAkun
        }
      ]
    });

    res.status(200).json({
      message: 'Berhasil Mendapatkan List Product',
      data: products
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getDetailProdukByName = async (req, res) => {
  try {
    const { name } = req.params;

    const products = await penjual.findAll({
      include: [
        {
          model: tblAkun,
          required: true,
          where: { name } // Filter berdasarkan nama di tblAkun
        }
      ]
    });

    res.status(200).json({
      message: 'Berhasil Mendapatkan List Product',
      data: products
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const listToko = async (req, res) => {
  try {
    const toko = await penjual.findAll({
      include: [
        {
          model: tblAkun,
          required: true
        }
      ],
      group: ['tbl_akun.id'] // supaya 1 akun sekali
    });

    res.status(200).json({
      message: 'Berhasil Mendapatkan List Product',
      data: toko
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const metaProductPetani = async (req, res) => {
  try {
    // total semua produk
    const totalProduct = await penjual.count({
      distinct: true
    });

    // total product dari petani
    const totalProductPetani = await penjual.count({
      include: [
        {
          model: tblAkun,
          required: true,
          attributes: [],
          where: { peran: 'petani' } // filter langsung ke role
        }
      ],
      distinct: true
    });

    // total product dari penyuluh
    const totalProductPenyuluh = await penjual.count({
      include: [
        {
          model: tblAkun,
          required: true,
          attributes: [],
          where: { peran: 'penyuluh' } // filter langsung ke role
        }
      ],
      distinct: true
    });

    res.status(200).json({
      message: 'Berhasil Mendapatkan Meta Product',
      data: {
        totalProduct,
        totalProductPetani,
        totalProductPenyuluh
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  metaProductPetani,
  tambahDaftarPenjual,
  productPetani,
  productPenyuluh,
  deleteProduk,
  getDetailProduk,
  listToko,
  listProduk,
  getDetailProdukByName
};
