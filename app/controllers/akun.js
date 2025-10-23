const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  tbl_akun: tblAkun,
  dataPerson,
  dataPetani,
  dataPenyuluh,
  kelompok,
  dataOperator,
  kecamatan,
  desa,
  kecamatanBinaan: KecamatanBinaanModel,
  desaBinaan: DesaBinaanModel,
  role: roleModel,
  permission: permissionModel
} = require('../models');
const ApiError = require('../../utils/ApiError');
const isEmailValid = require('../../utils/emailValidation');
const imageKit = require('../../midleware/imageKit');
const { Op, col, fn } = require('sequelize');

const crypto = require('crypto');
const { postActivity } = require('./logActivity');

dotenv.config();

// login semua akun (penyuluh, operator)
const login = async (req, res) => {
  try {
    const { email = '', password = '' } = req.body;
    const user = await tblAkun.findOne({
      where: { email },
      include: [
        {
          model: roleModel,
          as: 'role',
          include: [
            {
              model: permissionModel,
              as: 'permissions',
              where: { is_active: true },
              required: false
            }
          ]
        }
      ]
    });
    if (!user) throw new ApiError(400, 'Email tidak terdaftar.');
    if (user.peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses');
    }
    console.log('user', user);
    if (user.isVerified === false) {
      throw new ApiError(403, 'Akun belum diverifikasi oleh admin, mohon menunggu');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new ApiError(400, 'Password salah.');
    }

    if (bcrypt.compareSync(password, user.password)) {
      // generate token utk user yg success login
      const token = jwt.sign(
        {
          id: user.id
        },
        process.env.SECRET_KEY
      );
      res.status(200).json({
        message: 'Login berhasil.',
        token,
        user
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

// register akun baru yang hanya mengisi tblAkun
const register = async (req, res) => {
  try {
    const {
      email,
      no_wa,
      nama,
      password,
      pekerjaan = '',
      peran = ''
      // tipe_penyuluh = 'reguler'
    } = req.body;
    const { file } = req;
    const User = await tblAkun.findOne({ where: { email } });
    // validasi
    const validateEmail = isEmailValid(email);
    if (!email) throw new ApiError(400, 'Email tidak boleh kosong.');
    if (!validateEmail) throw new ApiError(400, 'Email tidak valid.');
    if (!password) throw new ApiError(400, 'Password tidak boleh kosong.');
    if (!nama) throw new ApiError(400, 'Nama tidak boleh kosong.');
    if (!no_wa) throw new ApiError(400, 'no wa tidak boleh kosong.');
    if (!nama) throw new ApiError(400, 'Nama tidak boleh kosong.');
    if (User) throw new ApiError(400, 'Email telah terdaftar.');
    // if (!tipe_penyuluh) throw new ApiError(400, 'Tipe penyuluh tidak boleh kosong.');
    if (password.length < 8) {
      throw new ApiError(400, 'Masukkan password minimal 8 karakter');
    }
    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // generate 6digit random number
    const accountID = crypto.randomUUID();
    let urlImg;
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format'
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`
      });
      urlImg = img.url;
    }
    // buat user baru
    const user = await tblAkun.create({
      email,
      password: hashedPassword,
      no_wa,
      nama,
      pekerjaan,
      peran,
      foto: urlImg,
      accountID: accountID
    });

    // generate token utk user yg success login
    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.SECRET_KEY
    );

    postActivity({
      user_id: user.id,
      activity: 'REGISTER',
      type: 'USER',
      detail_id: user.id
    });

    res.status(200).json({
      message: 'Registrasi berhasil',
      token: token
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

// register penyuluh
const registerPenyuluh = async (req, res) => {
  try {
    const {
      NIP,
      email,
      NoWa,
      alamat,
      desa: inputDesa,
      desaId,
      nama,
      kecamatan: inputKecamatan,
      kecamatanId,
      password,
      namaProduct,
      kecamatanBinaan,
      desaBinaan,
      selectedKelompokIds,
      pekerjaan,
      tipe
    } = req.body;
    console.log(req.body);
    // const kelompokArray = selectedKelompokIds.split(',');
    const hashedPassword = bcrypt.hashSync(password, 10);
    const accountID = crypto.randomUUID();
    const { file } = req;
    const penyuluh = await dataPenyuluh.findOne({
      where: { nik: NIP }
    });
    let urlImg;
    if (!NIP) {
      throw new ApiError(400, 'NIP tidak boleh kosong');
    }
    if (!nama) {
      throw new ApiError(400, 'nama tidak boleh kosong');
    }
    if (penyuluh) {
      throw new ApiError(400, 'NIP sudah digunakan');
    }
    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        return res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format'
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      try {
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        urlImg = img.url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError.message);
        // Handle the error, and possibly return an error response to the client.
        return res.status(500).json({
          status: 'failed',
          message: 'Error uploading image.'
        });
      }
    }

    {
      /* Membuat akun untuk penyuluh yang didaftarkan */
    }
    let newAccount;
    if (tipe === 'reguler') {
      const role = await roleModel.findOne({
        where: { name: 'penyuluh' }
      });
      newAccount = await tblAkun.create({
        email,
        password: hashedPassword,
        no_wa: NoWa,
        nama,
        pekerjaan,
        peran: 'penyuluh',
        foto: urlImg,
        accountID: accountID,
        isVerified: false,
        role_id: role.id
      });
    } else if (tipe === 'swadaya') {
      const role = await roleModel.findOne({
        where: { name: 'penyuluh_swadaya' }
      });
      newAccount = await tblAkun.create({
        email,
        password: hashedPassword,
        no_wa: NoWa,
        nama,
        pekerjaan,
        peran: 'penyuluh_swadaya',
        foto: urlImg,
        accountID: accountID,
        isVerified: false,
        role_id: role.id
      });
    }
    {
      /* Menambahkan penyuluh yang didaftarkan */
    }
    let kecamatanData = null;
    let desaData = null;

    // Jika kecamatanId provided, cari datanya
    if (kecamatanId) {
      kecamatanData = await kecamatan.findByPk(kecamatanId);
      if (!kecamatanData) {
        throw new ApiError(400, `Kecamatan dengan ID ${kecamatanId} tidak ditemukan`);
      }
    } else if (inputKecamatan) {
      // Jika nama kecamatan provided, cari by name
      kecamatanData = await kecamatan.findOne({
        where: { nama: inputKecamatan }
      });
      if (!kecamatanData) {
        throw new ApiError(400, `Kecamatan ${inputKecamatan} tidak ditemukan`);
      }
    }

    // Logic yang sama untuk desa
    if (desaId) {
      desaData = await desa.findByPk(desaId);
      if (!desaData) {
        throw new ApiError(400, `Desa dengan ID ${desaId} tidak ditemukan`);
      }
    } else if (inputDesa) {
      desaData = await desa.findOne({
        where: { nama: inputDesa }
      });
      if (!desaData) {
        throw new ApiError(400, `Desa ${inputDesa} tidak ditemukan`);
      }
    }
    const newPenyuluh = await dataPenyuluh.create({
      nik: NIP,
      nama: nama,
      foto: urlImg,
      alamat,
      email,
      noTelp: NoWa,
      kecamatan: inputKecamatan,
      desa: inputDesa,
      password: hashedPassword,
      namaProduct,
      desaBinaan: desaBinaan,
      kecamatanBinaan,
      accountID: accountID,
      kecamatanId: kecamatanData ? kecamatanData.id : null,
      desaId: desaData ? desaData.id : null,
      tipe: tipe
    });
    // // Convert each element of kelompokArray to an integer
    // const integerKelompokArray = kelompokArray.map((kelompokId) => parseInt(kelompokId, 10))

    // ============ TAMBAHKAN CODE INI ============
    // CREATE KECAMATAN BINAAN
    if (kecamatanBinaan) {
      try {
        // Cari kecamatan berdasarkan nama
        const kecamatanBinaanData = await kecamatan.findOne({
          where: { nama: kecamatanBinaan }
        });

        if (kecamatanBinaanData) {
          await KecamatanBinaanModel.create({
            penyuluhId: newPenyuluh.id,
            kecamatanId: kecamatanBinaanData.id
          });
          console.log('Kecamatan binaan created:', kecamatanBinaanData.nama);
        }
      } catch (kecamatanError) {
        console.error('Error creating kecamatan binaan:', kecamatanError);
      }
    }

    // CREATE DESA BINAAN

    // 2. CREATE DESA BINAAN
    if (desaBinaan && desaBinaan.trim() !== '') {
      try {
        // ✅ Split by comma and trim each nama desa
        const desaBinaanArray = desaBinaan
          .split(',')
          .map((nama) => nama.trim())
          .filter((nama) => nama !== '');

        console.log('Processing desa binaan:', desaBinaanArray);

        for (const namaDesaBinaan of desaBinaanArray) {
          // ✅ Find desa by NAMA (not ID)
          const desaData = await desa.findOne({
            where: { nama: namaDesaBinaan }
          });

          if (desaData) {
            await DesaBinaanModel.create({
              // ✅ Using renamed model
              penyuluhId: newPenyuluh.id,
              desaId: desaData.id
            });
            console.log('✅ Desa binaan created:', namaDesaBinaan, '(ID:', desaData.id, ')');
          } else {
            console.log('⚠️ Desa binaan not found:', namaDesaBinaan);
          }
        }
      } catch (error) {
        console.error('❌ Error creating desa binaan:', error);
      }
    }

    // UPDATE KELOMPOK (jika ada selectedKelompokIds)
    if (selectedKelompokIds && selectedKelompokIds.trim() !== '') {
      try {
        const kelompokIdArray = selectedKelompokIds
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));

        console.log('Processing kelompok IDs:', kelompokIdArray);

        for (const kelompokId of kelompokIdArray) {
          const kelompokData = await kelompok.findByPk(kelompokId);
          if (kelompokData) {
            await kelompokData.update({
              penyuluh: newPenyuluh.id
            });
            console.log('✅ Kelompok updated:', kelompokId);
          } else {
            console.log('⚠️ Kelompok not found:', kelompokId);
          }
        }
      } catch (error) {
        console.error('❌ Error updating kelompok:', error);
      }
    }
    // ============ END OF NEW CODE ============
    res.status(200).json({
      message: 'berhasil menambahkan data Penyuluh',
      newPenyuluh,
      newAccount
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const loginPetani = async (req, res) => {
  try {
    const { NIK = '', password = '' } = req.body;

    if (!NIK) {
      throw new ApiError(
        400,
        'Masukkan NIK untuk Petani atau NIP untuk Penyuluh, tidak bisa keduanya.'
      );
    }
    if (NIK) {
      const userPetani = await dataPetani.findOne({ where: { NIK } });
      console.log(userPetani);
      if (!userPetani) throw new ApiError(400, 'NIK tidak terdaftar.');

      console.log(userPetani.accountID); //ada accound id dan ada accountID di dalam userPetani
      const user = await tblAkun.findOne({
        where: { accountID: userPetani.accountID },
        include: [
          {
            model: roleModel,
            as: 'role',
            include: [
              {
                model: permissionModel,
                as: 'permissions',
                where: { is_active: true },
                required: false
              }
            ]
          }
        ]
      });
      console.log(user); //

      if (!user.isVerified) {
        throw new ApiError(400, 'Akun belum diverifikasi oleh admin, mohon menunggu');
      }

      // Cek jika password masih null/kosong - arahkan ke set password
      if (!userPetani.password || userPetani.password === null) {
        return res.status(200).json({
          message: 'Password belum diatur. Silakan atur password terlebih dahulu.',
          needSetPassword: true,
          user: userPetani
        });
      }

      // Validasi password jika sudah diset
      if (!password) {
        throw new ApiError(400, 'Password tidak boleh kosong.');
      }

      if (!bcrypt.compareSync(password, userPetani.password)) {
        throw new ApiError(400, 'Password salah.');
      }

      // Login berhasil
      const token = jwt.sign(
        {
          id: user.id,
          NIK: userPetani.NIK,
          accountID: userPetani.accountID
        },
        process.env.SECRET_KEY
      );

      return res.status(200).json({
        message: 'Login berhasil.',
        token,
        user: user
      });
    } else {
      throw new ApiError(400, 'NIK tidak boleh kosong.');
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

// Controller untuk set password pertama kali
const setPetaniPassword = async (req, res) => {
  try {
    const { NIK, password, confirmPassword } = req.body;

    // Validasi input
    if (!NIK || !password || !confirmPassword) {
      throw new ApiError(400, 'NIK, password, dan konfirmasi password wajib diisi.');
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, 'Password dan konfirmasi password tidak cocok.');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password minimal 6 karakter.');
    }

    // Cari petani berdasarkan NIK
    const userPetani = await dataPetani.findOne({ where: { NIK } });
    if (!userPetani) {
      throw new ApiError(400, 'NIK tidak terdaftar.');
    }

    // Cek apakah akun sudah diverifikasi
    const user = await tblAkun.findOne({
      where: { accountID: userPetani.accountID }
    });

    if (!user.isVerified) {
      throw new ApiError(400, 'Akun belum diverifikasi oleh admin.');
    }

    // Cek apakah password sudah pernah diset
    if (userPetani.password && userPetani.password !== null) {
      throw new ApiError(
        400,
        'Password sudah pernah diatur. Silakan login dengan password yang ada.'
      );
    }

    // Hash password dan update
    const hashedPassword = bcrypt.hashSync(password, 10);
    await dataPetani.update({ password: hashedPassword }, { where: { NIK } });

    res.status(200).json({
      message: 'Password berhasil diatur. Silakan login kembali.'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const registerPetani = async (req, res) => {
  try {
    let {
      NIK, // mandatory
      NKK, // not mandatory
      nama, // mandatory
      email, // not mandatory
      alamat, // mandatory
      desa: inputDesa, // mandatory
      desaId,
      kecamatan: inputKecamatan, // mandatory
      kecamatanId,
      password, // mandatory
      NoWa, // mandatory
      gapoktan, // mandatory
      penyuluh, // mandatory
      namaKelompok // mandatory
    } = req.body;
    const { file } = req;
    // validasi
    if (!NIK) throw new ApiError(400, 'NIK tidak boleh kosong');
    if (!NKK) NKK = NIK;
    if (!nama) throw new ApiError(400, 'nama tidak boleh kosong');
    if (!email) email = nama.split(' ')[0] + '@gmail.com';
    if (!alamat) throw new ApiError(400, 'Alamat tidak boleh kosong.');
    if (!inputDesa && !desaId) throw new ApiError(400, 'Desa tidak boleh kosong.');
    if (!inputKecamatan && !kecamatanId) throw new ApiError(400, 'Kecamatan tidak boleh kosong.');
    if (!password) throw new ApiError(400, 'Password tidak boleh kosong.');
    if (!NoWa) throw new ApiError(400, 'no wa tidak boleh kosong.');
    if (!gapoktan) throw new ApiError(400, 'Gapoktan tidak boleh kosong.');
    if (!penyuluh) throw new ApiError(400, 'Penyuluh tidak boleh kosong.');
    if (!namaKelompok) throw new ApiError(400, 'nama kelompok tidak boleh kosong.');
    const tani = await dataPetani.findOne({ where: { NIK } });
    if (tani) throw new ApiError(400, 'NIK sudah digunakan');

    const hashedPassword = bcrypt.hashSync(password, 10);
    const accountID = crypto.randomUUID();
    let urlImg = '';

    const penyuluhData = await dataPenyuluh.findOne({
      where: { id: penyuluh }
    });

    const kelompokData = await kelompok.findOne({
      where: {
        gapoktan: gapoktan,
        namaKelompok: namaKelompok,
        desa: inputDesa
      }
    });

    if (!kelompokData) throw new ApiError(400, 'Kelompok tani tidak ditemukan');

    if (file) {
      const validFormat =
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif';
      if (!validFormat) {
        res.status(400).json({
          status: 'failed',
          message: 'Wrong Image Format'
        });
      }
      const split = file.originalname.split('.');
      const ext = split[split.length - 1];

      // upload file ke imagekit
      const img = await imageKit.upload({
        file: file.buffer,
        fileName: `IMG-${Date.now()}.${ext}`
      });
      urlImg = img.url;
    }
    const role = await roleModel.findOne({ where: { name: 'petani' } });
    const newUser = await tblAkun.create({
      email: email,
      password: hashedPassword,
      no_wa: NoWa,
      nama,
      pekerjaan: '',
      peran: 'petani',
      foto: urlImg,
      accountID: accountID,
      role_id: role.id
    });

    let kecamatanData;
    if (!kecamatanId) {
      kecamatanData = await kecamatan.findOne({
        where: { nama: inputKecamatan }
      });

      if (!kecamatanData) {
        return res.status(400).json({
          message: 'Kecamatan tidak ditemukan'
        });
      }
    }
    let desaData;
    if (!desaId) {
      desaData = await desa.findOne({
        where: {
          nama: inputDesa,
          kecamatanId: kecamatanData.id ?? kecamatanId
        }
      });

      if (!desaData) {
        return res.status(400).json({
          message: 'Desa tidak ditemukan'
        });
      }
    }

    const daftarTani = await dataPetani.create({
      nik: NIK,
      nkk: NKK,
      nama,
      foto: urlImg,
      alamat,
      desa: inputDesa,
      kecamatan: inputKecamatan,
      password: hashedPassword,
      email: email,
      noTelp: NoWa,
      accountID: accountID,
      fk_penyuluhId: penyuluhData.id,
      fk_kelompokId: kelompokData.id,
      kecamatanId: kecamatanId || kecamatanData.id,
      desaId: desaId || desaData.id
    });

    const token = jwt.sign(
      {
        id: newUser.id
      },
      process.env.SECRET_KEY
    );

    postActivity({
      user_id: newUser.id,
      activity: 'REGISTER',
      type: 'USER',
      detail_id: newUser.id
    });

    res.status(200).json({
      message: 'Berhasil Registrasi Silahkan Login',
      user: daftarTani,
      token
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const opsiPenyuluh = async (req, res) => {
  try {
    const dataDaftarPenyuluh = await dataPenyuluh.findAll({
      include: [
        { model: kecamatan, as: 'kecamatanData' },
        { model: desa, as: 'desaData' },
        {
          model: KecamatanBinaanModel,
          as: 'kecamatanBinaanData',
          include: [{ model: kecamatan }]
        },
        {
          model: DesaBinaanModel,
          as: 'desaBinaanData',
          include: [{ model: desa }]
        }
      ],
      order: [['nama', 'ASC']]
    });

    res.status(200).json({
      message: 'Semua Data Penyuluh',
      dataDaftarPenyuluh
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const opsiPoktan = async (req, res) => {
  try {
    const kelompokTani = await kelompok.findAll();
    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Info Tani',
      kelompokTani
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getUserNotVerify = async (req, res) => {
  const { peran } = req.user || {};
  const { page, limit } = req.query;

  try {
    if (!peran) {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    } else {
      const limitFilter = Number(limit) || 10;
      const pageFilter = Number(page) || 1;

      const query = {
        where: { verify: false },
        limit: limitFilter,
        offset: (pageFilter - 1) * limitFilter
      };

      const data = await tblAkun.findAll(query);
      const total = await tblAkun.count({ where: { verify: false } });

      res.status(200).json({
        message: 'Data User Berhasil Diperoleh',
        data,
        total,
        currentPages: pageFilter,
        limit: limitFilter,
        maxPages: Math.ceil(total / limitFilter),
        from: (pageFilter - 1) * limitFilter + 1,
        to: (pageFilter - 1) * limitFilter + data.length
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const verifikasi = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await tblAkun.findOne({ where: { id } });
    if (!user) throw new ApiError(400, 'user tidak ditemukan');
    await tblAkun.update(
      { isVerified: true },
      {
        where: {
          id
        }
      }
    );

    return res.status(200).json({
      message: 'User berhasil diverifikasi'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      return res.status(401).json({
        status: 'failed',
        message: 'Required authorization'
      });
    }
    const payload = jwt.verify(bearerToken, process.env.SECRET_KEY);
    const user = await tblAkun.findByPk(payload.id);

    let role;

    const roleData = await roleModel.findOne({ where: { id: user.role_id } });

    if (user.peran === 'petani' || roleData.name === 'petani') {
      role = await dataPetani.findOne({
        where: { accountID: user.accountID },
        include: [
          {
            model: dataPenyuluh,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'password']
            }
          },
          { model: kecamatan, as: 'kecamatanData' },
          { model: desa, as: 'desaData' }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password']
        }
      });
    } else if (
      user.peran === 'penyuluh' ||
      roleData.name === 'penyuluh' ||
      roleData.name === 'penyuluh_swadaya'
    ) {
      role = await dataPenyuluh.findOne({
        where: { accountID: user.accountID },
        include: [
          { model: kelompok, as: 'kelompoks' },
          { model: kecamatan, as: 'kecamatanData' },
          { model: desa, as: 'desaData' },
          {
            model: KecamatanBinaanModel,
            as: 'kecamatanBinaanData',
            include: [
              {
                model: kecamatan
              }
            ]
          },
          {
            model: DesaBinaanModel,
            as: 'desaBinaanData',
            include: [
              {
                model: desa,
                include: [
                  {
                    model: kecamatan
                  }
                ]
              }
            ]
          }
        ]
      });
    } else if (user.peran === 'operator' || roleModel.name === 'operator_poktan') {
      role = await dataOperator.findOne({
        where: { accountID: user.accountID },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password']
        }
      });
    }
    return res.status(200).json({
      message: 'berhasil',
      userAccount: user,
      userRole: role
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getDetailProfile = async (req, res) => {
  try {
    const { accountID, peran, role } = req.user;
    // console.log('role user', role);
    // const roleData = await roleModel.findOne({ where: { id: peran } });
    console.log('account id is ', accountID);
    console.log('role is ', role);
    console.log('peran is ', peran);
    if (accountID) {
      let data;
      if (peran === 'penyuluh' || role.name === 'penyuluh' || role.name === 'penyuluh_swadaya') {
        data = await dataPenyuluh.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun
            },
            {
              model: kecamatan,
              as: 'kecamatanData'
            },
            {
              model: desa,
              as: 'desaData'
            },
            {
              model: KecamatanBinaanModel,
              as: 'kecamatanBinaanData',
              include: [
                {
                  model: kecamatan
                }
              ]
            },
            {
              model: DesaBinaanModel,
              as: 'desaBinaanData',
              include: [
                {
                  model: desa
                }
              ]
            },
            { model: kelompok, as: 'kelompoks' }
          ]
        });
      } else if (peran === 'petani' || role.name === 'petani') {
        data = await dataPetani.findOne({
          where: { accountID: accountID },
          include: [
            {
              model: tblAkun
            },
            {
              model: kelompok,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: dataPenyuluh,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: kecamatan,
              as: 'kecamatanData'
            },
            {
              model: desa,
              as: 'desaData'
            }
          ]
        });
      } else if (peran === 'operator poktan' || role.name === 'operator_poktan') {
        //
        data = await dataOperator.findOne({
          where: { accountID: accountID }, //mengapa selalu undifined walaupun accountID nya cocok?
          include: [
            {
              model: tblAkun
            }
          ]
        });
      } else {
        data = await tblAkun.findOne({ where: { accountID: accountID } });
      }
      res.status(200).json({
        message: 'berhasil',
        data
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const updateDetailProfile = async (req, res) => {
  const { accountID, peran, role } = req.user;

  try {
    if (peran === 'penyuluh' || role.name === 'penyuluh' || role.name === 'penyuluh_swadaya') {
      const {
        nik,
        email,
        whatsapp,
        alamat,
        desa: inputDesa,
        desaId,
        nama,
        kecamatan: inputKecamatan,
        kecamatanId,
        password,
        passwordBaru,
        namaProduct,
        kecamatanBinaan,
        desaBinaan
      } = req.body;
      const data = await dataPenyuluh.findOne({
        where: {
          accountID
        }
      });
      if (!data) throw new ApiError(400, 'data tidak ditemukan.');
      if (password) {
        if (!bcrypt.compareSync(password, data.password)) {
          throw new ApiError(400, 'Password salah.');
        }
      }
      let urlImg;
      const { file } = req;
      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        urlImg = img.url;
      }

      const accountUpdate = await tblAkun.update(
        {
          email: email || data.email,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          no_wa: whatsapp || data.no_wa,
          nama: nama || data.nama,
          foto: urlImg || data.foto
        },
        {
          where: { accountID: accountID }
        }
      );
      let kecamatanData;
      if (!kecamatanId) {
        kecamatanData = await kecamatan.findOne({
          where: { nama: inputKecamatan || data.kecamatan }
        });
        if (!kecamatanData) {
          return res.status(400).json({
            message: 'Kecamatan tidak ditemukan'
          });
        }
      }
      let desaData;
      if (!desaId) {
        desaData = await desa.findOne({
          where: {
            nama: inputDesa || data.desa,
            kecamatanId: kecamatanId || kecamatanData.id
          }
        });
        if (!desaData) {
          return res.status(400).json({
            message: 'Desa tidak ditemukan'
          });
        }
      }
      const newDataPenyuluh = await dataPenyuluh.update(
        {
          nik: nik || data.nik,
          email: email || data.email,
          noTelp: whatsapp || data.noTelp,
          alamat: alamat || data.alamat,
          desa: inputDesa || data.desa,
          nama: nama || data.nama,
          kecamatan: inputKecamatan || data.kecamatan,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          namaProduct: namaProduct || data.namaProduct,
          kecamatanBinaan: kecamatanBinaan || data.kecamatanBinaan,
          desaBinaan: desaBinaan || data.desaBinaan,
          foto: urlImg || data.foto,
          kecamatanId: kecamatanId || kecamatanData.id,
          desaId: desaId || desaData.id
        },
        {
          where: {
            accountID: accountID
          }
        }
      );

      newDataPenyuluh && accountUpdate
        ? res.status(200).json({
            message: 'Berhasil Mengubah Profil'
          })
        : res.status(400).json({
            message: 'Gagal Mengubah Profil'
          });
    } else if (peran === 'petani' || role.name === 'petani') {
      const {
        nik,
        nokk,
        email,
        whatsapp,
        alamat,
        desa: inputDesa,
        desaId,
        nama,
        kecamatan: inputKecamatan,
        kecamatanId,
        password,
        passwordBaru
      } = req.body;
      const data = await dataPetani.findOne({
        where: {
          accountID
        }
      });
      if (password) {
        if (!bcrypt.compareSync(password, data.password)) {
          throw new ApiError(400, 'Password salah.');
        }
      }
      let urlImg;
      const { file } = req;
      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        urlImg = img.url;
      }

      const accountUpdate = await tblAkun.update(
        {
          email,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          no_wa: whatsapp || data.no_wa,
          nama,
          // pekerjaan: "",
          // peran: "petani",
          foto: urlImg || data.foto
        },
        {
          where: { accountID: accountID }
        }
      );

      let kecamatanData;
      if (!kecamatanId) {
        kecamatanData = await kecamatan.findOne({
          where: { nama: inputKecamatan || data.kecamatan }
        });

        if (!kecamatanData) {
          return res.status(400).json({
            message: 'Kecamatan tidak ditemukan'
          });
        }
      }
      let desaData;
      if (!desaId) {
        desaData = await desa.findOne({
          where: {
            nama: inputDesa || data.desa,
            kecamatanId: kecamatanData.id ?? data.kecamatanId
          }
        });

        if (!desaData) {
          return res.status(400).json({
            message: 'Desa tidak ditemukan'
          });
        }
      }

      const petaniUpdate = await dataPetani.update(
        {
          nik: nik || data.nik,
          nkk: nokk || data.nkk,
          nama: nama || data.nama,
          alamat: alamat || data.alamat,
          desa: inputDesa || data.desa,
          kecamatan: inputKecamatan || data.kecamatan,
          password: passwordBaru ? bcrypt.hashSync(passwordBaru, 10) : data.password, // Hash password only if provided
          email: email || data.email,
          foto: urlImg || data.foto,
          noTelp: whatsapp || data.noTelp,
          kecamatanId: kecamatanId || kecamatanData.id,
          desaId: desaId || desaData.id
        },
        {
          where: { accountID: accountID }
        }
      );
      petaniUpdate && accountUpdate
        ? res.status(200).json({
            message: 'Berhasil Mengubah Profil'
          })
        : res.status(400).json({
            message: 'Gagal Mengubah Profil'
          });
    } else if (peran === 'operator poktan' || role.name === 'operator_poktan') {
      const { nik, email, whatsapp, alamat, desa, nama, kecamatan, baru } = req.body;
      const data = await dataOperator.findOne({
        where: {
          accountID
        }
      });
      let urlImg;
      const { file } = req;
      if (file) {
        const validFormat =
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif';
        if (!validFormat) {
          return res.status(400).json({
            status: 'failed',
            message: 'Wrong Image Format'
          });
        }
        const split = file.originalname.split('.');
        const ext = split[split.length - 1];

        // upload file ke imagekit
        const img = await imageKit.upload({
          file: file.buffer,
          fileName: `IMG-${Date.now()}.${ext}`
        });
        img.url;
        urlImg = img.url;
      }
      const accountUpdate = await tblAkun.update(
        {
          email,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          no_wa: whatsapp || data.no_wa,
          nama,
          // pekerjaan: "",
          // peran: "petani",
          foto: urlImg || data.foto
        },
        {
          where: { accountID: accountID }
        }
      );
      const operatorUpdate = await dataOperator.update(
        {
          nik: nik || data.nik,
          email: email || data.email,
          noTelp: whatsapp || data.noTelp,
          alamat: alamat || data.alamat,
          desa: desa || data.desa,
          nama: nama || data.nama,
          kecamatan: kecamatan || data.kecamatan,
          password: baru ? bcrypt.hashSync(baru, 10) : data.password, // Hash password only if provided
          foto: urlImg || data.foto
        },
        {
          where: {
            accountID: accountID
          }
        }
      );
      res.status(200).json({
        message: 'Berhasil Mengubah Profil',
        operatorUpdate,
        accountUpdate
      });
    } else {
      const { peran, role } = req.body;
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getPeran = async (req, res) => {
  const { page, limit, search } = req.query;
  try {
    const limitFilter = Number(limit) || 10;
    const pageFilter = Number(page) || 1;

    // filter pencarian
    const where = search
      ? {
          [Op.or]: [{ nama: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
        }
      : {};

    const query = {
      where,
      limit: limitFilter,
      offset: (pageFilter - 1) * limitFilter
    };

    const data = await tblAkun.findAll(query);
    const total = await tblAkun.count({ where });

    res.status(200).json({
      message: 'berhasil',
      data,
      total,
      currentPages: pageFilter,
      limit: limitFilter,
      maxPages: Math.ceil(total / limitFilter),
      from: (pageFilter - 1) * limitFilter + 1,
      to: (pageFilter - 1) * limitFilter + data.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const ubahPeran = async (req, res) => {
  const { id, roles } = req.body;

  try {
    const user = await tblAkun.findOne({ where: { id: id } });
    let detailUser;
    if (!user) throw new ApiError(400, 'user tidak ditemukan');

    // Debug: Log user data
    console.log('User data:', JSON.stringify(user, null, 2));

    // check detail user in every table
    detailUser = await dataPetani.findOne({
      where: { accountID: user.accountID }
    });

    if (!detailUser) {
      detailUser = await dataPenyuluh.findOne({
        where: { accountID: user.accountID }
      });
    }
    if (!detailUser) {
      detailUser = await dataOperator.findOne({
        where: { accountID: user.accountID }
      });
    }

    // Debug: Log detail user data
    console.log('Detail user data:', JSON.stringify(detailUser, null, 2));

    const jsonDetailUser = JSON.parse(JSON.stringify(detailUser));
    const jsonUser = JSON.parse(JSON.stringify(user));

    const {
      id: detailId,
      createdAt,
      updatedAt,
      ...payload
    } = {
      ...jsonDetailUser,
      ...jsonUser,
      noTelp: jsonDetailUser?.noTelp || jsonUser.no_wa
    };

    // Debug: Log payload before create
    console.log('Payload for create:', JSON.stringify(payload, null, 2));

    // Store old role before updating
    const oldRole = user.peran;
    console.log('Old role:', oldRole, 'New role:', roles);

    let roleName = roles;
    switch (roles) {
      case 'operator admin':
        roleName = 'operator_admin';
        break;
      case 'operator super admin':
        roleName = 'operator_super_admin';
        break;
      case 'operator poktan':
        roleName = 'operator_poktan';
        break;
      case 'penyuluh':
        roleName = 'penyuluh';
        break;
      case 'petani':
        roleName = 'petani';
        break;
      default:
        roleName = roles;
    }
    const roleUser = await roleModel.findOne({ where: { name: roleName } });
    if (!roleUser) throw new ApiError(400, 'role tidak ditemukan');

    // Update user role first
    await tblAkun.update(
      { peran: roles, role_id: roleUser.id },
      {
        where: {
          id
        }
      }
    );

    // Update user role first
    await tblAkun.update(
      { peran: roles },
      {
        where: {
          id
        }
      }
    );

    // Remove from old role table
    if (oldRole === 'petani') {
      await dataPetani.destroy({ where: { accountID: user.accountID } });
    } else if (oldRole === 'penyuluh') {
      await dataPenyuluh.destroy({
        where: { accountID: user.accountID }
      });
    } else if (
      oldRole === 'operator super admin' ||
      oldRole === 'operator admin' ||
      oldRole === 'operator poktan'
    ) {
      await dataOperator.destroy({
        where: { accountID: user.accountID }
      });
    }

    // Clean payload before creating - remove fields that might cause conflicts
    const cleanPayload = {
      accountID: user.accountID,
      nama: payload.nama || user.nama,
      noTelp: payload.noTelp
      // Add other required fields for petani table here
      // Remove any fields that don't belong to the target table
    };

    // Debug: Log clean payload
    console.log('Clean payload:', JSON.stringify(cleanPayload, null, 2));

    // Add to new role table
    if (roles === 'petani') {
      // Ensure all required fields for dataPetani are present
      const petaniPayload = {
        ...cleanPayload
        // Add any petani-specific required fields here
        // Example: alamat, ktp, etc.
      };

      console.log('Creating dataPetani with:', JSON.stringify(petaniPayload, null, 2));
      await dataPetani.create(petaniPayload);
    } else if (roles === 'penyuluh') {
      const penyuluhPayload = {
        ...cleanPayload
        // Add any penyuluh-specific required fields here
      };

      console.log('Creating dataPenyuluh with:', JSON.stringify(penyuluhPayload, null, 2));
      await dataPenyuluh.create(penyuluhPayload);
    } else {
      const operatorPayload = {
        ...cleanPayload
        // Add any operator-specific required fields here
      };

      console.log('Creating dataOperator with:', JSON.stringify(operatorPayload, null, 2));
      await dataOperator.create(operatorPayload);
    }

    return res.status(200).json({
      message: 'Peran berhasil diubah'
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Error in ubahPeran:', error);
    console.error('Error stack:', error.stack);

    // Log validation errors specifically
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:', error.errors);
    }

    res.status(error.statusCode || 500).json({
      message: error.message,
      // In development, you might want to include more error details
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack,
        validationErrors: error.errors || null
      })
    });
  }
};

const changeKecamatanToId = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { debug, wrongKecamatan, correctKecamatan, getWrong } = req.query;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (getWrong) {
      const data = await dataPetani.findAll({
        where: {
          [Op.and]: [{ kecamatan: { [Op.not]: null } }, { kecamatanId: null }]
        },
        include: [
          {
            model: kecamatan,
            as: 'kecamatanData'
          }
        ]
      });
      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (debug) {
      const data = await dataPetani.findAll({
        where: {
          kecamatan: {
            [Op.like]: `%${wrongKecamatan}%`
          }
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (correctKecamatan) {
      await dataPetani.update(
        {
          kecamatan: correctKecamatan
        },
        {
          where: {
            kecamatan: wrongKecamatan
          }
        }
      );
    } else {
      const dataKecamatans = await kecamatan.findAll({});

      for (let i = 0; i < dataKecamatans.length; i++) {
        const kecamatanResult = dataKecamatans[i];

        await dataPetani.update(
          {
            kecamatanId: kecamatanResult.id
          },
          {
            where: {
              kecamatan: kecamatanResult.nama
            }
          }
        );
      }
    }

    return res.status(200).json({
      message: 'Berhasil mengubah kecamatan'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const changeDesaToId = async (req, res) => {
  const { peran } = req.user || {};
  try {
    const { debug, wrongDesa, correctDesa, getWrong, kecamatanId, updateEmpty } = req.query;

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    if (getWrong) {
      const data = await dataPetani.findAll({
        where: {
          [Op.and]: [
            { desa: { [Op.not]: null } },
            { desaId: null },
            kecamatanId ? { kecamatanId } : {}
          ]
        }
      });
      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (debug) {
      const data = await dataPetani.findAll({
        where: {
          desa: {
            [Op.like]: `%${wrongDesa}%`
          }
        }
      });

      return res.status(200).json({
        message: 'Berhasil mendapatkan data petani',
        data
      });
    }

    if (updateEmpty) {
      await dataPetani.update(
        {
          desa: col('alamat')
        },
        {
          where: {
            desa: ''
          }
        }
      );
    }

    if (correctDesa) {
      await dataPetani.update(
        {
          desa: correctDesa
        },
        {
          where: {
            [Op.and]: [{ desa: wrongDesa }, kecamatanId ? { kecamatanId } : {}]
          }
        }
      );
    } else {
      const dataDesas = await desa.findAll({});

      for (let i = 0; i < dataDesas.length; i++) {
        const desaResult = dataDesas[i];

        await dataPetani.update(
          {
            desaId: desaResult.id
          },
          {
            where: {
              desa: desaResult.nama,
              kecamatanId: desaResult.kecamatanId
            }
          }
        );
      }
    }

    return res.status(200).json({
      message: 'Berhasil mengubah desa'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getMetaUserRole = async (req, res) => {
  try {
    // Hitung total user
    const totalUser = await tblAkun.count();

    // Hitung user per role dengan group
    const roleCounts = await tblAkun.findAll({
      attributes: ['peran', [fn('COUNT', col('id')), 'count']],
      group: ['peran']
    });

    // Konversi hasil ke object agar lebih mudah dibaca
    const roleMap = {};
    roleCounts.forEach((item) => {
      roleMap[item.peran] = item.get('count');
    });

    res.status(200).json({
      message: 'Meta data user berhasil diperoleh',
      totalUser,
      roles: {
        operator_super_admin: roleMap['operator super admin'] || 0,
        penyuluh: roleMap['penyuluh'] || 0,
        operator_poktan: roleMap['operator poktan'] || 0, // ✅ benerin disini
        operator_admin: roleMap['operator admin'] || 0,
        petani: roleMap['petani'] || 0
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  login,
  register,
  loginPetani,
  setPetaniPassword,
  registerPetani,
  getUserNotVerify,
  verifikasi,
  getProfile,
  getDetailProfile,
  updateDetailProfile,
  getPeran,
  ubahPeran,
  getMetaUserRole,
  opsiPenyuluh,
  opsiPoktan,
  changeKecamatanToId,
  changeDesaToId,
  registerPenyuluh
};
