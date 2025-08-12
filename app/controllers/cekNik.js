const {
  tanamanPetani,
  dataPenyuluh,
  kelompok,
  dataPetani,
  kecamatan,
  desa,
  kecamatanBinaan,
  desaBinaan
} = require('../models');
const ApiError = require('../../utils/ApiError');

const cekNik = async (req, res) => {
  try {
    const { nik } = req.body;
    console.log('NIK yang diterima:', nik);

    // Validasi input
    if (!nik) {
      throw new ApiError(400, 'NIK harus diisi');
    }

    const user = await dataPetani.findOne({
      where: { nik },
      include: [
        { model: tanamanPetani },
        { model: kelompok },
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' }
      ]
    });

    if (!user) {
      throw new ApiError(400, `Data dengan NIK ${nik} tidak ditemukan`); // gunakan 'nik' (lowercase)
    }

    res.status(200).json({
      message: `Data dengan NIK ${nik} ditemukan`, // gunakan 'nik' (lowercase)
      user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};
const cekNiP = async (req, res) => {
  try {
    const { NIP = '' } = req.body;
    const user = await dataPenyuluh.findOne({
      where: { nik: NIP },
      include: [
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' },
        {
          model: kecamatanBinaan,
          as: 'kecamatanBinaanData',
          include: [
            {
              model: kecamatan
            }
          ]
        },
        {
          model: desaBinaan,
          as: 'desaBinaanData',
          include: [
            {
              model: desa,
              include: [
                {
                  model: kecamatan
                }
              ]
            }
          ]
        }
      ]
    });
    if (!user) throw new ApiError(400, `data dengan NIP ${NIP} tidak ditemukan`);

    res.status(200).json({
      message: `data dengan NIP ${NIP} ditemukan`,
      user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = { cekNik, cekNiP };
