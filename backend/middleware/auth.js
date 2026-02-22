const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};