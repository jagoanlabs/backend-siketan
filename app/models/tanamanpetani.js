'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tanamanPetani extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.laporanTanam, { foreignKey: 'tanamanPetaniId' });
      this.belongsTo(models.dataPetani, {
        foreignKey: 'fk_petaniId',
        as: 'dataPetani'
      });
    }
  }
  tanamanPetani.init(
    {
      statusKepemilikanLahan: DataTypes.STRING,
      luasLahan: DataTypes.STRING,
      kategori: DataTypes.STRING,
      jenis: DataTypes.STRING,
      komoditas: DataTypes.STRING,
      periodeMusimTanam: DataTypes.STRING,
      periodeBulanTanam: DataTypes.STRING,
      prakiraanLuasPanen: DataTypes.INTEGER,
      prakiraanProduksiPanen: DataTypes.INTEGER,
      prakiraanBulanPanen: DataTypes.STRING
    },
    { sequelize, paranoid: true, modelName: 'tanamanPetani' }
  );
  return tanamanPetani;
};
/**
 * Bagian 1: Model tanamanPetani sebagai Inti ("Proyek Tanam")

  Pikirkan tanamanPetani sebagai sebuah "Proyek Tanam" atau "Rencana Kerja Tanam". Setiap baris di tabel ini merepresentasikan satu
  aktivitas tanam yang spesifik, yang dilakukan oleh seorang petani untuk satu musim tanam.

   * Fungsi Utama: Menyimpan semua data perencanaan dan target dari sebuah aktivitas tanam.
   * Atribut Kunci:
       * luasLahan, komoditas, jenis: Mendefinisikan apa yang ditanam dan di mana.
       * periodeMusimTanam, periodeBulanTanam: Mendefinisikan kapan proyek ini dimulai.
       * prakiraanProduksiPanen, prakiraanBulanPanen: Mendefinisikan apa target dan ekspektasi dari proyek ini.

  Model ini tidak mencatat progres harian. Ia adalah gambaran besar dari sebuah rencana kerja.

  ---

  Bagian 2: Relasi ke Atas (Upstream) ke dataPetani - Hubungan "Siapa"

  Relasi ini menjawab pertanyaan: "Proyek Tanam ini milik siapa?"

   * Jenis Relasi: tanamanPetani.belongsTo(models.dataPetani)
   * Artinya: Setiap "Proyek Tanam" (tanamanPetani) dimiliki oleh satu profil petani (dataPetani). Ini adalah hubungan "banyak-ke-satu",
     karena satu petani bisa saja memiliki banyak proyek tanam (misalnya menanam padi di satu lahan dan jagung di lahan lain, atau proyek
     tanam padi musim ini dan musim lalu).
   * Konektor Teknis: Kolom fk_petaniId di dalam tabel tanamanPetanis adalah kunci yang menghubungkan setiap proyek ke id petani yang
     bersangkutan di tabel dataPetanis.

  Tanpa relasi ini, Anda punya banyak "proyek tanam" tapi tidak tahu siapa yang mengerjakannya.

  ---

  Bagian 3: Relasi ke Bawah (Downstream) ke laporanTanam - Hubungan "Bagaimana"

  Relasi ini menjawab pertanyaan: "Bagaimana progres dari Proyek Tanam ini?"

   * Jenis Relasi: tanamanPetani.hasMany(models.laporanTanam)
   * Artinya: Satu "Proyek Tanam" (tanamanPetani) bisa memiliki banyak "Laporan Progres" (laporanTanam). Ini adalah hubungan
     "satu-ke-banyak".
   * Konektor Teknis: Kolom tanamanPetaniId di dalam tabel laporanTanams adalah kunci yang menghubungkan setiap laporan progres ke id
     proyek tanam induknya.

  Tanpa relasi ini, Anda punya banyak "laporan progres" tapi tidak tahu laporan itu untuk proyek tanam yang mana.

  Analisis Lengkap: Analogi Sistem Akademik Kampus

  Untuk melihat gambaran lengkapnya, bayangkan sistem data di sebuah universitas:

   1. `dataPetani` adalah `Mahasiswa`:
      Ini adalah tabel master untuk setiap individu. Isinya data diri mahasiswa seperti Nama, NIM (Nomor Induk Mahasiswa), Alamat, dll.
  Datanya unik per mahasiswa.

   2. `tanamanPetani` adalah `Kartu Rencana Studi (KRS)`:
      Setiap semester, seorang Mahasiswa akan mengisi satu KRS. KRS ini adalah rencana studi untuk semester itu (proyek tanam untuk musim
  itu). KRS ini menghubungkan `Mahasiswa` dengan mata kuliah yang akan diambil. KRS ini milik satu mahasiswa spesifik.

   3. `laporanTanam` adalah `Absensi dan Nilai Tugas`:
      Untuk setiap mata kuliah di dalam KRS tersebut, akan ada banyak catatan sepanjang semester. Misalnya: Absen pertemuan ke-1, Nilai
  tugas ke-1, Nilai Kuis, Nilai UTS, Absen pertemuan ke-10, dst. Setiap catatan ini (laporanTanam) terhubung ke satu mata kuliah spesifik
  di dalam KRS (tanamanPetani) milik Mahasiswa (dataPetani) tersebut.

  Kesimpulan:
  Model tanamanPetani adalah model penghubung yang krusial. Ia tidak hanya menyimpan data rencana, tetapi juga bertindak sebagai poros
  yang memungkinkan alur data yang logis: dari siapa orangnya (dataPetani), ke apa rencana kerjanya (tanamanPetani), hingga ke bagaimana 
  detail pelaksanaan kerjanya (laporanTanam).
*/
