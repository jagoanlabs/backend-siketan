'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Data untuk DataTanaman
    const dataTanamanSeeder = [];
    const COUNT_PER_KOMODITAS_PER_BULAN = {
      min: 5, // Minimum count per komoditas per bulan
      max: 10 // Maximum count per komoditas per bulan
    };
    // Daftar kategori dan komoditas
    const kategoris = ['Pangan', 'Hortikultura', 'Perkebunan'];
    const komoditasMapping = {
      Pangan: ['Padi', 'Jagung', 'Kedelai', 'Kacang Tanah', 'Ubi Kayu', 'Ubi Jalar'],
      Hortikultura: ['Cabai', 'Tomat', 'Bawang Merah', 'Bawang Putih', 'Kentang', 'Wortel'],
      Perkebunan: ['Kelapa Sawit', 'Kopi', 'Kakao', 'Kelapa', 'Karet', 'Tebu']
    };

    const periodeTanam = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];
    const bulanPanen = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember'
    ];

    // Generate data untuk setiap bulan di tahun 2025
    // Generate data untuk setiap bulan di tahun 2025
    for (let month = 1; month <= 12; month++) {
      // Tentukan jumlah hari aktif dalam bulan (15-25 hari)
      const activeDays = Math.floor(Math.random() * 11) + 15; // 15-25 hari aktif
      const daysInMonth = new Date(2025, month, 0).getDate(); // Jumlah hari dalam bulan

      // Pilih hari-hari yang akan ada data
      const selectedDays = [];
      while (selectedDays.length < activeDays) {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        if (!selectedDays.includes(day)) {
          selectedDays.push(day);
        }
      }

      // Generate data untuk setiap kategori dan komoditas
      kategoris.forEach((kategori) => {
        const komoditasList = komoditasMapping[kategori];

        komoditasList.forEach((komoditas) => {
          // Tentukan berapa kali komoditas ini akan muncul dalam bulan ini
          const countPerKomoditas =
            Math.floor(
              Math.random() *
                (COUNT_PER_KOMODITAS_PER_BULAN.max - COUNT_PER_KOMODITAS_PER_BULAN.min + 1)
            ) + COUNT_PER_KOMODITAS_PER_BULAN.min;

          for (let i = 0; i < countPerKomoditas; i++) {
            // Pilih hari random dari hari-hari aktif
            const selectedDay = selectedDays[Math.floor(Math.random() * selectedDays.length)];

            const createdAt = new Date(
              2025,
              month - 1,
              selectedDay,
              Math.floor(Math.random() * 24), // Random jam
              Math.floor(Math.random() * 60), // Random menit
              Math.floor(Math.random() * 60) // Random detik
            );

            const luasLahan = Math.floor(Math.random() * 101) + 100; // 100-200 hektar
            const prakiraanLuasPanen = Math.floor(luasLahan * 0.8); // 80% dari luas lahan
            const prakiraanHasilPanen = prakiraanLuasPanen * (Math.floor(Math.random() * 5) + 3); // 3-7 ton per hektar
            const realisasiLuasPanen = Math.floor(
              prakiraanLuasPanen * (0.85 + Math.random() * 0.25)
            ); // 85-110% dari prakiraan
            const realisasiHasilPanen = Math.floor(
              prakiraanHasilPanen * (0.8 + Math.random() * 0.3)
            ); // 80-110% dari prakiraan

            dataTanamanSeeder.push({
              kategori: kategori,
              komoditas: komoditas,
              periodeTanam: periodeTanam[Math.floor(Math.random() * periodeTanam.length)],
              luasLahan: luasLahan,
              prakiraanLuasPanen: prakiraanLuasPanen,
              prakiraanHasilPanen: prakiraanHasilPanen,
              prakiraanBulanPanen: bulanPanen[Math.floor(Math.random() * bulanPanen.length)],
              realisasiLuasPanen: realisasiLuasPanen,
              realisasiHasilPanen: realisasiHasilPanen,
              realisasiBulanPanen: bulanPanen[Math.floor(Math.random() * bulanPanen.length)],
              createdAt: createdAt,
              updatedAt: createdAt
            });
          }
        });
      });
    }

    // Insert data DataTanaman
    await queryInterface.bulkInsert('dataTanamans', dataTanamanSeeder, {});

    // Data untuk TanamanPetani
    const tanamanPetaniSeeder = [];
    const statusKepemilikanLahan = ['Milik Sendiri', 'Sewa', 'Bagi Hasil'];
    const jenisTanaman = ['Tanaman Semusim', 'Tanaman Tahunan'];

    // Generate data TanamanPetani untuk setiap bulan
    for (let month = 1; month <= 12; month++) {
      const dataPerMonth = Math.floor(Math.random() * 8) + 7; // 7-15 data per bulan

      for (let i = 0; i < dataPerMonth; i++) {
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const createdAt = new Date(2025, month - 1, randomDay);

        const kategori = kategoris[Math.floor(Math.random() * kategoris.length)];
        const komoditasList = komoditasMapping[kategori];
        const komoditas = komoditasList[Math.floor(Math.random() * komoditasList.length)];

        const luasLahan = (Math.random() * 101 + 100).toFixed(1); // 100.0-200.9 hektar
        const prakiraanLuasPanen = Math.floor(parseFloat(luasLahan) * 0.9);
        const prakiraanProduksiPanen = prakiraanLuasPanen * (Math.floor(Math.random() * 4) + 2); // 2-5 ton per hektar

        tanamanPetaniSeeder.push({
          statusKepemilikanLahan:
            statusKepemilikanLahan[Math.floor(Math.random() * statusKepemilikanLahan.length)],
          luasLahan: luasLahan,
          kategori: kategori,
          jenis: jenisTanaman[Math.floor(Math.random() * jenisTanaman.length)],
          komoditas: komoditas,
          periodeMusimTanam: periodeTanam[Math.floor(Math.random() * periodeTanam.length)],
          periodeBulanTanam: bulanPanen[Math.floor(Math.random() * bulanPanen.length)],
          prakiraanLuasPanen: prakiraanLuasPanen,
          prakiraanProduksiPanen: prakiraanProduksiPanen,
          prakiraanBulanPanen: bulanPanen[Math.floor(Math.random() * bulanPanen.length)],
          fk_petaniId: Math.floor(Math.random() * 5) + 200, // Asumsi ada 50 petani, sesuaikan dengan data Anda
          createdAt: createdAt,
          updatedAt: createdAt
        });
      }
    }

    // Insert data TanamanPetani
    await queryInterface.bulkInsert('tanamanPetanis', tanamanPetaniSeeder, {});
  },

  async down(queryInterface, Sequelize) {
    // Hapus data yang di-seed untuk tahun 2025
    await queryInterface.bulkDelete(
      'dataTanamans',
      {
        createdAt: {
          [Sequelize.Op.between]: ['2025-01-01 00:00:00', '2025-12-31 23:59:59']
        }
      },
      {}
    );

    await queryInterface.bulkDelete(
      'tanamanPetanis',
      {
        createdAt: {
          [Sequelize.Op.between]: ['2025-01-01 00:00:00', '2025-12-31 23:59:59']
        }
      },
      {}
    );
  }
};
