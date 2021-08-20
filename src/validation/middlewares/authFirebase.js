const admin = require('../../config/authFirebase');
const saveError = require('../../utils/ErrorHistory');
const isEntity = require('../../utils/IsEntity');
const { ForbiddenError, UnauthorizedError } = require('../../utils/errorHandler');

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization
        && req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.split(' ')[1];

    try {
      const idToken = await admin.auth().verifyIdToken(token);

      req.decodedToken = idToken;

      global.isUserEntity = isEntity(req.decodedToken.name);

      return next();
    } catch (err) {
      throw new UnauthorizedError('Usuário não está autorizado');
    }
  }
  const err = new ForbiddenError('Usuário não está autenticado');
  saveError(err);
  return res.status(403).json({ error: err.message });
};


module.exports = isAuthenticated;
