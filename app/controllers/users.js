const ApiError = require('../../utils/ApiError');
const {
  dataPerson,
  kelompok,
  tbl_akun,
  dataPetani,
  dataPenyuluh,
  dataOperator,
  kecamatan,
  desa
} = require('../models');
const { Op } = require('sequelize');

const usersAll = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit } = req.query;
  try {
    if (peran === null) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const limitFilter = Number(limit) || 10;
      const pageFilter = Number(page) || 1;

      const query = {
        limit: limitFilter,
        offset: (pageFilter - 1) * limitFilter
      };
      const data = await dataPerson.findAll({ ...query });
      const total = await dataPerson.count({ ...query });
      res.status(200).json({
        message: 'Data User Berhasil Diperoleh',
        data,
        total,
        currentPages: page,
        limit: limitFilter,
        maxPages: Math.ceil(total / (limitFilter || 10)),
        from: pageFilter ? (pageFilter - 1) * limitFilter + 1 : 1,
        to: pageFilter ? (pageFilter - 1) * limitFilter + data.length : data.length
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const userVerify = async (req, res) => {
  const { page, limit, search, sort } = req.query;
  const { peran: userRole } = req.user || {};

  try {
    // Restriksi role
    if (!['operator super admin', 'operator admin'].includes(userRole)) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const pageFilter = Number(page) || 1;
    const limitFilter = Number(limit) || 10;

    // Sorting logic
    let orderFilter = [['id', 'ASC']];
    if (sort === 'verified_desc') {
      orderFilter = [
        ['isVerified', 'DESC'],
        ['id', 'ASC']
      ];
    } else if (sort === 'verified_asc') {
      orderFilter = [
        ['isVerified', 'ASC'],
        ['id', 'ASC']
      ];
    }

    // Allowed roles (tinggal tambah di sini kalau ada role baru)
    const allowedRoles = [
      'petani',
      'penyuluh',
      'penyuluh_swadaya',
      'operator admin',
      'operator poktan'
    ];

    // Search condition
    const searchCondition = search
      ? {
          [Op.or]: [
            { nama: { [Op.like]: `%${search}%` } },
            { no_wa: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { '$petani.NIK$': { [Op.like]: `%${search}%` } },
            { '$penyuluh.NIK$': { [Op.like]: `%${search}%` } },
            { '$operator.NIK$': { [Op.like]: `%${search}%` } }
          ]
        }
      : {};

    // Query data
    const query = {
      include: [
        {
          model: dataPetani,
          as: 'petani',
          required: false,
          attributes: ['NIK']
        },
        {
          model: dataPenyuluh,
          as: 'penyuluh',
          required: false,
          attributes: ['NIK']
        },
        {
          model: dataOperator,
          as: 'operator',
          required: false,
          attributes: ['NIK']
        }
      ],
      where: {
        peran: { [Op.in]: allowedRoles },
        [Op.or]: [
          { '$petani.id$': { [Op.not]: null } },
          { '$penyuluh.id$': { [Op.not]: null } },
          { '$operator.id$': { [Op.not]: null } }
        ],
        ...searchCondition
      },
      attributes: ['id', 'nama', 'peran', 'no_wa', 'email', 'isVerified'],
      order: orderFilter,
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter,
      distinct: true
    };

    const data = await tbl_akun.findAll(query);

    // Query untuk count total
    const total = await tbl_akun.count({
      include: [
        {
          model: dataPetani,
          as: 'petani',
          required: false,
          attributes: []
        },
        {
          model: dataPenyuluh,
          as: 'penyuluh',
          required: false,
          attributes: []
        },
        {
          model: dataOperator,
          as: 'operator',
          required: false,
          attributes: []
        }
      ],
      where: {
        peran: { [Op.in]: allowedRoles },
        [Op.or]: [
          { '$petani.id$': { [Op.not]: null } },
          { '$penyuluh.id$': { [Op.not]: null } },
          { '$operator.id$': { [Op.not]: null } }
        ],
        ...searchCondition
      },
      distinct: true
    });

    res.status(200).json({
      message: data.length > 0 ? 'Data berhasil diambil' : 'Tidak ada data yang sesuai kriteria',
      data,
      total,
      currentPages: pageFilter,
      limit: limitFilter,
      maxPages: Math.ceil(total / limitFilter),
      from: total > 0 ? (pageFilter - 1) * limitFilter + 1 : 0,
      to: total > 0 ? (pageFilter - 1) * limitFilter + data.length : 0
    });
  } catch (error) {
    console.error('Error in userVerify:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};

const updateAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await tbl_akun.findOne({ where: { id } });
    if (!user) throw new ApiError(400, 'user tidak ditemukan');
    await tbl_akun.update(
      { isVerified: true },
      {
        where: {
          id
        }
      }
    );
    // const users = await tblAkun.findOne({ where: { id } });
    return res.status(200).json({
      message: 'User berhasil diverifikasi'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const searchPoktan = async (req, res) => {
  const { search } = req.query;
  try {
    const data = await kelompok.findAll({
      where: {
        [Op.or]: [
          {
            gapoktan: {
              [Op.like]: `%${search}%`
            }
          },
          {
            namaKelompok: {
              [Op.like]: `%${search}%`
            }
          }
        ]
      },
      limit: 10,
      include: [
        {
          model: kecamatan,
          as: 'kecamatanData'
        },
        {
          model: desa,
          as: 'desaData'
        }
      ]
    });
    res.status(200).json({
      message: 'Data semua users berhasil di peroleh',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const searchPetani = async (req, res) => {
  const { search } = req.query;
  try {
    const data = await dataPetani.findAll({
      where: {
        [Op.or]: [
          {
            nik: {
              [Op.like]: `%${search}%`
            }
          }
        ]
      },
      include: [
        {
          model: tbl_akun,
          as: 'tbl_akun'
        },
        {
          model: kelompok,
          as: 'kelompok'
        },
        {
          model: dataPenyuluh,
          as: 'dataPenyuluh'
        },
        {
          model: kecamatan,
          as: 'kecamatanData'
        },
        {
          model: desa,
          as: 'desaData'
        }
      ],
      limit: 10
    });
    res.status(200).json({
      message: 'Data semua users berhasil di peroleh',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

// create function to delete akun on tbl_akun
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user;
  try {
    if (peran !== 'operator super admin' && peran !== 'super admin' && peran !== 'admin') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const data = await tbl_akun.findOne({
        where: {
          id
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      await tbl_akun.destroy({
        where: {
          id
        }
      });
      const penyuluh = await dataPenyuluh.findOne({
        where: {
          accountID: data.accountID
        }
      });
      if (!penyuluh) {
        await dataPetani.destroy({
          where: {
            accountID: data.accountID
          }
        });
      } else {
        await dataPenyuluh.destroy({
          where: {
            accountID: data.accountID
          }
        });
      }
      res.status(200).json({
        message: 'User Berhasil Di Hapus'
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: `gagal menghapus user, ${error.message}`
    });
  }
};

const getMetaUser = async (req, res) => {
  try {
    const totalUser = await tbl_akun.count();
    const totalVerifiedUser = await tbl_akun.count({
      where: {
        isVerified: true
      }
    });
    const totalUnverifiedUser = await tbl_akun.count({
      where: {
        isVerified: false
      }
    });
    res.status(200).json({
      message: 'Meta data user berhasil diperoleh',
      totalUser,
      totalVerifiedUser,
      totalUnverifiedUser
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  usersAll,
  searchPoktan,
  searchPetani,
  userVerify,
  getMetaUser,
  updateAccount,
  deleteUser
};
