'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kecamatanBinaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.dataPenyuluh, {
        foreignKey: 'penyuluhId',
        targetKey: 'id'
      });
      this.belongsTo(models.kecamatan, {
        foreignKey: 'kecamatanId',
        targetKey: 'id'
      });
    }
  }
  kecamatanBinaan.init(
    {
      penyuluhId: DataTypes.NUMBER,
      kecamatanId: DataTypes.NUMBER
    },
    {
      sequelize,
      modelName: 'kecamatanBinaan'
    }
  );
  return kecamatanBinaan;
};
/**
 * Model ini memiliki struktur dan fungsi yang hampir identik dengan model desabinaan, namun pada level wilayah yang berbeda (Kecamatan,
  bukan Desa).

  Model dan Fungsi kecamatanBinaan

  kecamatanBinaan adalah model penghubung (join table). Fungsinya bukan untuk menyimpan data deskriptif, melainkan untuk mencatat dan 
  menciptakan relasi "banyak-ke-banyak" (many-to-many) antara dataPenyuluh (penyuluh) dan kecamatan.

  Secara sederhana, fungsi utamanya adalah untuk mendefinisikan wilayah kerja seorang penyuluh di tingkat kecamatan.

  Model ini hanya memiliki dua kolom:
   * penyuluhId: Menyimpan ID dari seorang penyuluh.
   * kecamatanId: Menyimpan ID dari sebuah kecamatan.

  Setiap baris dalam tabel kecamatanBinaans pada dasarnya adalah sebuah catatan tunggal yang menyatakan: "Penyuluh dengan ID ini 
  ditugaskan untuk membina Kecamatan dengan ID ini".

  Relasi Model kecamatanBinaan

  Untuk menjalankan fungsinya sebagai tabel penghubung, kecamatanBinaan memiliki dua relasi belongsTo (dimiliki oleh):

   1. Relasi ke `dataPenyuluh`
       * Kode: this.belongsTo(models.dataPenyuluh, { foreignKey: 'penyuluhId', ... });
       * Penjelasan: Setiap entri kecamatanBinaan terhubung ke satu data penyuluh. Ini mengidentifikasi siapa penyuluh yang ditugaskan.

   2. Relasi ke `kecamatan`
       * Kode: this.belongsTo(models.kecamatan, { foreignKey: 'kecamatanId', ... });
       * Penjelasan: Setiap entri kecamatanBinaan juga terhubung ke satu data kecamatan. Ini mengidentifikasi di mana lokasi penugasan
         penyuluh tersebut.

  Kesimpulan

  Dengan adanya model kecamatanBinaan, sistem dapat memfasilitasi skenario yang fleksibel:
   * Satu penyuluh dapat ditugaskan untuk membina beberapa kecamatan.
   * Satu kecamatan dapat memiliki beberapa penyuluh yang bertugas di sana.

  Jadi, jika Anda ingin mengetahui "Siapa saja penyuluh yang bekerja di Kecamatan A?" atau "Kecamatan mana saja yang menjadi wilayah
  binaan Penyuluh B?", model kecamatanBinaan inilah yang menyediakan jawabannya.

*/
