const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token.' });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch (e) { return res.status(401).json({ success: false, message: 'Token invalid or expired.', code: 'TOKEN_EXPIRED' }); }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account suspended.' });
    req.user = user;
    next();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only.' });
  next();
}

module.exports = { auth, adminOnly };
