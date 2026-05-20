import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../api';
import { Btn, Input, Textarea } from '../../components/ui';
import toast from 'react-hot-toast';

const NICHES = ['Tech','Beauty','Fashion','Fitness','Food','Travel','Gaming','Education','Finance','Lifestyle','Music','Art','Other'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName||'',
    bio:         user?.bio||'',
    location:    user?.location||'',
    website:     user?.website||'',
    niche:       user?.niche||'',
    avatar:      user?.avatar||'',
    platforms: {
      instagram: { followers: user?.platforms?.instagram?.followers||0, engagement: user?.platforms?.instagram?.engagement||0 },
      youtube:   { followers: user?.platforms?.youtube?.followers||0,   engagement: user?.platforms?.youtube?.engagement||0   },
      twitter:   { followers: user?.platforms?.twitter?.followers||0,   engagement: user?.platforms?.twitter?.engagement||0   },
      tiktok:    { followers: user?.platforms?.tiktok?.followers||0,    engagement: user?.platforms?.tiktok?.engagement||0    },
    },
  });

  const upd  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const updP = (platform, field) => e =>
    setForm(p => ({ ...p, platforms: { ...p.platforms, [platform]: { ...p.platforms[platform], [field]: +e.target.value } } }));

  const save = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile(form);
      await refreshUser();
      toast.success('Profile updated! Your Creator Score has been recalculated.');
    } catch(e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const complete = user?.profileComplete || 0;

  return (
    <div className="page-enter" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="flex-between" style={{ flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:18, marginBottom:4 }}>My Profile</h2>
          <p style={{ color:'var(--t2)', fontSize:13 }}>Complete your profile to boost Creator Score and get more campaign assignments.</p>
        </div>
        <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
      </div>

      {/* Completion bar */}
      <div style={{ padding:'12px 16px', background:'rgba(108,99,255,0.06)', border:'1px solid rgba(108,99,255,0.15)', borderRadius:10 }}>
        <div className="flex-between" style={{ marginBottom:8, fontSize:12 }}>
          <span style={{ color:'var(--p2)', fontWeight:600 }}>Profile Completeness</span>
          <span style={{ fontWeight:700 }}>{complete}%</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width:`${complete}%`, background:'linear-gradient(90deg,var(--p),var(--acc))' }}/>
        </div>
        {complete < 80 && <div style={{ fontSize:11, color:'var(--t3)', marginTop:6 }}>Complete your profile to increase Creator Score and get assigned to more campaigns.</div>}
      </div>

      <div className="grid-2" style={{ gap:16, alignItems:'start' }}>
        {/* Left: basic info */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <h3 style={{ fontSize:13, fontWeight:700 }}>Basic Info</h3>
          <Input label="Display Name" value={form.displayName} onChange={upd('displayName')} />
          <Input label="Avatar URL" value={form.avatar} onChange={upd('avatar')} placeholder="https://example.com/photo.jpg" hint="Paste a direct image URL" />
          <Textarea label="Bio" value={form.bio} onChange={upd('bio')} placeholder="Tell brands about yourself, your audience and content style…" style={{ minHeight:90 }} />
          <Input label="Location" value={form.location} onChange={upd('location')} placeholder="Mumbai, India" />
          <Input label="Website / Portfolio" value={form.website} onChange={upd('website')} placeholder="https://yoursite.com" />
          <div className="form-group">
            <label className="form-label">Primary Niche</label>
            <select className="form-input" value={form.niche} onChange={upd('niche')}>
              <option value="">Select niche…</option>
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Right: platform stats */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <h3 style={{ fontSize:13, fontWeight:700 }}>Platform Stats</h3>
          <p style={{ fontSize:11, color:'var(--t2)', marginTop:-8 }}>These are used to calculate your Creator Score and AI match scores.</p>
          {['instagram','youtube','twitter','tiktok'].map(p => (
            <div key={p} style={{ padding:'13px', background:'var(--s2)', borderRadius:'var(--r)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:600, textTransform:'capitalize', marginBottom:10, color:'var(--t1)' }}>
                {p === 'instagram' ? '📸' : p === 'youtube' ? '▶️' : p === 'twitter' ? '🐦' : '🎵'} {p}
              </div>
              <div className="grid-2" style={{ gap:8 }}>
                <Input label="Followers" type="number" value={form.platforms[p].followers} onChange={updP(p,'followers')} placeholder="0" />
                <Input label="Avg Engagement %" type="number" step="0.1" value={form.platforms[p].engagement} onChange={updP(p,'engagement')} placeholder="0.0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
