import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../api';
import { Avatar } from '../ui';

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [notifs,  setNotifs]  = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [showN,   setShowN]   = useState(false);

  useEffect(() => {
    usersAPI.notifications().then(d => { setNotifs(d.notifications||[]); setUnread(d.unread||0); }).catch(()=>{});
  }, []);

  const openNotifs = async () => {
    setShowN(v=>!v);
    if (unread>0) { await usersAPI.readNotifs().catch(()=>{}); setUnread(0); }
  };

  const PAGE_TITLE = {
    '/creator/dashboard':'Dashboard', '/creator/assigned':'My Campaigns',
    '/creator/analytics':'Analytics', '/creator/earnings':'Earnings',
    '/creator/leaderboard':'Leaderboard', '/creator/profile':'Profile',
    '/brand/dashboard':'Dashboard', '/brand/campaigns/create':'New Campaign',
    '/brand/campaigns':'My Campaigns', '/brand/analytics':'Analytics',
    '/admin/dashboard':'Dashboard', '/admin/campaigns':'Campaigns',
    '/admin/users':'Users', '/admin/analytics':'Analytics',
  };
  const title = PAGE_TITLE[location.pathname] || 'Creatokite';

  return (
    <header className="top-header">
      <button className="btn btn-ghost btn-icon header-menu-toggle" onClick={onMenuToggle}>
        <Menu size={18} />
      </button>

      <span style={{ fontFamily:'var(--fd)', fontWeight:700, fontSize:15, flex:1 }}>{title}</span>

      {user?.role==='creator' && (
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px',
          background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:100, fontSize:12 }}>
          <span style={{ color:'var(--p2)', fontWeight:700, fontFamily:'var(--fd)' }}>⚡{user.creatorScore||0}</span>
          <span style={{ color:'var(--t3)' }}>·</span>
          <span style={{ color:'var(--gold)' }}>{user.rank||'Bronze'}</span>
        </div>
      )}

      {/* Notifications */}
      <div style={{ position:'relative' }}>
        <button onClick={openNotifs} className="btn btn-ghost btn-icon" style={{ position:'relative' }}>
          <Bell size={17} />
          {unread>0 && (
            <span style={{ position:'absolute', top:4, right:4, width:8, height:8,
              borderRadius:'50%', background:'var(--rose)', animation:'pulse 2s infinite' }} />
          )}
        </button>

        {showN && (
          <>
            <div onClick={()=>setShowN(false)} style={{ position:'fixed', inset:0, zIndex:100 }} />
            <div style={{
              position:'absolute', right:0, top:44, width:320, maxHeight:400, overflow:'auto',
              background:'var(--s2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)',
              boxShadow:'var(--shadow-md)', zIndex:200, animation:'fadeUp 0.15s ease',
            }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:13, fontWeight:600 }}>
                Notifications {unread>0&&<span style={{ color:'var(--rose)', marginLeft:4 }}>({unread})</span>}
              </div>
              {notifs.length===0 ? (
                <div style={{ padding:24, textAlign:'center', color:'var(--t2)', fontSize:13 }}>All caught up! 🎉</div>
              ) : notifs.slice(0,10).map(n=>(
                <div key={n._id} onClick={()=>{ setShowN(false); if(n.link) navigate(n.link); }}
                  style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer',
                    background:n.read?'':'rgba(108,99,255,0.05)', transition:'background 0.15s' }}>
                  <div style={{ fontSize:13, fontWeight:n.read?400:600, color:'var(--t1)', marginBottom:3 }}>{n.title}</div>
                  <div style={{ fontSize:12, color:'var(--t2)' }}>{n.body}</div>
                  <div style={{ fontSize:10, color:'var(--t3)', marginTop:4 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Avatar src={user?.avatar} name={user?.displayName} size={30} />
    </header>
  );
}
