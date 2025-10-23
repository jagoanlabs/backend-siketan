const { dataTanaman, kelompok } = require('../models');

const ApiError = require('../../utils/ApiError');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { postActivity } = require('./logActivity');
const {
  tanamanPangan,
  tanamanPerkebunan,
  komoditasSemusim,
  komoditasTahunan
} = require('../../utils/constants/tanaman');
const monthOrder = require('../../utils/constants/months');

dotenv.config();

const getAllDataTanaman = async (req, res) => {
  const { peran } = req.user || {};
  const { limit, page, sortBy, sortType, poktan_id, isExport, search, kategori, komoditas } =
    req.query;

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const limitFilter = Number(limit) || 10;
    const pageFilter = Number(page) || 1;
    const isExportFilter = Boolean(isExport);

    // base filter
    const whereClause = {};

    // filter poktan
    if (poktan_id && poktan_id !== 'undefined') {
      whereClause.fk_kelompokId = { [Op.eq]: poktan_id };
    }

    // filter kategori
    if (kategori && kategori !== 'undefined') {
      whereClause.kategori = { [Op.like]: `%${kategori}%` };
    }

    // filter komoditas
    if (komoditas && komoditas !== 'undefined') {
      whereClause.komoditas = { [Op.like]: `%${komoditas}%` };
    }

    // pencarian umum (kategori / komoditas / periodeTanam / kelompok.namaKelompok)
    if (search && search !== 'undefined') {
      whereClause[Op.or] = [
        { kategori: { [Op.like]: `%${search}%` } },
        { komoditas: { [Op.like]: `%${search}%` } },
        { periodeTanam: { [Op.like]: `%${search}%` } },
        { '$kelompok.namaKelompok$': { [Op.like]: `%${search}%` } }
      ];
    }

    const filter = {
      where: whereClause,
      include: [{ model: kelompok, as: 'kelompok', required: true }],
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter,
      order: [[sortBy || 'id', sortType || 'DESC']]
    };

    const data = await dataTanaman.findAll(
      isExportFilter
        ? { where: whereClause, include: [{ model: kelompok, as: 'kelompok', required: true }] }
        : filter
    );

    const total = await dataTanaman.count({
      where: whereClause,
      include: [{ model: kelompok, as: 'kelompok', required: true }],
      distinct: true
    });

    res.status(200).json({
      message: 'Data berhasil didapatkan.',
      data: {
        data,
        total,
        currentPages: pageFilter,
        limit: limitFilter,
        maxPages: Math.ceil(total / limitFilter),
        from: pageFilter ? (pageFilter - 1) * limitFilter + 1 : 1,
        to: pageFilter ? (pageFilter - 1) * limitFilter + data.length : data.length,
        sortBy: sortBy || 'id',
        sortType: sortType || 'DESC'
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const fixKategori = async (req, res) => {
  const { peran } = req.user || {};
  const { category } = req.query;
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const whereFilter = category ? { where: { kategori: category } } : {};
    const data = await dataTanaman.findAll(whereFilter);

    if (whereFilter.where) {
      return res.status(200).json({ message: 'Data berhasil didapatkan.', data });
    }

    data.forEach(async (item) => {
      let correctCategory = '';
      if (tanamanPangan.includes(item.komoditas)) {
        correctCategory = 'pangan';
      } else if (
        tanamanPerkebunan.includes(item.komoditas) ||
        item.komoditas.toLowerCase().includes('perkebunan')
      ) {
        correctCategory = 'perkebunan';
      } else if (komoditasSemusim.includes(item.komoditas)) {
        correctCategory = 'buah';
      } else if (komoditasTahunan.includes(item.komoditas)) {
        correctCategory = 'sayur';
      }
      await item.update({ kategori: correctCategory });
    });

    res.status(200).json({ message: 'Data berhasil diupdate.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const fixKomoditas = async (req, res) => {
  const { peran } = req.user || {};
  const { wrongKomoditas, correctKomoditas, getWrong, debug } = req.query;
  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (getWrong) {
      const correctKomoditas = tanamanPangan
        .concat(tanamanPerkebunan)
        .concat(komoditasSemusim)
        .concat(komoditasTahunan)
        .concat(['Perkebunan Tebu', 'Perkebunan Tembakau']);
      return res.status(200).json({
        message: 'Data berhasil didapatkan.',
        data: await dataTanaman.findAll({
          where: { komoditas: { [Op.notIn]: correctKomoditas } }
        })
      });
    }

    const data = await dataTanaman.findAll({ where: { komoditas: wrongKomoditas } });
    if (debug) {
      return res.status(200).json({ message: 'Data berhasil didapatkan.', data });
    }
    data.forEach(async (item) => {
      await item.update({ komoditas: correctKomoditas });
    });

    res.status(200).json({ message: 'Data berhasil diupdate.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getDetailedDataTanaman = async (req, res) => {
  const { id } = req.params;
  const { peran } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const data = await dataTanaman.findOne({
      where: { id },
      include: [{ model: kelompok, as: 'kelompok' }]
    });

    res.status(200).json({ message: 'Data berhasil didapatkan.', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const tambahDataTanaman = async (req, res) => {
  const { peran, id } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }
    const {
      kategori,
      komoditas,
      periodeTanam,
      luasLahan,
      prakiraanLuasPanen,
      prakiraanHasilPanen,
      prakiraanBulanPanen,
      fk_kelompokId
    } = req.body;

    if (!kategori) throw new ApiError(400, 'Kategori tidak boleh kosong.');
    if (!komoditas) throw new ApiError(400, 'Komoditas tidak boleh kosong.');
    if (!periodeTanam) throw new ApiError(400, 'Periode tanam tidak boleh kosong.');
    if (!luasLahan) throw new ApiError(400, 'Luas lahan tidak boleh kosong.');
    if (!prakiraanLuasPanen) throw new ApiError(400, 'Prakiraan luas panen tidak boleh kosong.');
    if (!prakiraanHasilPanen) throw new ApiError(400, 'Prakiraan hasil panen tidak boleh kosong.');
    if (!prakiraanBulanPanen) throw new ApiError(400, 'Prakiraan bulan panen tidak boleh kosong.');
    if (!fk_kelompokId) throw new ApiError(400, 'Kelompok tidak boleh kosong.');

    const kelompokTani = await kelompok.findOne({ where: { id: fk_kelompokId } });
    if (!kelompokTani) throw new ApiError(400, 'Kelompok tidak ditemukan.');

    const data = await dataTanaman.create({
      kategori,
      komoditas,
      periodeTanam,
      luasLahan,
      prakiraanLuasPanen,
      prakiraanHasilPanen,
      prakiraanBulanPanen,
      fk_kelompokId
    });

    postActivity({ user_id: id, activity: 'CREATE', type: 'DATA TANAMAN', detail_id: data.id });

    res.status(201).json({ message: 'Data berhasil ditambahkan.', data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const editDataTanaman = async (req, res) => {
  const { id } = req.params;
  const { peran, id: UserId } = req.user || {};

  try {
    if (peran === 'petani' || peran === 'penyuluh' || peran === 'operator poktan') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }
    const {
      kategori,
      komoditas,
      periodeTanam,
      luasLahan,
      prakiraanLuasPanen,
      prakiraanHasilPanen,
      prakiraanBulanPanen,
      fk_kelompokId,
      realisasiLuasPanen,
      realisasiHasilPanen,
      realisasiBulanPanen
    } = req.body;

    if (!kategori) throw new ApiError(400, 'Kategori tidak boleh kosong.');
    if (!komoditas) throw new ApiError(400, 'Komoditas tidak boleh kosong.');
    if (!periodeTanam) throw new ApiError(400, 'Periode tanam tidak boleh kosong.');
    if (!luasLahan) throw new ApiError(400, 'Luas lahan tidak boleh kosong.');
    if (!prakiraanLuasPanen) throw new ApiError(400, 'Prakiraan luas panen tidak boleh kosong.');
    if (!prakiraanHasilPanen) throw new ApiError(400, 'Prakiraan hasil panen tidak boleh kosong.');
    if (!prakiraanBulanPanen) throw new ApiError(400, 'Prakiraan bulan panen tidak boleh kosong.');
    if (!fk_kelompokId) throw new ApiError(400, 'Kelompok tidak boleh kosong.');

    const kelompokTani = await kelompok.findOne({ where: { id: fk_kelompokId } });
    if (!kelompokTani) throw new ApiError(400, 'Kelompok tidak ditemukan.');

    await dataTanaman.update(
      {
        kategori,
        komoditas,
        periodeTanam,
        luasLahan,
        prakiraanLuasPanen,
        prakiraanHasilPanen,
        prakiraanBulanPanen,
        fk_kelompokId,
        realisasiLuasPanen,
        realisasiHasilPanen,
        realisasiBulanPanen
      },
      { where: { id } }
    );

    postActivity({ user_id: UserId, activity: 'EDIT', type: 'DATA TANAMAN', detail_id: id });

    res.status(201).json({ message: 'Data berhasil diupdate.', data: req.body });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const hapusDataTanaman = async (req, res) => {
  const { id } = req.params;
  const { peran, id: UserId } = req.user || {};

  try {
    if (peran === 'petani' || peran === 'penyuluh' || peran === 'operator poktan') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    await dataTanaman.destroy({ where: { id } });

    postActivity({ user_id: UserId, activity: 'DELETE', type: 'DATA TANAMAN', detail_id: id });

    res.status(200).json({ message: 'Data berhasil dihapus.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const uploadDataTanaman = async (req, res) => {
  const { peran } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const { file } = req;
    if (!file) throw new ApiError(400, 'File tidak ditemukan.');

    // Validasi tipe file
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(
        400,
        'Format file tidak valid. Harap upload file Excel (.xlsx atau .xls).'
      );
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(file.buffer);
    } catch (error) {
      throw new ApiError(
        400,
        'File Excel tidak valid atau rusak. Pastikan file dalam format .xlsx yang benar.'
      );
    }
    const worksheet = workbook.getWorksheet(1);

    const rowCount = worksheet.rowCount;
    if (rowCount < 2) throw new ApiError(400, 'Data tidak ditemukan.');

    for (let i = 2; i <= rowCount; i++) {
      const row = worksheet.getRow(i);

      let isRowEmpty = true;
      for (let j = 1; j <= 11; j++) {
        if (row.getCell(j).value) {
          isRowEmpty = false;
          break;
        }
      }
      if (isRowEmpty) {
        continue;
      }

      const fk_kelompokId = row.getCell(1).value;
      const kategori = row.getCell(2).value;
      const komoditas = row.getCell(3).value;
      const periodeTanam = row.getCell(4).value;
      const luasLahan = row.getCell(5).value;
      const prakiraanLuasPanen = row.getCell(6).value;
      const prakiraanHasilPanen = row.getCell(7).value;
      const prakiraanBulanPanen = row.getCell(8).value;
      const realisasiLuasPanen = row.getCell(9).value;
      const realisasiHasilPanen = row.getCell(10).value;
      const realisasiBulanPanen = row.getCell(11).value;

      if (!['pangan', 'perkebunan', 'sayur', 'buah'].includes(kategori))
        throw new ApiError(400, 'Kategori tidak valid.');
      if (
        !tanamanPangan
          .concat(tanamanPerkebunan)
          .concat(komoditasSemusim)
          .concat(komoditasTahunan)
          .concat(['Perkebunan Tembakau', 'Perkebunan Tebu'])
          .includes(komoditas)
      )
        throw new ApiError(
          400,
          `Komoditas (${komoditas}) tidak valid. Data ke-${i - 1} (baris ${i})`
        );
      if (!monthOrder.includes(periodeTanam))
        throw new ApiError(400, `Periode tanam tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (!luasLahan || isNaN(luasLahan))
        throw new ApiError(400, `Luas lahan tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (!prakiraanLuasPanen || isNaN(prakiraanLuasPanen))
        throw new ApiError(400, `Prakiraan luas panen tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (!prakiraanHasilPanen || isNaN(prakiraanHasilPanen))
        throw new ApiError(400, `Prakiraan hasil panen tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (prakiraanBulanPanen && !monthOrder.includes(prakiraanBulanPanen))
        throw new ApiError(400, `Prakiraan bulan panen tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (realisasiLuasPanen && isNaN(realisasiLuasPanen))
        throw new ApiError(400, `Realisasi luas panen tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (realisasiHasilPanen && isNaN(realisasiHasilPanen))
        throw new ApiError(400, `Realisasi hasil panen tidak valid. Data ke-${i - 1} (baris ${i})`);
      if (realisasiBulanPanen && !monthOrder.includes(realisasiBulanPanen))
        throw new ApiError(400, `Realisasi bulan panen tidak valid. Data ke-${i - 1} (baris ${i})`);

      const kelompokTani = await kelompok.findOne({ where: { id: fk_kelompokId } });

      if (!kelompokTani)
        throw new ApiError(
          400,
          `Kelompok (${fk_kelompokId}) tidak ditemukan.  Data ke-${i - 1} (baris ${i})`
        );
      await dataTanaman.create({
        fk_kelompokId,
        kategori,
        komoditas,
        periodeTanam,
        luasLahan,
        prakiraanLuasPanen,
        prakiraanHasilPanen,
        prakiraanBulanPanen,
        realisasiLuasPanen,
        realisasiHasilPanen,
        realisasiBulanPanen
      });
    }

    res.status(201).json({ message: 'Data berhasil ditambahkan.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  tambahDataTanaman,
  getAllDataTanaman,
  getDetailedDataTanaman,
  editDataTanaman,
  hapusDataTanaman,
  uploadDataTanaman,
  fixKategori,
  fixKomoditas
};
