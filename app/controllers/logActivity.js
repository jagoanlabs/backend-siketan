const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError');
const {
  logactivity,
  eventTani: EventTani,
  beritaTani,
  dataPetani,
  tbl_akun,
  dataPenyuluh,
  dataOperator
} = require('../models');

// Updated activities array - pastikan semua model ada
const activities = [
  {
    txt: 'INFO TANI',
    value: beritaTani,
    isAccount: false
  },
  {
    txt: 'EVENT TANI',
    value: EventTani,
    isAccount: false
  },
  {
    txt: 'DATA PETANI',
    value: dataPetani,
    isAccount: true
  },
  {
    txt: 'DATA PENYULUH',
    value: dataPenyuluh,
    isAccount: true
  },
  {
    txt: 'DATA OPERATOR',
    value: dataOperator,
    isAccount: true
  }
  // Tambahkan activity lain sesuai kebutuhan
  // {
  //   txt: 'DATA TANAMAN',
  //   value: dataTanaman,
  //   isAccount: false
  // },
  // {
  //   txt: 'KELOMPOK',
  //   value: kelompok,
  //   isAccount: false
  // }
];

const errorMessage = (res, type, userInAction) => {
  switch (type) {
    case 'deleted':
      if (userInAction) {
        return res.status(400).json({
          message: `Activity has already been deleted permanently`,
          text: `Activity has already been deleted permanently by ${userInAction.nama} as ${userInAction.peran}`,
          success: false
        });
      } else {
        return res.status(400).json({
          message: `Activity has already been deleted permanently`,
          text: `Activity has already been deleted permanently by unknown (deleted) user`,
          success: false
        });
      }
    case 'notFound':
      return res.status(404).json({
        message: 'Data tidak ditemukan atau sudah dihapus permanen',
        type: 'question',
        text: 'Data mungkin sudah tidak ada dalam sistem',
        success: false
      });
    default:
      return res.status(404).json({
        message: 'Data tidak ditemukan',
        type: 'question',
        text: 'Terjadi kesalahan dalam mencari data',
        success: false
      });
  }
};

const traceActivity = async (activity, res) => {
  try {
    const delPermAct = await logactivity.findOne({
      where: {
        detail: activity.detail,
        activity: 'DELETE PERMANENT'
      },
      order: [['createdAt', 'DESC']]
    });

    if (delPermAct) {
      const prevCreateAct = await logactivity.findOne({
        where: {
          detail: activity.detail,
          activity: 'CREATE'
        },
        order: [['createdAt', 'DESC']]
      });

      // Fixed: Add null check untuk prevCreateAct
      if (prevCreateAct && prevCreateAct.id < delPermAct.id) {
        const userInAction = await tbl_akun.findByPk(delPermAct.user_id); // Use delPermAct.user_id instead
        return errorMessage(res, 'deleted', userInAction);
      } else {
        return errorMessage(res, 'notFound');
      }
    } else {
      return errorMessage(res, 'notFound');
    }
  } catch (error) {
    console.error('Trace Activity Error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat melacak aktivitas',
      success: false
    });
  }
};

const getActivity = async (req, res) => {
  const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortType = 'DESC' } = req.query;
  const { peran } = req.user || {};

  try {
    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    // Build where condition for search
    const includeCondition = {
      model: tbl_akun,
      required: true,
      where: search
        ? {
            nama: {
              [Op.iLike]: `%${search}%` // PostgreSQL case-insensitive search
              // For MySQL use: [Op.like]: `%${search}%`
            }
          }
        : {}
    };

    // Exclude DELETE activities (those are in trash)
    const whereCondition = {
      activity: {
        [Op.not]: 'DELETE'
      }
    };

    // Build query
    const query = {
      include: [includeCondition],
      where: whereCondition,
      order: [[sortBy === 'nama' ? [tbl_akun, 'nama'] : sortBy, sortType]],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    };

    const countQuery = {
      include: [includeCondition],
      where: whereCondition
    };

    const [activity, total] = await Promise.all([
      logactivity.findAll(query),
      logactivity.count(countQuery)
    ]);

    res.status(200).json({
      message: 'Berhasil Mendapatkan Activity',
      data: activity,
      total,
      currentPages: Number(page),
      limit: Number(limit),
      maxPages: Math.ceil(total / Number(limit)),
      from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
      to: Number(page) ? (Number(page) - 1) * Number(limit) + activity.length : activity.length
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const getTrashActivity = async (req, res) => {
  try {
    const { peran } = req.user || {};

    if (peran === 'petani') {
      throw new ApiError(403, 'Anda tidak memiliki akses.');
    }

    const { page = 1, limit = 10, search = '' } = req.query;

    // Build where condition for search
    const includeCondition = {
      model: tbl_akun,
      required: true,
      where: search
        ? {
            nama: {
              [Op.iLike]: `%${search}%` // PostgreSQL case-insensitive search
              // For MySQL use: [Op.like]: `%${search}%`
            }
          }
        : {}
    };

    // Only get DELETE activities (not DELETE PERMANENT)
    const whereCondition = {
      activity: 'DELETE'
    };

    const query = {
      include: [includeCondition],
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    };

    const countQuery = {
      include: [includeCondition],
      where: whereCondition
    };

    const [activity, total] = await Promise.all([
      logactivity.findAll(query),
      logactivity.count(countQuery)
    ]);

    res.status(200).json({
      message: 'Berhasil Mendapatkan Data Sampah',
      data: activity,
      total,
      currentPages: Number(page),
      limit: Number(limit),
      maxPages: Math.ceil(total / Number(limit)),
      from: Number(page) ? (Number(page) - 1) * Number(limit) + 1 : 1,
      to: Number(page) ? (Number(page) - 1) * Number(limit) + activity.length : activity.length
    });
  } catch (error) {
    console.error('Get Trash Activity Error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

// Fixed postActivity - bisa dipanggil dari controller lain
const postActivity = async (params) => {
  try {
    const { user_id, activity, type, detail_id } = params;
    const detail = detail_id ? `${type} ${detail_id}` : type;

    const newActivity = await logactivity.create({
      user_id,
      activity,
      detail
    });

    console.log('Activity logged:', { user_id, activity, detail });
    return newActivity;
  } catch (error) {
    console.error('Post Activity Error:', error);
    throw error;
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Delete Permanent - Activity ID:', id);

    // Find activity log
    const activity = await logactivity.findByPk(id);
    if (!activity) {
      return res.status(404).json({
        message: 'Activity Log Not Found',
        success: false
      });
    }

    console.log('Found activity:', activity.detail);

    // Parse detail to get the actual data ID and type
    const detailActivityArr = activity.detail.split(' ');
    const detailActivity = detailActivityArr.slice(0, -1).join(' ');
    const targetId = detailActivityArr[detailActivityArr.length - 1];

    console.log('Detail Activity:', detailActivity);
    console.log('Target ID:', targetId);
    console.log(
      'Available activities:',
      activities.map((a) => a.txt)
    );

    // Find matching activity type
    const matchingActivity = activities.find((act) => act.txt === detailActivity);

    if (!matchingActivity) {
      console.log('No matching activity found for:', detailActivity);
      return res.status(404).json({
        message: 'Tipe aktivitas tidak ditemukan',
        success: false
      });
    }

    console.log('Found matching activity:', matchingActivity.txt);

    // Find the data to be permanently deleted
    const data = await matchingActivity.value.findOne({
      where: { id: targetId },
      paranoid: false // Include soft-deleted records
    });

    if (!data) {
      console.log('Data not found for ID:', targetId);
      return traceActivity(activity, res);
    }

    console.log('Found data to delete:', data.id);

    // Permanently delete the data
    await data.destroy({ force: true });
    console.log('Data permanently deleted');

    // Log the permanent deletion activity
    await postActivity({
      user_id: req.user.id,
      activity: 'DELETE PERMANENT',
      type: detailActivity,
      detail_id: targetId
    });
    console.log('Delete permanent activity logged');

    // Remove the original delete activity log
    await activity.destroy({ force: true });
    console.log('Original activity log removed');

    return res.status(200).json({
      message: 'Berhasil Menghapus Permanen',
      success: true
    });
  } catch (error) {
    console.error('Delete Activity Error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Terjadi kesalahan saat menghapus data',
      success: false
    });
  }
};

const restoreActivity = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Restore - Activity ID:', id);

    // Find activity log
    const activity = await logactivity.findByPk(id);
    if (!activity) {
      return res.status(404).json({
        message: 'Activity Log Not Found',
        success: false
      });
    }

    console.log('Found activity:', activity.detail);

    // Parse detail to get the actual data ID and type
    const detailActivityArr = activity.detail.split(' ');
    const detailActivity = detailActivityArr.slice(0, -1).join(' ');
    const targetId = detailActivityArr[detailActivityArr.length - 1];

    console.log('Detail Activity:', detailActivity);
    console.log('Target ID:', targetId);

    // Find matching activity type
    const matchingActivity = activities.find((act) => act.txt === detailActivity);

    if (!matchingActivity) {
      console.log('No matching activity found for:', detailActivity);
      return res.status(404).json({
        message: 'Tipe aktivitas tidak ditemukan',
        success: false
      });
    }

    console.log('Found matching activity:', matchingActivity.txt);

    // Find the soft-deleted data
    const data = await matchingActivity.value.findOne({
      where: { id: targetId },
      paranoid: false // Include soft-deleted records
    });

    if (!data) {
      console.log('Data not found for ID:', targetId);
      return traceActivity(activity, res);
    }

    // Check if data is actually soft-deleted
    if (!data.deletedAt) {
      console.log('Data is not deleted, cannot restore');
      return res.status(400).json({
        message: 'Data tidak dalam keadaan terhapus, tidak dapat direstore',
        success: false
      });
    }

    console.log('Found data to restore:', data.id, 'deletedAt:', data.deletedAt);

    // Restore the data
    await data.restore();
    console.log('Data restored');

    // Log the restore activity
    await postActivity({
      user_id: req.user.id,
      activity: 'RESTORE',
      type: detailActivity,
      detail_id: targetId
    });
    console.log('Restore activity logged');

    // Remove the original delete activity log
    await activity.destroy({ force: true });
    console.log('Original activity log removed');

    return res.status(200).json({
      message: 'Berhasil Mengembalikan Data',
      success: true
    });
  } catch (error) {
    console.error('Restore Activity Error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Terjadi kesalahan saat mengembalikan data',
      success: false
    });
  }
};

module.exports = {
  getActivity,
  getTrashActivity,
  postActivity,
  deleteActivity,
  restoreActivity
};
