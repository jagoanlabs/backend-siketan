'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class desaBinaan extends Model {
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
      this.belongsTo(models.desa, {
        foreignKey: 'desaId',
        targetKey: 'id'
      });
    }
  }
  desaBinaan.init(
    {
      penyuluhId: DataTypes.NUMBER,
      desaId: DataTypes.NUMBER
    },
    {
      sequelize,
      modelName: 'desaBinaan'
    }
  );
  return desaBinaan;
};
/**
 *  Di dalam file desabinaan.js, terdapat dua relasi utama:

  1. Relasi ke dataPenyuluh

   * Relasi: belongsTo (Satu desaBinaan dimiliki oleh satu dataPenyuluh)
   * Kode: this.belongsTo(models.dataPenyuluh, { foreignKey: 'penyuluhId', targetKey: 'id' });
   * Penjelasan:
      Setiap entri di tabel desaBinaan terhubung ke satu penyuluh spesifik.
   * Kunci Penghubung (Foreign Key):
      Tabel desaBinaans memiliki kolom penyuluhId yang merujuk ke kolom id di tabel dataPenyuluhs.

  2. Relasi ke desa

   * Relasi: belongsTo (Satu desaBinaan dimiliki oleh satu desa)
   * Kode: this.belongsTo(models.desa, { foreignKey: 'desaId', targetKey: 'id' });
   * Penjelasan:
      Setiap entri di tabel desaBinaan juga terhubung ke satu desa spesifik.
   * Kunci Penghubung (Foreign Key):
      Tabel desaBinaans memiliki kolom desaId yang merujuk ke kolom id di tabel desas.

  Kesimpulan Fungsi `desaBinaan`

  Karena setiap baris di tabel desaBinaan hanya berisi ID penyuluh (penyuluhId) dan ID desa (desaId), fungsi utamanya adalah untuk
  mencatat "Penyuluh A ditugaskan untuk membina Desa X".

  Ini memungkinkan skenario berikut:
   * Satu penyuluh bisa membina banyak desa. (Contoh: Penyuluh Budi membina Desa Sukamakmur dan Desa Sukamaju).
   * Satu desa bisa dibina oleh banyak penyuluh. (Contoh: Desa Sukajaya dibina oleh Penyuluh Budi dan Penyuluh Ani).
*/
