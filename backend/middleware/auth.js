/**
 * Middleware de Autenticación JWT
 * Verifica y valida tokens JWT en requests
 */

const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/security');

/**
 * Middleware principal de autenticación
 * Verifica el token JWT en el header Authorization
 */
const authenticateToken = (req, res, next) => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'Acceso denegado. Token no proporcionado.'
      });
    }

    // 2. Verificar token
    jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }, (err, decoded) => {
      if (err) {
        // Token inválido o expirado
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            mensaje: 'Token expirado. Por favor, inicie sesión nuevamente.'
          });
        }

        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            success: false,
            mensaje: 'Token inválido.'
          });
        }

        return res.status(403).json({
          success: false,
          mensaje: 'Error de autenticación.'
        });
      }

      // 3. Token válido - adjuntar datos del usuario al request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        tipo: decoded.tipo // admin, psicologo, trabajador_social, beneficiario, usuario
      };

      next();
    });
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Si hay token lo verifica, pero permite continuar si no hay
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No hay token, pero permitir continuar
      req.user = null;
      return next();
    }

    // Hay token, verificarlo
    jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }, (err, decoded) => {
      if (err) {
        // Token inválido, pero permitir continuar
        req.user = null;
      } else {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          rol: decoded.rol,
          tipo: decoded.tipo
        };
      }
      next();
    });
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    req.user = null;
    next();
  }
};

/**
 * Genera un access token (corta duración)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
      tipo: payload.tipo
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.accessTokenExpiry,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

/**
 * Genera un refresh token (larga duración)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      type: 'refresh'
    },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.refreshTokenExpiry,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

/**
 * Verifica un refresh token
 */
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else if (decoded.type !== 'refresh') {
        reject(new Error('Token no es un refresh token'));
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * Extrae el token del header sin validarlo
 */
const extractToken = (req) => {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1];
};

/**
 * Decodifica un token sin verificar la firma (usar con precaución)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractToken,
  decodeToken
};
