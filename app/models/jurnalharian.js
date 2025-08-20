'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jurnalHarian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.dataPenyuluh, {
        foreignKey: 'fk_penyuluhId'
      });
    }
  }
  jurnalHarian.init(
    {
      judul: DataTypes.STRING,
      tanggalDibuat: DataTypes.DATE,
      uraian: DataTypes.TEXT,
      gambar: DataTypes.TEXT,
      statusJurnal: DataTypes.STRING,
      pengubah: DataTypes.STRING
    },
    {
      sequelize,
      paranoid: true,
      modelName: 'jurnalHarian'
    }
  );
  return jurnalHarian;
};

/**
 * Dilihat dari atribut atau kolom yang dimilikinya, fungsi utama model `jurnalHarian` adalah untuk menyimpan catatan atau laporan                        
  kegiatan harian yang dibuat oleh penyuluh.                                                                                                             
                                                                                                                                                         
  Ini adalah "buku harian digital" bagi para penyuluh. Berikut rincian kolomnya:
   * judul: Judul dari catatan harian.
   * tanggalDibuat: Tanggal kapan catatan tersebut dibuat.
   * uraian: Deskripsi atau isi detail dari kegiatan yang dilaporkan (menggunakan tipe TEXT agar bisa menampung tulisan yang panjang).
   * gambar: Untuk menyimpan data gambar yang terkait dengan kegiatan (biasanya berupa URL atau path ke file gambar).
   * statusJurnal: Status dari jurnal tersebut (misalnya 'Draft', 'Disetujui', 'Ditolak').
   * pengubah: Menyimpan informasi siapa yang terakhir kali mengubah data jurnal ini.

  Selain itu, model ini memiliki opsi paranoid: true. Ini berarti model jurnalHarian menggunakan fitur soft delete. Artinya, ketika sebuah
   jurnal dihapus, datanya tidak benar-benar hilang dari database, melainkan hanya ditandai sebagai "telah dihapus" (dengan mengisi kolom
  deletedAt). Ini berguna untuk bisa mengembalikan data jika diperlukan.

  Relasi Model jurnalHarian

  Model jurnalHarian memiliki satu relasi penting:

   * Relasi: belongsTo (Satu jurnalHarian dimiliki oleh satu dataPenyuluh)
   * Kode: this.belongsTo(models.dataPenyuluh, { foreignKey: 'fk_penyuluhId' });
   * Penjelasan:
      Ini adalah relasi "banyak-ke-satu". Artinya, setiap catatan jurnal harian yang dibuat pasti dimiliki oleh satu orang penyuluh.
  Relasi ini memungkinkan sistem untuk:
       1. Mengetahui siapa penulis dari setiap jurnal.
       2. Menampilkan semua jurnal yang pernah dibuat oleh seorang penyuluh tertentu.
   * Kunci Penghubung (Foreign Key):
      Tabel jurnalHarians memiliki kolom fk_penyuluhId yang berisi id dari penyuluh yang membuat laporan tersebut.

  Kesimpulan

  Secara singkat, jurnalHarian adalah model untuk mencatat semua aktivitas harian penyuluh, di mana setiap catatan terhubung langsung ke
  akun penyuluh yang membuatnya.
*/
