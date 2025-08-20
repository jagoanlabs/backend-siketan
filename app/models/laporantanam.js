'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class laporanTanam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tanamanPetani, {
        foreignKey: 'tanamanPetaniId'
      });
    }
  }
  laporanTanam.init(
    {
      tanamanPetaniId: DataTypes.INTEGER,
      tanggalLaporan: DataTypes.DATE,
      komdisiTanaman: DataTypes.STRING,
      deskripsi: DataTypes.TEXT,
      fotoTanaman: DataTypes.TEXT
    },
    {
      sequelize,
      paranoid: true,
      modelName: 'laporanTanam'
    }
  );
  return laporanTanam;
};
/**
 * Bagian 1: Detail Model tanamanPetani (Master Data)

  Fungsi Utama:
  Model tanamanPetani berfungsi sebagai profil utama atau master data dari sebuah aktivitas tanam yang dilakukan oleh seorang petani 
  untuk satu musim. Anggap saja ini adalah "dokumen proyek" untuk sebuah tanaman. Isinya adalah semua informasi dasar dan perencanaan
  awal.

  Atribut / Kolom Penting:
   * statusKepemilikanLahan, luasLahan: Informasi tentang lahan yang digunakan.
   * kategori, jenis, komoditas: Mendefinisikan apa yang ditanam.
   * periodeMusimTanam, periodeBulanTanam: Mendefinisikan kapan tanaman itu ditanam.
   * prakiraanLuasPanen, prakiraanProduksiPanen, prakiraanBulanPanen: Berisi semua ekspektasi atau target dari hasil panen.

  Relasi Milik `tanamanPetani`:
   1. this.belongsTo(models.dataPetani, ...): Setiap tanamanPetani dimiliki oleh satu dataPetani. Ini menghubungkan aktivitas tanam ke
      petani yang melakukannya.
   2. this.hasMany(models.laporanTanam, ...): Ini adalah relasi kuncinya. Satu tanamanPetani dapat memiliki banyak laporanTanam.

  ---

  Bagian 2: Detail Model laporanTanam (Data Detail/Transaksi)

  Fungsi Utama:
  Model laporanTanam berfungsi sebagai catatan perkembangan atau jurnal dari sebuah aktivitas tanam. Jika tanamanPetani adalah
  "proyek"-nya, maka laporanTanam adalah "log harian" atau "laporan progres" dari proyek tersebut.

  Atribut / Kolom Penting:
   * tanamanPetaniId: Kunci asing yang menghubungkan laporan ini ke tanamanPetani yang spesifik.
   * tanggalLaporan: Kapan laporan ini dibuat.
   * komdisiTanaman: Kondisi tanaman pada saat itu (misal: "Sehat", "Terserang Hama").
   * deskripsi, fotoTanaman: Bukti dan penjelasan detail dari kondisi tanaman.

  Relasi Milik `laporanTanam`:
   * this.belongsTo(models.tanamanPetani, ...): Setiap laporanTanam pasti merujuk ke satu tanamanPetani. Sebuah laporan tidak bisa ada
     tanpa "proyek" induknya.

  ---

  Bagian 3: Analisis Relasi Antara tanamanPetani dan laporanTanam

  Relasi antara kedua model ini adalah relasi induk-anak (parent-child) atau master-detail.

   * `tanamanPetani` adalah Induk (Parent/Master): Ia adalah entitas utama. Ia ada terlebih dahulu, mendefinisikan sebuah rencana penanaman
     untuk satu musim. Ia unik untuk setiap petani dan musim tanam.

   * `laporanTanam` adalah Anak (Child/Detail): Ia adalah entitas pendukung yang memberikan detail kontekstual dari waktu ke waktu untuk
     sang Induk. Bisa ada banyak sekali laporan untuk satu rencana penanaman.

  Analogi untuk Mempermudah:

  Bayangkan tanamanPetani adalah seorang Pasien yang mendaftar di sebuah klinik. Data pasien (nama, alamat, tanggal lahir, riwayat
  alergi) dicatat sekali saat pendaftaran. Ini adalah data masternya.

  Lalu, laporanTanam adalah Rekam Medis dari pasien tersebut. Setiap kali pasien datang untuk konsultasi, dokter akan membuat catatan
  baru: tanggal kunjungan, keluhan, hasil pemeriksaan, diagnosis, dan resep. Pasiennya tetap satu, tapi catatan rekam medisnya akan terus
  bertambah seiring waktu.

  Bagaimana Keduanya Terhubung Secara Teknis?

  Hubungan ini dimungkinkan oleh kolom tanamanPetaniId pada model laporanTanam.
   * Ketika seorang petani membuat laporan baru tentang tanamannya, aplikasi akan menyimpan laporan tersebut dan mengisi kolom
     tanamanPetaniId dengan id dari tanamanPetani yang sedang dilaporkan.
   * Dengan begitu, Anda bisa dengan mudah mengambil semua riwayat laporan untuk satu tanaman spesifik dengan mencari semua laporanTanam
     yang memiliki tanamanPetaniId yang sama.

  Kesimpulan:
  Kombinasi kedua model ini menciptakan sistem pencatatan yang kuat. tanamanPetani memberikan gambaran besar tentang "apa yang
  direncanakan", sementara laporanTanam memberikan catatan historis yang detail tentang "bagaimana perkembangannya dari waktu ke waktu".
*/
