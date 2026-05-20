const { User } = require('../models');

function computeScore(user) {
  const p = user.platforms || {};
  const totalFollowers = (p.instagram?.followers||0)+(p.youtube?.followers||0)+(p.twitter?.followers||0)+(p.tiktok?.followers||0);
  const avgEngagement  = [(p.instagram?.engagement||0),(p.youtube?.engagement||0),(p.twitter?.engagement||0),(p.tiktok?.engagement||0)].reduce((a,b)=>a+b,0)/4;

  const reach       = Math.min(1,totalFollowers/500000)*250;
  const engagement  = Math.min(1,avgEngagement/10)*250;
  const reliability = ((user.successRate||100)/100)*200;
  const activity    = Math.min(1,(user.completedCampaigns||0)/30)*150;
  const growth      = Math.min(1,(user.seasonXP||0)/5000)*50;
  const auth        = Math.min(1,(user.profileComplete||0)/100)*100;

  const total = Math.min(1000,Math.round(reach+engagement+reliability+activity+growth+auth));
  const dna = {
    reach:       Math.round(Math.min(100,totalFollowers/5000)),
    engagement:  Math.round(Math.min(100,avgEngagement*10)),
    reliability: Math.round(user.successRate||100),
    quality:     Math.round(user.profileComplete||0),
    growth:      Math.round(Math.min(100,(user.seasonXP||0)/50)),
    authenticity:Math.round(80-(user.trustScore?.fakePct||0)),
  };
  return { total, dna };
}

function getRank(score) {
  if (score>=900) return 'Legend';
  if (score>=750) return 'Diamond';
  if (score>=600) return 'Platinum';
  if (score>=400) return 'Gold';
  if (score>=200) return 'Silver';
  return 'Bronze';
}

async function awardXP(userId, amount) {
  try {
    const user = await User.findById(userId);
    if (!user||user.role!=='creator') return null;
    user.xp = (user.xp||0)+amount;
    user.seasonXP = (user.seasonXP||0)+amount;
    user.level = Math.floor(user.xp/500)+1;
    const { total, dna } = computeScore(user);
    user.creatorScore=total; user.dna=dna; user.rank=getRank(total);
    await user.save({ validateBeforeSave:false });
    return { score:total, rank:user.rank };
  } catch(e){ console.error('awardXP error:',e.message); return null; }
}

async function recalculateAllScores() {
  const creators = await User.find({ role:'creator' });
  for (const u of creators) {
    try {
      const { total, dna } = computeScore(u);
      u.creatorScore=total; u.dna=dna; u.rank=getRank(total);
      await u.save({ validateBeforeSave:false });
    } catch(e){}
  }
  console.log(`✅ Recalculated scores for ${creators.length} creators`);
}

module.exports = { computeScore, getRank, awardXP, recalculateAllScores };
