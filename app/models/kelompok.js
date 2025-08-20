'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kelompok extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasOne(models.dataPerson, { foreignKey: 'kelompokId' });
      this.hasMany(models.dataPetani, { foreignKey: 'fk_kelompokId' });

      this.belongsTo(models.dataPenyuluh, {
        foreignKey: 'penyuluh'
      });
      this.belongsTo(models.kecamatan, {
        foreignKey: 'kecamatanId',
        as: 'kecamatanData'
      });
      this.belongsTo(models.desa, {
        foreignKey: 'desaId',
        as: 'desaData'
      });
    }
  }
  kelompok.init(
    {
      gapoktan: DataTypes.STRING,
      namaKelompok: DataTypes.STRING,
      desa: DataTypes.STRING,
      kecamatan: DataTypes.STRING,
      penyuluh: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'kelompok'
    }
  );
  return kelompok;
};
/**
  Relasi ke dataPetani

   * Relasi: hasMany (Satu kelompok memiliki banyak dataPetani)
   * Kode: this.hasMany(models.dataPetani, { foreignKey: 'fk_kelompokId' });
   * Penjelasan:
      Ini adalah relasi "satu-ke-banyak". Artinya, satu baris data kelompok dapat terhubung dengan banyak baris data dataPetani. Dalam
  konteks aplikasi, ini berarti satu kelompok tani beranggotakan banyak petani.
   * Kunci Penghubung (Foreign Key):
      Tabel dataPetanis memiliki kolom fk_kelompokId yang berfungsi sebagai penanda untuk menunjukkan petani tersebut milik kelompok yang
  mana.

  ---

  2. Relasi ke dataPenyuluh

   * Relasi: belongsTo (Satu kelompok dimiliki/dibina oleh satu dataPenyuluh)
   * Kode: this.belongsTo(models.dataPenyuluh, { foreignKey: 'penyuluh' });
   * Penjelasan:
      Ini adalah relasi "banyak-ke-satu". Setiap kelompok tani dibina oleh satu penyuluh (petugas penyuluh lapangan). Beberapa kelompok tani
  bisa saja dibina oleh penyuluh yang sama.
   * Kunci Penghubung (Foreign Key):
      Tabel kelompoks memiliki kolom penyuluh yang berisi ID dari penyuluh yang bertanggung jawab atas kelompok tersebut.

  ---

  3. Relasi ke kecamatan

   * Relasi: belongsTo (Satu kelompok berlokasi di satu kecamatan)
   * Kode: this.belongsTo(models.kecamatan, { foreignKey: 'kecamatanId', as: 'kecamatanData' });
   * Penjelasan:
      Setiap kelompok tani berlokasi di satu kecamatan spesifik.
   * Kunci Penghubung (Foreign Key):
      Tabel kelompoks memiliki kolom kecamatanId untuk menyimpan ID kecamatan lokasi kelompok.
   * Alias:
      Opsi as: 'kecamatanData' berarti ketika Anda melakukan query untuk kelompok dan menyertakan relasi ini, data dari kecamatan akan muncul
   dalam properti bernama kecamatanData.

  ---

  4. Relasi ke desa

   * Relasi: belongsTo (Satu kelompok berlokasi di satu desa)
   * Kode: this.belongsTo(models.desa, { foreignKey: 'desaId', as: 'desaData' });
   * Penjelasan:
      Selain kecamatan, setiap kelompok tani juga berlokasi di satu desa spesifik.
   * Kunci Penghubung (Foreign Key):
      Tabel kelompoks memiliki kolom desaId untuk menyimpan ID desa lokasi kelompok.
   * Alias:
      Sama seperti kecamatan, as: 'desaData' akan membuat data desa yang di-query muncul dalam properti bernama desaData.

  ---

       
 */
