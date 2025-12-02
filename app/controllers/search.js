const { Op } = require('sequelize');
const { penjual, tbl_akun, beritaTani, eventTani, dataPenyuluh, dataPetani } = require('../models');

const getLikeOperator = () => {
  return Op.like;
};

// Helper function untuk menghitung relevance score
const calculateRelevanceScore = (item, searchQuery, config) => {
  const query = searchQuery.toLowerCase();
  let score = 0;

  config.forEach((field) => {
    const fieldValue = getNestedValue(item, field.path);
    if (fieldValue && typeof fieldValue === 'string') {
      const value = fieldValue.toLowerCase();

      // Exact match mendapat score tertinggi
      if (value === query) {
        score += field.weight * 10;
      }
      // Starts with mendapat score tinggi
      else if (value.startsWith(query)) {
        score += field.weight * 8;
      }
      // Contains di awal kata mendapat score menengah-tinggi
      else if (value.includes(' ' + query) || value.includes('-' + query)) {
        score += field.weight * 6;
      }
      // Contains biasa mendapat score menengah
      else if (value.includes(query)) {
        score += field.weight * 4;
      }
      // Partial match (query mengandung sebagian field atau sebaliknya)
      else {
        const queryWords = query.split(' ');
        const valueWords = value.split(' ');

        let matchCount = 0;
        queryWords.forEach((qWord) => {
          valueWords.forEach((vWord) => {
            if (qWord.length > 2 && vWord.includes(qWord)) matchCount++;
            if (vWord.length > 2 && qWord.includes(vWord)) matchCount++;
          });
        });

        if (matchCount > 0) {
          score += field.weight * Math.min(matchCount * 2, field.weight);
        }
      }
    }
  });

  return score;
};

// Helper function untuk mengambil nested value
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

// Helper function untuk mengurutkan semua hasil berdasarkan score
const sortAllResultsByRelevance = (allResults, searchQuery) => {
  const combinedResults = [];

  // Combine all results dengan score masing-masing
  Object.entries(allResults).forEach(([type, data]) => {
    if (data && data.items) {
      data.items.forEach((item) => {
        combinedResults.push({
          ...item,
          searchType: type,
          relevanceScore: item.relevanceScore || 0
        });
      });
    }
  });

  // Sort berdasarkan relevance score
  return combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Tambahkan fungsi debug di awal file
const debugSearch = async () => {
  try {
    console.log('=== DEBUG SEARCH ===');

    // Test basic product query
    const testProducts = await penjual.findAll({
      limit: 5,
      attributes: ['id', 'namaProducts', 'deskripsi']
    });
    console.log(
      'Sample products in DB:',
      testProducts.map((p) => ({
        id: p.id,
        nama: p.namaProducts
      }))
    );

    // Test search dengan LIKE
    const searchTest = await penjual.findAll({
      where: {
        namaProducts: { [getLikeOperator()]: '%beras%' }
      },
      limit: 5,
      attributes: ['id', 'namaProducts']
    });
    console.log(
      'Search test results:',
      searchTest.map((p) => ({
        id: p.id,
        nama: p.namaProducts
      }))
    );
  } catch (error) {
    console.error('Debug error:', error);
  }
};

const searchGlobal = async (req, res) => {
  try {
    // Jalankan debug dulu
    await debugSearch();

    const { q: query, type = 'all', page = 1, limit = 10, sortBy = 'relevance' } = req.query;

    console.log('Search params:', { query, type, page, limit, sortBy });

    if (!query || query.trim() === '') {
      return res.status(400).json({
        message: 'Parameter pencarian (q) harus diisi'
      });
    }

    const searchQuery = query.trim();
    const limitFilter = Number(limit);
    const pageFilter = Number(page);
    const offset = (pageFilter - 1) * limitFilter;

    let results = {
      query: searchQuery,
      type: type,
      sortBy: sortBy,
      data: {},
      pagination: {
        currentPage: pageFilter,
        limit: limitFilter,
        totalResults: 0
      }
    };

    // Konfigurasi relevance scoring per entity - UPDATED BERDASARKAN MODEL
    const scoringConfig = {
      products: [
        { path: 'namaProducts', weight: 10 } // Only search by product name
      ],
      tokos: [
        { path: 'nama', weight: 10 } // Only search by toko name
      ],
      berita: [
        { path: 'judul', weight: 10 }, // Search by title
        { path: 'isi', weight: 5 } // Search by content
      ],
      events: [
        { path: 'namaKegiatan', weight: 10 }, // Search by event name
        { path: 'isi', weight: 5 } // Search by content
      ]
    };

    // Search Products dengan relevance scoring - FIXED
    if (type === 'all' || type === 'product') {
      try {
        console.log('Searching products for:', searchQuery);

        const productSearchQuery = {
          where: {
            // Menggunakan Sequelize.or() syntax atau array
            [Op.or]: [{ namaProducts: { [getLikeOperator()]: `%${searchQuery}%` } }]
          },
          order: [['updatedAt', 'DESC']]
        };

        console.log('Product query:', JSON.stringify(productSearchQuery, null, 2));

        const products = await penjual.findAndCountAll(productSearchQuery);

        console.log('Found products:', products.count);

        const productsWithScore = products.rows.map((product) => {
          const productData = {
            id: product.id,
            type: 'product',
            title: product.namaProducts,
            description: product.deskripsi,
            price: product.harga,
            satuan: product.satuan,
            stock: product.stok,
            status: product.status,
            image: product.fotoTanaman,
            seller: {
              name: product.tbl_akun?.nama || 'Unknown',
              role: product.tbl_akun?.peran || 'Unknown'
            },
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            // Raw data untuk scoring
            namaProducts: product.namaProducts,
            deskripsi: product.deskripsi,
            tbl_akun: product.tbl_akun
          };

          // Hitung relevance score
          productData.relevanceScore = calculateRelevanceScore(
            productData,
            searchQuery,
            scoringConfig.products
          );

          return productData;
        });

        // Sort berdasarkan relevance score
        productsWithScore.sort((a, b) => {
          if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
          if (sortBy === 'date') return new Date(b.updatedAt) - new Date(a.updatedAt);
          if (sortBy === 'name') return a.title.localeCompare(b.title);
          return b.relevanceScore - a.relevanceScore;
        });

        // Apply pagination untuk type specific
        const paginatedProducts =
          type === 'product'
            ? productsWithScore.slice(offset, offset + limitFilter)
            : productsWithScore.slice(0, limitFilter);

        results.data.products = {
          items: paginatedProducts,
          total: products.count,
          showing: paginatedProducts.length
        };

        console.log('Products result:', {
          total: products.count,
          showing: paginatedProducts.length,
          firstItem: paginatedProducts[0]?.title
        });
      } catch (error) {
        console.error('Error searching products:', error);
        results.data.products = { items: [], total: 0, showing: 0 };
      }
    }

    // Search Toko/Sellers dengan relevance scoring - FIXED
    if (type === 'all' || type === 'toko') {
      try {
        console.log('Searching tokos for:', searchQuery);

        // console.log('Toko query:', JSON.stringify(tokoSearchQuery, null, 2));
        const tokos = await tbl_akun.findAll({
          attributes: { exclude: ['password'] },
          where: {
            [Op.or]: [{ nama: { [getLikeOperator()]: `%${searchQuery}%` } }]
          },
          include: [
            {
              model: penjual,
              as: 'penjual', // FIX ✔
              required: false
            },
            {
              model: dataPenyuluh,
              as: 'penyuluh', // FIX ✔
              required: false
            },
            {
              model: dataPetani,
              as: 'petani', // FIX ✔
              required: false
            }
          ],
          distinct: true, // Instead of GROUP BY, use DISTINCT to get unique results
          order: [['updatedAt', 'DESC']]
        });
        console.log('Found tokos:', tokos.length);
        const tokosWithScore = tokos.map((toko) => {
          const tokoData = {
            id: toko.id,
            type: 'toko',
            name: toko.nama,
            email: toko.email,
            phone: toko.no_wa,
            role: toko.peran,
            isVerified: toko.isVerified,
            avatar: toko.foto,
            productCount: toko.penjuals ? toko.penjuals.length : 0,
            createdAt: toko.createdAt,
            updatedAt: toko.updatedAt,
            alamat: toko.petani?.alamat || toko.penyuluh?.alamat,
            // Raw data untuk scoring
            nama: toko.nama,
            peran: toko.peran
          };

          tokoData.relevanceScore = calculateRelevanceScore(
            tokoData,
            searchQuery,
            scoringConfig.tokos
          );
          return tokoData;
        });

        tokosWithScore.sort((a, b) => {
          if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
          if (sortBy === 'date') return new Date(b.updatedAt) - new Date(a.updatedAt);
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          return b.relevanceScore - a.relevanceScore;
        });

        const paginatedTokos =
          type === 'toko'
            ? tokosWithScore.slice(offset, offset + limitFilter)
            : tokosWithScore.slice(0, limitFilter);

        results.data.tokos = {
          items: paginatedTokos,
          total: tokosWithScore.length,
          showing: paginatedTokos.length
        };

        console.log('Tokos result:', {
          // total: tokosWithScore.length,
          showing: paginatedTokos.length
          // firstItem: paginatedTokos[0]?.name
        });
      } catch (error) {
        console.error('Error searching tokos:', error);
        results.data.tokos = { items: [], total: 0, showing: 0 };
      }
    }

    // Search Berita dengan relevance scoring - UPDATED BERDASARKAN MODEL
    if (type === 'all' || type === 'berita') {
      try {
        console.log('Searching berita for:', searchQuery);

        const beritaSearchQuery = {
          where: {
            [Op.or]: [
              { judul: { [getLikeOperator()]: `%${searchQuery}%` } },
              { isi: { [getLikeOperator()]: `%${searchQuery}%` } }
            ]
          },
          order: [['createdAt', 'DESC']]
        };

        console.log('Berita query:', JSON.stringify(beritaSearchQuery, null, 2));

        const berita = await beritaTani.findAndCountAll(beritaSearchQuery);

        console.log('Found berita:', berita.count);

        const beritaWithScore = berita.rows.map((item) => {
          const beritaData = {
            id: item.id,
            type: 'berita',
            title: item.judul,
            content: item.isi,
            excerpt: item.isi ? item.isi.substring(0, 200) + '...' : '',
            category: item.kategori,
            image: item.fotoBerita,
            author: item.createdBy,
            publishedAt: item.tanggal,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            // Raw data untuk scoring
            judul: item.judul,
            isi: item.isi,
            kategori: item.kategori,
            createdBy: item.createdBy
          };

          beritaData.relevanceScore = calculateRelevanceScore(
            beritaData,
            searchQuery,
            scoringConfig.berita
          );

          return beritaData;
        });

        beritaWithScore.sort((a, b) => {
          if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
          if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
          if (sortBy === 'name') return a.title.localeCompare(b.title);
          return b.relevanceScore - a.relevanceScore;
        });

        const paginatedBerita =
          type === 'berita'
            ? beritaWithScore.slice(offset, offset + limitFilter)
            : beritaWithScore.slice(0, limitFilter);

        results.data.berita = {
          items: paginatedBerita,
          total: berita.count,
          showing: paginatedBerita.length
        };

        console.log('Berita result:', {
          total: berita.count,
          showing: paginatedBerita.length,
          firstItem: paginatedBerita[0]?.title
        });
      } catch (error) {
        console.error('Error searching berita:', error);
        results.data.berita = { items: [], total: 0, showing: 0 };
      }
    }

    // Search Events dengan relevance scoring - UPDATED BERDASARKAN MODEL
    if (type === 'all' || type === 'event') {
      try {
        console.log('Searching events for:', searchQuery);

        const eventSearchQuery = {
          where: {
            [Op.or]: [
              { namaKegiatan: { [getLikeOperator()]: `%${searchQuery}%` } },
              { isi: { [getLikeOperator()]: `%${searchQuery}%` } }
            ]
          },
          order: [['tanggalAcara', 'DESC']]
        };

        console.log('Event query:', JSON.stringify(eventSearchQuery, null, 2));

        const events = await eventTani.findAndCountAll(eventSearchQuery);

        console.log('Found events:', events.count);

        const eventsWithScore = events.rows.map((event) => {
          const eventData = {
            id: event.id,
            type: 'event',
            title: event.namaKegiatan,
            description: event.isi,
            location: event.tempat,
            participants: event.peserta,
            eventDate: event.tanggalAcara,
            eventTime: event.waktuAcara,
            image: event.fotoKegiatan,
            author: event.createdBy,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
            // Raw data untuk scoring
            namaKegiatan: event.namaKegiatan,
            isi: event.isi,
            tempat: event.tempat,
            peserta: event.peserta
          };

          eventData.relevanceScore = calculateRelevanceScore(
            eventData,
            searchQuery,
            scoringConfig.events
          );

          return eventData;
        });

        eventsWithScore.sort((a, b) => {
          if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
          if (sortBy === 'date') return new Date(b.eventDate) - new Date(a.eventDate);
          if (sortBy === 'name') return a.title.localeCompare(b.title);
          return b.relevanceScore - a.relevanceScore;
        });

        const paginatedEvents =
          type === 'event'
            ? eventsWithScore.slice(offset, offset + limitFilter)
            : eventsWithScore.slice(0, limitFilter);

        results.data.events = {
          items: paginatedEvents,
          total: events.count,
          showing: paginatedEvents.length
        };

        console.log('Events result:', {
          total: events.count,
          showing: paginatedEvents.length,
          firstItem: paginatedEvents[0]?.title
        });
      } catch (error) {
        console.error('Error searching events:', error);
        results.data.events = { items: [], total: 0, showing: 0 };
      }
    }

    // Untuk type 'all', gabungkan dan urutkan semua hasil berdasarkan relevance
    if (type === 'all') {
      const allSortedResults = sortAllResultsByRelevance(results.data, searchQuery);

      // Apply pagination pada hasil gabungan
      const paginatedAllResults = allSortedResults.slice(offset, offset + limitFilter);

      // Group kembali berdasarkan type untuk response structure
      const regroupedResults = {
        products: { items: [], total: 0, showing: 0 },
        tokos: { items: [], total: 0, showing: 0 },
        berita: { items: [], total: 0, showing: 0 },
        events: { items: [], total: 0, showing: 0 }
      };

      paginatedAllResults.forEach((item) => {
        const typeKey = item.searchType;
        if (regroupedResults[typeKey]) {
          regroupedResults[typeKey].items.push(item);
          regroupedResults[typeKey].showing++;
        }
      });

      // Keep original totals
      Object.keys(regroupedResults).forEach((key) => {
        if (results.data[key]) {
          regroupedResults[key].total = results.data[key].total;
        }
      });

      results.data = regroupedResults;
      results.allResults = {
        items: paginatedAllResults,
        total: allSortedResults.length,
        showing: paginatedAllResults.length
      };
    }

    // Calculate total results
    let totalResults = 0;
    Object.values(results.data).forEach((section) => {
      if (section && section.total) {
        totalResults += section.total;
      }
    });

    results.pagination.totalResults = totalResults;

    // Calculate pagination info for specific type
    if (type !== 'all') {
      const sectionData =
        results.data[
        type === 'toko'
          ? 'tokos'
          : type === 'berita'
            ? 'berita'
            : type === 'event'
              ? 'events'
              : 'products'
        ];

      if (sectionData) {
        results.pagination.totalPages = Math.ceil(sectionData.total / limitFilter);
        results.pagination.from = offset + 1;
        results.pagination.to = offset + sectionData.showing;
      }
    } else {
      // For 'all' type, use combined results for pagination
      if (results.allResults) {
        results.pagination.totalPages = Math.ceil(results.allResults.total / limitFilter);
        results.pagination.from = offset + 1;
        results.pagination.to = offset + results.allResults.showing;
      }
    }

    // Response message
    let message = `Ditemukan ${totalResults} hasil pencarian untuk "${searchQuery}"`;
    if (type !== 'all') {
      const typeNames = {
        product: 'produk',
        toko: 'toko',
        berita: 'berita',
        event: 'event'
      };
      const sectionData =
        results.data[
        type === 'toko'
          ? 'tokos'
          : type === 'berita'
            ? 'berita'
            : type === 'event'
              ? 'events'
              : 'products'
        ];
      message = `Ditemukan ${sectionData?.total || 0} ${typeNames[type]} untuk pencarian "${searchQuery}"`;
    }

    message += ` (diurutkan berdasarkan ${sortBy === 'relevance' ? 'relevansi' : sortBy === 'date' ? 'tanggal' : 'nama'
      })`;

    res.status(200).json({
      message: message,
      ...results
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Terjadi kesalahan saat melakukan pencarian'
    });
  }
};

// Helper function untuk pencarian spesifik
const searchSpecific = async (req, res) => {
  const { type } = req.params;
  req.query.type = type;
  return searchGlobal(req, res);
};

module.exports = {
  searchGlobal,
  searchSpecific
};
