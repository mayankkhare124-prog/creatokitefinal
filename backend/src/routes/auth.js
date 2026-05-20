const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { computeScore, getRank } = require('../services/scoring');

const router = express.Router();
const mkToken   = id => jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN    || '7d' });
const mkRefresh = id => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });

/* POST /api/auth/register */
router.post('/register', [
  body('displayName').trim().isLength({ min:2, max:60 }).withMessage('Name 2-60 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min:6 }).withMessage('Password min 6 chars'),
  body('role').optional().isIn(['creator','brand']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success:false, errors:errors.array() });

    const { displayName, email, password, role='creator', niche='', companyName='', handle='' } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ success:false, message:'Email already registered.' });
    if (handle && await User.findOne({ handle: handle.toLowerCase() }))
      return res.status(409).json({ success:false, message:'Handle taken.' });

    const user = new User({
      displayName, email, password, role,
      niche:       role==='creator' ? niche : '',
      companyName: role==='brand' ? (companyName||displayName) : '',
      handle:      handle ? handle.toLowerCase() : undefined,
    });

    if (role==='creator') {
      const { total, dna } = computeScore(user);
      user.creatorScore=total; user.dna=dna; user.rank=getRank(total);
    }

    const token=mkToken(user._id), refresh=mkRefresh(user._id);
    user.refreshToken=refresh;
    await user.save();
    res.status(201).json({ success:true, token, refreshToken:refresh, user:user.toPublicJSON() });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

/* POST /api/auth/login */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success:false, errors:errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success:false, message:'Invalid email or password.' });
    if (user.isBanned)
      return res.status(403).json({ success:false, message:`Account suspended: ${user.banReason}` });

    /* Streak tracking */
    const now=new Date(), last=user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    if (last) {
      const diff=Math.floor((now-last)/86400000);
      user.streak = diff===1 ? (user.streak||0)+1 : diff>1 ? 1 : user.streak;
    } else user.streak=1;
    user.lastLoginDate=now;

    const token=mkToken(user._id), refresh=mkRefresh(user._id);
    user.refreshToken=refresh;
    await user.save({ validateBeforeSave:false });
    res.json({ success:true, token, refreshToken:refresh, user:user.toPublicJSON() });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

/* POST /api/auth/refresh */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success:false, message:'No refresh token.' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ success:false, message:'Invalid refresh token.' });
    const token=mkToken(user._id), newR=mkRefresh(user._id);
    user.refreshToken=newR;
    await user.save({ validateBeforeSave:false });
    res.json({ success:true, token, refreshToken:newR, user:user.toPublicJSON() });
  } catch(e) { res.status(401).json({ success:false, message:'Refresh failed.' }); }
});

/* POST /api/auth/logout */
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken:'' });
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

/* GET /api/auth/me */
router.get('/me', auth, (req, res) => {
  res.json({ success:true, user:req.user.toPublicJSON() });
});

module.exports = router;
