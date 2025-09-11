'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const now = new Date();

    console.log('Inserting permissions...');
    const permissions = [
      // ===== DASHBOARD PERMISSIONS =====
      {
        module: 'dashboard',
        action: 'index',
        display_name: 'Akses Dashboard Admin',
        description: 'Dapat mengakses halaman dashboard admin'
      },

      // ===== STATISTIC PERMISSIONS =====
      {
        module: 'statistic',
        action: 'index',
        display_name: 'Lihat Statistik',
        description: 'Dapat melihat halaman statistik'
      },
      {
        module: 'statistic',
        action: 'create',
        display_name: 'Buat Statistik',
        description: 'Dapat membuat data statistik baru'
      },
      {
        module: 'statistic',
        action: 'detail',
        display_name: 'Detail Statistik',
        description: 'Dapat melihat detail statistik'
      },
      {
        module: 'statistic',
        action: 'edit',
        display_name: 'Edit Statistik',
        description: 'Dapat mengedit data statistik'
      },
      {
        module: 'statistic',
        action: 'delete',
        display_name: 'Hapus Statistik',
        description: 'Dapat menghapus data statistik'
      },
      {
        module: 'statistic',
        action: 'realisasi',
        display_name: 'Realisasi Statistik',
        description: 'Dapat mengelola realisasi statistik'
      },
      {
        module: 'statistic',
        action: 'export',
        display_name: 'Export Statistik',
        description: 'Dapat mengekspor data statistik'
      },
      {
        module: 'statistic',
        action: 'import',
        display_name: 'Import Statistik',
        description: 'Dapat mengimpor data statistik'
      },

      // ===== TANAMAN PETANI PERMISSIONS =====
      {
        module: 'tanaman_petani',
        action: 'index',
        display_name: 'Lihat Tanaman Petani',
        description: 'Dapat melihat daftar tanaman petani'
      },
      {
        module: 'tanaman_petani',
        action: 'create',
        display_name: 'Tambah Tanaman Petani',
        description: 'Dapat menambah data tanaman petani'
      },
      {
        module: 'tanaman_petani',
        action: 'detail',
        display_name: 'Detail Tanaman Petani',
        description: 'Dapat melihat detail tanaman petani'
      },
      {
        module: 'tanaman_petani',
        action: 'edit',
        display_name: 'Edit Tanaman Petani',
        description: 'Dapat mengedit data tanaman petani'
      },
      {
        module: 'tanaman_petani',
        action: 'delete',
        display_name: 'Hapus Tanaman Petani',
        description: 'Dapat menghapus data tanaman petani'
      },
      {
        module: 'tanaman_petani',
        action: 'import',
        display_name: 'Import Tanaman Petani',
        description: 'Dapat mengimpor data tanaman petani'
      },
      {
        module: 'tanaman_petani',
        action: 'export',
        display_name: 'Export Tanaman Petani',
        description: 'Dapat mengekspor data tanaman petani'
      },

      // ===== DATA PETANI PERMISSIONS =====
      {
        module: 'data_petani',
        action: 'index',
        display_name: 'Lihat Data Petani',
        description: 'Dapat melihat daftar data petani'
      },
      {
        module: 'data_petani',
        action: 'create',
        display_name: 'Tambah Data Petani',
        description: 'Dapat menambah data petani baru'
      },
      {
        module: 'data_petani',
        action: 'detail',
        display_name: 'Detail Data Petani',
        description: 'Dapat melihat detail data petani'
      },
      {
        module: 'data_petani',
        action: 'edit',
        display_name: 'Edit Data Petani',
        description: 'Dapat mengedit data petani'
      },
      {
        module: 'data_petani',
        action: 'approve',
        display_name: 'Approve Data Petani',
        description: 'Dapat menyetujui pendaftaran petani'
      },
      {
        module: 'data_petani',
        action: 'delete',
        display_name: 'Hapus Data Petani',
        description: 'Dapat menghapus data petani'
      },
      {
        module: 'data_petani',
        action: 'import',
        display_name: 'Import Data Petani',
        description: 'Dapat mengimpor data petani'
      },

      // ===== BERITA PETANI PERMISSIONS =====
      {
        module: 'berita_petani',
        action: 'index',
        display_name: 'Lihat Berita Petani',
        description: 'Dapat melihat daftar berita petani'
      },
      {
        module: 'berita_petani',
        action: 'create',
        display_name: 'Buat Berita Petani',
        description: 'Dapat membuat berita untuk petani'
      },
      {
        module: 'berita_petani',
        action: 'detail',
        display_name: 'Detail Berita Petani',
        description: 'Dapat melihat detail berita petani'
      },
      {
        module: 'berita_petani',
        action: 'edit',
        display_name: 'Edit Berita Petani',
        description: 'Dapat mengedit berita petani'
      },
      {
        module: 'berita_petani',
        action: 'delete',
        display_name: 'Hapus Berita Petani',
        description: 'Dapat menghapus berita petani'
      },

      // ===== ACARA PETANI PERMISSIONS =====
      {
        module: 'acara_petani',
        action: 'index',
        display_name: 'Lihat Acara Petani',
        description: 'Dapat melihat daftar acara petani'
      },
      {
        module: 'acara_petani',
        action: 'create',
        display_name: 'Buat Acara Petani',
        description: 'Dapat membuat acara untuk petani'
      },
      {
        module: 'acara_petani',
        action: 'detail',
        display_name: 'Detail Acara Petani',
        description: 'Dapat melihat detail acara petani'
      },
      {
        module: 'acara_petani',
        action: 'edit',
        display_name: 'Edit Acara Petani',
        description: 'Dapat mengedit acara petani'
      },
      {
        module: 'acara_petani',
        action: 'delete',
        display_name: 'Hapus Acara Petani',
        description: 'Dapat menghapus acara petani'
      },

      // ===== TOKO PETANI PERMISSIONS =====
      {
        module: 'toko_petani',
        action: 'index',
        display_name: 'Lihat Toko Petani',
        description: 'Dapat melihat daftar toko petani'
      },
      {
        module: 'toko_petani',
        action: 'create',
        display_name: 'Buat Toko Petani',
        description: 'Dapat membuat toko petani'
      },
      {
        module: 'toko_petani',
        action: 'detail',
        display_name: 'Detail Toko Petani',
        description: 'Dapat melihat detail toko petani'
      },
      {
        module: 'toko_petani',
        action: 'edit',
        display_name: 'Edit Toko Petani',
        description: 'Dapat mengedit toko petani'
      },
      {
        module: 'toko_petani',
        action: 'delete',
        display_name: 'Hapus Toko Petani',
        description: 'Dapat menghapus toko petani'
      },

      // ===== LIVE CHAT PERMISSIONS =====
      {
        module: 'live_chat',
        action: 'index',
        display_name: 'Akses Live Chat',
        description: 'Dapat mengakses fitur live chat'
      },

      // ===== DATA PENYULUH PERMISSIONS =====
      {
        module: 'data_penyuluh',
        action: 'index',
        display_name: 'Lihat Data Penyuluh',
        description: 'Dapat melihat daftar data penyuluh'
      },
      {
        module: 'data_penyuluh',
        action: 'create',
        display_name: 'Tambah Data Penyuluh',
        description: 'Dapat menambah data penyuluh baru'
      },
      {
        module: 'data_penyuluh',
        action: 'detail',
        display_name: 'Detail Data Penyuluh',
        description: 'Dapat melihat detail data penyuluh'
      },
      {
        module: 'data_penyuluh',
        action: 'edit',
        display_name: 'Edit Data Penyuluh',
        description: 'Dapat mengedit data penyuluh'
      },
      {
        module: 'data_penyuluh',
        action: 'import',
        display_name: 'Import Data Penyuluh',
        description: 'Dapat mengimpor data penyuluh'
      },

      // ===== JURNAL PENYULUH PERMISSIONS =====
      {
        module: 'jurnal_penyuluh',
        action: 'index',
        display_name: 'Lihat Jurnal Penyuluh',
        description: 'Dapat melihat daftar jurnal penyuluh'
      },
      {
        module: 'jurnal_penyuluh',
        action: 'create',
        display_name: 'Buat Jurnal Penyuluh',
        description: 'Dapat membuat jurnal penyuluh'
      },
      {
        module: 'jurnal_penyuluh',
        action: 'detail',
        display_name: 'Detail Jurnal Penyuluh',
        description: 'Dapat melihat detail jurnal penyuluh'
      },
      {
        module: 'jurnal_penyuluh',
        action: 'edit',
        display_name: 'Edit Jurnal Penyuluh',
        description: 'Dapat mengedit jurnal penyuluh'
      },
      {
        module: 'jurnal_penyuluh',
        action: 'delete',
        display_name: 'Hapus Jurnal Penyuluh',
        description: 'Dapat menghapus jurnal penyuluh'
      },

      // ===== VERIFIKASI USER PERMISSIONS =====
      {
        module: 'verifikasi_user',
        action: 'index',
        display_name: 'Lihat Verifikasi User',
        description: 'Dapat melihat daftar user yang perlu diverifikasi'
      },
      {
        module: 'verifikasi_user',
        action: 'approve',
        display_name: 'Approve User',
        description: 'Dapat menyetujui verifikasi user'
      },
      {
        module: 'verifikasi_user',
        action: 'reject',
        display_name: 'Reject User',
        description: 'Dapat menolak verifikasi user'
      },

      // ===== UBAH HAK AKSES PERMISSIONS =====
      {
        module: 'ubah_hak_akses',
        action: 'index',
        display_name: 'Lihat Hak Akses',
        description: 'Dapat melihat daftar hak akses user'
      },
      {
        module: 'ubah_hak_akses',
        action: 'edit',
        display_name: 'Ubah Hak Akses',
        description: 'Dapat mengubah hak akses user'
      },

      // ===== LOG AKTIVITAS PERMISSIONS =====
      {
        module: 'log_aktivitas',
        action: 'index',
        display_name: 'Lihat Log Aktivitas',
        description: 'Dapat melihat log aktivitas sistem'
      },

      // ===== DATA SAMPAH PERMISSIONS =====
      {
        module: 'data_sampah',
        action: 'index',
        display_name: 'Lihat Data Sampah',
        description: 'Dapat melihat data yang telah dihapus'
      },
      {
        module: 'data_sampah',
        action: 'restore',
        display_name: 'Restore Data',
        description: 'Dapat mengembalikan data yang telah dihapus'
      },
      {
        module: 'data_sampah',
        action: 'delete',
        display_name: 'Hapus Permanen',
        description: 'Dapat menghapus data secara permanen'
      },

      // ===== DATA KELOMPOK PERMISSIONS =====
      {
        module: 'data_kelompok',
        action: 'index',
        display_name: 'Lihat Data Kelompok',
        description: 'Dapat melihat daftar data kelompok'
      },
      {
        module: 'data_kelompok',
        action: 'edit',
        display_name: 'Edit Data Kelompok',
        description: 'Dapat mengedit data kelompok'
      },
      {
        module: 'data_kelompok',
        action: 'delete',
        display_name: 'Hapus Data Kelompok',
        description: 'Dapat menghapus data kelompok'
      },
      {
        module: 'data_kelompok',
        action: 'import',
        display_name: 'Import Data Kelompok',
        description: 'Dapat mengimpor data kelompok'
      },
      // ===== DATA operator PERMISSIONS =====
      {
        module: 'data_operator',
        action: 'index',
        display_name: 'Lihat Data operator',
        description: 'Dapat melihat daftar data operator'
      },
      {
        module: 'data_operator',
        action: 'create',
        display_name: 'Buat Data operator',
        description: 'Dapat membuat data operator'
      },
      {
        module: 'data_operator',
        action: 'detail',
        display_name: 'Detail Data operator',
        description: 'Dapat melihat detail data operator'
      },
      {
        module: 'data_operator',
        action: 'edit',
        display_name: 'Edit Data operator',
        description: 'Dapat mengedit data operator'
      },
      {
        module: 'data_operator',
        action: 'delete',
        display_name: 'Hapus Data operator',
        description: 'Dapat menghapus data operator'
      },
      {
        module: 'data_operator',
        action: 'import',
        display_name: 'Import Data operator',
        description: 'Dapat mengimpor data operator'
      },
      // ===== PROFILE ADMIN PERMISSIONS =====
      {
        module: 'profile_admin',
        action: 'index',
        display_name: 'Lihat Profile Admin',
        description: 'Dapat melihat profile admin'
      },

      // ===== PROFILE USER PERMISSIONS =====
      {
        module: 'profile_user',
        action: 'detail',
        display_name: 'Detail Profile User',
        description: 'Dapat melihat detail profile user'
      },
      {
        module: 'profile_user',
        action: 'edit',
        display_name: 'Edit Profile User',
        description: 'Dapat mengedit profile user'
      },

      // ===== ISI FORM PERMISSIONS =====
      {
        module: 'isi_form',
        action: 'create',
        display_name: 'Isi Form',
        description: 'Dapat mengisi form yang tersedia'
      },
      {
        module: 'isi_form',
        action: 'detail',
        display_name: 'Detail Form',
        description: 'Dapat melihat detail form yang telah diisi'
      }
    ];

    // Convert permissions to database format
    const permissionData = permissions.map((perm) => ({
      name: `${perm.module}_${perm.action}`,
      display_name: perm.display_name,
      description: perm.description,
      module: perm.module,
      action: perm.action,
      is_active: true,
      createdAt: now,
      updatedAt: now
    }));

    await queryInterface.bulkInsert('permissions', permissionData);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
