const express = require('express');
const { Campaign, User, Transaction } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

/* GET /api/analytics/brand */
router.get('/brand', async (req, res) => {
  try {
    if (!['brand','admin'].includes(req.user.role))
      return res.status(403).json({ success:false, message:'Brand only' });
    const campaigns = await Campaign.find({ brand:req.user._id });
    const totalSpent = campaigns.reduce((s,c)=>s+c.budget,0);
    const active = campaigns.filter(c=>['in_progress','creators_assigned'].includes(c.workflowStatus)).length;
    const completed = campaigns.filter(c=>c.workflowStatus==='completed').length;
    const totalCreators = campaigns.reduce((s,c)=>s+(c.assignedCreators?.length||0),0);
    const nicheMap = {};
    campaigns.forEach(c=>{ nicheMap[c.niche]=(nicheMap[c.niche]||0)+1; });
    const nicheBreakdown = Object.entries(nicheMap).map(([niche,count])=>({ niche,count })).sort((a,b)=>b.count-a.count);
    const trend = [];
    for (let i=5;i>=0;i--) {
      const d=new Date(); d.setMonth(d.getMonth()-i);
      const m=d.toLocaleString('default',{month:'short'});
      const count=campaigns.filter(c=>{const cd=new Date(c.createdAt);return cd.getMonth()===d.getMonth()&&cd.getFullYear()===d.getFullYear();}).length;
      trend.push({ month:m, campaigns:count });
    }
    res.json({ success:true, stats:{ totalCampaigns:campaigns.length,active,completed,totalSpent,totalCreators },
      nicheBreakdown, trend });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

/* GET /api/analytics/creator */
router.get('/creator', async (req, res) => {
  try {
    if (req.user.role!=='creator') return res.status(403).json({ success:false, message:'Creators only' });
    const campaigns = await Campaign.find({ 'assignedCreators.creator':req.user._id });
    const myData = campaigns.map(c=>({
      title:c.title, niche:c.niche, budget:c.budget, workflowStatus:c.workflowStatus,
      assignment:c.assignedCreators.find(a=>a.creator?.toString()===req.user._id.toString()),
    }));
    const completed = myData.filter(c=>['approved','completed'].includes(c.assignment?.status));
    const earned = completed.reduce((s,c)=>s+(c.assignment?.paymentAlloc||0),0);
    const pending = myData.filter(c=>['assigned','accepted','in_progress','submitted'].includes(c.assignment?.status));
    const trend = [];
    for (let i=5;i>=0;i--) {
      const d=new Date(); d.setMonth(d.getMonth()-i);
      const m=d.toLocaleString('default',{month:'short'});
      const count=campaigns.filter(c=>{const cd=new Date(c.createdAt);return cd.getMonth()===d.getMonth()&&cd.getFullYear()===d.getFullYear();}).length;
      trend.push({ month:m, assignments:count });
    }
    res.json({ success:true, stats:{ total:campaigns.length, completed:completed.length,
      pending:pending.length, earned, successRate:campaigns.length?Math.round((completed.length/campaigns.length)*100):100 },
      campaigns:myData, trend });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
