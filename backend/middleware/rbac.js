/**
 * Middleware de Autorización - Role-Based Access Control (RBAC)
 * Controla el acceso a recursos según el rol del usuario
 */

const { roles, permissions } = require('../config/security');

/**
 * Verifica si un usuario tiene un rol específico
 * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          mensaje: 'Acceso denegado. Debe iniciar sesión.'
        });
      }

      // Convertir a array si es un solo rol
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Verificar si el usuario tiene uno de los roles permitidos
      const hasRole = rolesArray.some(role =>
        req.user.rol === role || req.user.tipo === role
      );

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          mensaje: 'No tiene permisos para acceder a este recurso.',
          rolRequerido: rolesArray,
          rolActual: req.user.rol || req.user.tipo
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor.'
      });
    }
  };
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {string} requiredPermission - Permiso requerido (ej: 'paciente:write')
 */
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          mensaje: 'Acceso denegado. Debe iniciar sesión.'
        });
      }

      const userRole = req.user.rol || req.user.tipo;
      const userPermissions = permissions[userRole] || [];

      // Admin tiene todos los permisos
      if (userPermissions.includes('*')) {
        return next();
      }

      // Verificar permiso específico
      if (userPermissions.includes(requiredPermission)) {
        return next();
      }

      // Verificar permiso con wildcard (ej: 'paciente:*' permite 'paciente:read', 'paciente:write')
      const [resource, action] = requiredPermission.split(':');
      const wildcardPermission = `${resource}:*`;
      if (userPermissions.includes(wildcardPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        mensaje: `No tiene permisos para realizar esta acción: ${requiredPermission}`,
        permisoRequerido: requiredPermission,
        rolActual: userRole
      });
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor.'
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario solo acceda a sus propios recursos
 * @param {string} paramName - Nombre del parámetro en req.params (ej: 'id', 'userId')
 */
const requireOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          mensaje: 'Acceso denegado. Debe iniciar sesión.'
        });
      }

      const userRole = req.user.rol || req.user.tipo;

      // Admin puede acceder a todo
      if (userRole === roles.ADMIN) {
        return next();
      }

      // Obtener el ID del recurso
      const resourceId = req.params[paramName] || req.body[paramName];

      // Verificar que el usuario sea dueño del recurso
      if (parseInt(resourceId) !== parseInt(req.user.id)) {
        return res.status(403).json({
          success: false,
          mensaje: 'No tiene permisos para acceder a este recurso.'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de ownership:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor.'
      });
    }
  };
};

/**
 * Middleware combinado: requiere rol Y ownership
 * Útil para endpoints donde un usuario puede modificar sus propios datos
 * pero ciertos roles pueden modificar datos de otros
 */
const requireRoleOrOwnership = (allowedRoles, paramName = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          mensaje: 'Acceso denegado. Debe iniciar sesión.'
        });
      }

      const userRole = req.user.rol || req.user.tipo;
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Verificar si tiene el rol permitido
      const hasRole = rolesArray.some(role => userRole === role);
      if (hasRole) {
        return next();
      }

      // Si no tiene el rol, verificar ownership
      const resourceId = req.params[paramName] || req.body[paramName];
      if (parseInt(resourceId) === parseInt(req.user.id)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        mensaje: 'No tiene permisos para acceder a este recurso.'
      });
    } catch (error) {
      console.error('Error en middleware de rol/ownership:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor.'
      });
    }
  };
};

/**
 * Middleware para solo administradores
 */
const requireAdmin = requireRole(roles.ADMIN);

/**
 * Middleware para profesionales (psicólogo o trabajador social)
 */
const requireProfessional = requireRole([roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL, roles.ADMIN]);

/**
 * Verifica permisos basados en el estado del beneficiario
 * Los profesionales solo pueden acceder a beneficiarios asignados a ellos
 */
const requireAssignment = (idParamName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          mensaje: 'Acceso denegado. Debe iniciar sesión.'
        });
      }

      const userRole = req.user.rol || req.user.tipo;

      // Admin puede acceder a todo
      if (userRole === roles.ADMIN) {
        return next();
      }

      // Para psicólogos y trabajadores sociales, verificar asignación
      if (userRole === roles.PSICOLOGO || userRole === roles.TRABAJADOR_SOCIAL) {
        // Esta verificación requeriría consultar la base de datos
        // Por ahora, permitimos el acceso y dejamos que el controlador valide
        // TODO: Implementar verificación de asignación en base de datos
        return next();
      }

      // Beneficiarios solo pueden acceder a sus propios datos
      if (userRole === roles.BENEFICIARIO) {
        const resourceId = req.params[idParamName];
        if (parseInt(resourceId) === parseInt(req.user.id)) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        mensaje: 'No tiene permisos para acceder a este recurso.'
      });
    } catch (error) {
      console.error('Error en middleware de asignación:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor.'
      });
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireOwnership,
  requireRoleOrOwnership,
  requireAdmin,
  requireProfessional,
  requireAssignment,
  roles // Exportar roles para uso en rutas
};
