const {
  dataPetani,
  kelompok,
  dataPenyuluh,
  tanamanPetani,
  sequelize,
  Sequelize
} = require('../models');

const { Op } = Sequelize;

const normalizeKomoditas = (komoditas) => {
  if (!komoditas) return null;

  const normalized = komoditas
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  const komoditasMap = {
    padi: 'padi_konvensional',
    padi_konvensional: 'padi_konvensional',
    padi_ramah_lingkungan: 'padi_ramah_lingkungan',
    padi_organik: 'padi_organik',
    jagung: 'jagung',
    kedelai: 'kedelai',
    kedelei: 'kedelai',
    ubi_jalar: 'ubi_jalar',
    ubi: 'ubi_jalar',
    singkong: 'singkong',
    ubi_kayu: 'singkong',
    kacang_tanah: 'kacang_tanah',
    kacang_hijau: 'kacang_hijau',
    cabai: 'cabai',
    cabe: 'cabai',
    bawang_merah: 'bawang_merah',
    bawang_putih: 'bawang_putih',
    tomat: 'tomat',
    kentang: 'kentang',
    wortel: 'wortel',
    sayuran: 'sayuran_lain',
    lainnya: 'lainnya'
  };

  return komoditasMap[normalized] || normalized;
};

const getLandingStatistik = async (req, res) => {
  try {
    const { tahun = new Date().getFullYear() } = req.query;

    const jumlahPetani = await dataPetani.count({ where: { deletedAt: null } });

    const jumlahGapoktan = await kelompok.count();

    const jumlahPenyuluh = await dataPenyuluh.count({ where: { deletedAt: null } });

    const areaPertanian = await tanamanPetani.sum('luasLahan', { where: { deletedAt: null } });

    const komoditasData = await tanamanPetani.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('komoditas')), 'komoditas']],
      where: { deletedAt: null, komoditas: { [Op.not]: null, [Op.ne]: '' } },
      raw: true
    });
    const jumlahKomoditas = komoditasData.length;

    const dataKomoditasPerBulan = await tanamanPetani.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'bulan'],
        'komoditas',
        [sequelize.fn('SUM', sequelize.col('luasLahan')), 'totalLuasLahan'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'jumlah']
      ],
      where: {
        deletedAt: null,
        createdAt: { [Op.between]: [new Date(`${tahun}-01-01`), new Date(`${tahun}-12-31`)] },
        komoditas: { [Op.not]: null, [Op.ne]: '' }
      },
      group: [sequelize.fn('MONTH', sequelize.col('createdAt')), 'komoditas'],
      raw: true
    });

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des'
    ];

    const commodityData = months.map((month, index) => {
      const monthData = {
        month: month,
        commodities: {
          padi_konvensional: 0,
          padi_ramah_lingkungan: 0,
          padi_organik: 0,
          jagung: 0,
          kedelai: 0,
          ubi_jalar: 0,
          singkong: 0,
          kacang_tanah: 0,
          kacang_hijau: 0,
          cabai: 0,
          bawang_merah: 0,
          bawang_putih: 0,
          tomat: 0,
          kentang: 0,
          wortel: 0,
          sayuran_lain: 0,
          lainnya: 0
        }
      };

      const monthDataFromDB = dataKomoditasPerBulan.filter(
        (item) => parseInt(item.bulan) === index + 1
      );

      monthDataFromDB.forEach((item) => {
        const normalizedKomoditas = normalizeKomoditas(item.komoditas);
        if (normalizedKomoditas && monthData.commodities[normalizedKomoditas]) {
          monthData.commodities[normalizedKomoditas] = parseFloat(item.totalLuasLahan) || 0;
        } else if (normalizedKomoditas) {
          monthData.commodities.lainnya += parseFloat(item.totalLuasLahan) || 0;
        }
      });

      return monthData;
    });

    res
      .status(200)
      .json({
        success: true,
        message: 'Data statistik landing page berhasil diambil',
        data: {
          ringkasan: {
            jumlahPetani: jumlahPetani || 0,
            jumlahGapoktan: jumlahGapoktan || 0,
            jumlahPenyuluh: jumlahPenyuluh || 0,
            areaPertanian: areaPertanian ? parseFloat(areaPertanian) : 0,
            jumlahKomoditas: jumlahKomoditas || 0
          },
          commodityData: commodityData
        }
      });
  } catch (error) {
    console.error('Error getting landing statistics:', error);
    res
      .status(500)
      .json({ success: false, message: 'Gagal mengambil data statistik', error: error.message });
  }
};

module.exports = { getLandingStatistik };
