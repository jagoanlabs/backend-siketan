'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class penjual extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tbl_akun, {
        foreignKey: 'accountID',
        targetKey: 'accountID'
      });
    }
  }
  penjual.init(
    {
      profesiPenjual: DataTypes.STRING,
      namaProducts: DataTypes.STRING,
      stok: DataTypes.INTEGER,
      satuan: DataTypes.STRING,
      harga: DataTypes.STRING,
      deskripsi: DataTypes.STRING,
      fotoTanaman: DataTypes.TEXT,
      status: DataTypes.STRING,
      accountID: DataTypes.UUID
    },
    {
      sequelize,
      paranoid: true,
      modelName: 'penjual'
    }
  );
  return penjual;
};
/**
 * Tentu. Setelah menganalisis kedua model tersebut, saya menemukan hubungan yang menarik. Ini bukan sekadar relasi profil, melainkan relasi
  antara "pengguna" dan "produk yang dijual".

  Berikut penjelasan detailnya.

  Bagian 1: Fungsi Model tbl_akun (Akun Induk)

  Model tbl_akun adalah jantung dari sistem manajemen pengguna di aplikasi Anda.

   * Fungsi Utama: Sebagai tabel autentikasi. Tabel ini yang menentukan siapa saja yang bisa masuk (login) ke dalam sistem. Isinya adalah
     data-data fundamental yang dimiliki oleh semua jenis pengguna, tidak peduli apa perannya.
   * Atribut Penting:
       * email, password: Untuk proses login.
       * nama, no_wa, foto: Informasi kontak dasar.
       * peran: Kolom krusial yang menentukan hak akses pengguna (misalnya 'penjual', 'petani', 'penyuluh').
       * accountID: Sebuah ID unik untuk setiap akun.

  Singkatnya, tbl_akun menjawab pertanyaan: "Siapa Anda?" dan "Bolehkah Anda masuk ke sistem?".

  Bagian 2: Fungsi Model penjual (Produk Jualan)

  Di sinilah letak detail yang paling penting. Berdasarkan atributnya, model penjual bukanlah profil seorang penjual, melainkan model
  untuk satu jenis produk atau barang yang dijual oleh seorang penjual.

   * Fungsi Utama: Sebagai katalog atau daftar produk. Setiap baris di tabel penjuals merepresentasikan satu item yang tersedia untuk
     dijual.
   * Atribut Penting:
       * namaProducts: Nama dari produk yang dijual (misal: "Pupuk NPK Mutiara").
       * stok, satuan, harga: Detail inventaris dan harga produk.
       * deskripsi, fotoTanaman: Informasi pemasaran untuk produk tersebut.
       * accountID: Kunci asing (foreign key) yang menghubungkan produk ini ke akun penjualnya di tbl_akun.

  Model penjual menjawab pertanyaan: "Barang apa yang dijual?" dan "Siapa yang menjualnya?".

  Bagian 3: Analisis Relasi Antara tbl_akun dan penjual

  Relasi antara keduanya adalah satu-ke-banyak (one-to-many).

   * Di tbl_akun.js: tbl_akun.hasMany(models.penjual, ...)
   * Di penjual.js: this.belongsTo(models.tbl_akun, ...)

  Artinya:
  Satu akun (`tbl_akun`) dapat memiliki dan menjual banyak produk (`penjual`).

  Ini adalah desain yang sangat umum untuk fitur marketplace atau toko online. Seorang pengguna dengan peran 'penjual' bisa login dengan
  satu akun, lalu mem-posting berbagai macam barang dagangan. Setiap barang yang ia posting akan menjadi satu baris baru di tabel
  penjuals, namun semuanya akan terhubung ke accountID miliknya.

  Analogi Sederhana:

   * tbl_akun adalah Akun Anda di sebuah marketplace (misal: Tokopedia atau Shopee). Anda punya satu akun dengan satu email dan password.
   * penjual adalah setiap etalase produk yang Anda buat di toko Anda. Anda bisa menjual "Bibit Tomat" (1 baris di penjual), "Pupuk Kompos"
     (1 baris lagi), dan "Alat Semprot" (1 baris lagi). Ketiga produk ini adalah entitas yang berbeda, namun semuanya terhubung dan dimiliki
      oleh satu akun Anda.

  Kesimpulan:
  Jadi, relasi ini tidak menghubungkan akun ke "profil penjual", melainkan menghubungkan satu akun pengguna ke banyak produk yang ia 
  jual. Ini adalah cara yang efisien untuk membangun fitur di mana satu penjual bisa menawarkan beragam barang dagangan.
*/
