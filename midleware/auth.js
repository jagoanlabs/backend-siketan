const jwt = require('jsonwebtoken');
const { tbl_akun: tblAkun, dataPerson } = require('../app/models');
const dotenv = require('dotenv');
dotenv.config();

const auth = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    // Check if authorization header exists
    if (!bearerToken) {
      return res.status(401).json({
        status: 'failed',
        message: 'Required authorization'
      });
    }

    // Check if token starts with 'Bearer '
    if (!bearerToken.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid token format. Use Bearer token'
      });
    }

    // Extract token (fix: add space after 'Bearer')
    const token = bearerToken.split('Bearer ')[1];

    if (!token || token.trim() === '') {
      return res.status(401).json({
        status: 'failed',
        message: 'Token not provided'
      });
    }

    console.log('token', token);

    // Verify JWT token
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log('payload', payload);

    // Find user based on payload
    let userInstance;

    if (payload.NIK) {
      // Find in dataPerson table
      userInstance = await dataPerson.findByPk(payload.id);
      if (!userInstance) {
        return res.status(401).json({
          status: 'failed',
          message: 'User not found in dataPerson'
        });
      }
    } else {
      // Find in tbl_akun table
      userInstance = await tblAkun.findByPk(payload.id);
      if (!userInstance) {
        return res.status(401).json({
          status: 'failed',
          message: 'User not found in tbl_akun'
        });
      }
    }

    // Attach user to request object
    req.user = userInstance;
    req.payload = payload; // Optional: attach payload juga jika diperlukan

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid token'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Token not active'
      });
    }

    // Generic error
    return res.status(401).json({
      status: 'failed',
      message: 'Authentication failed'
    });
  }
};

module.exports = auth;
