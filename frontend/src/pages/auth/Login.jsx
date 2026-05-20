import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Btn, Input } from '../../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || null;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email:'', password:'' });
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email||!form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.displayName}!`);
      navigate(from || `/${user.role}/dashboard`, { replace:true });
    } catch(err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const loginDemo = async (email) => {
    setForm({ email, password:'Demo@12345' });
    setLoading(true);
    try {
      const user = await login(email, 'Demo@12345');
      navigate(`/${user.role}/dashboard`, { replace:true });
    } catch(e) { toast.error('Demo login failed — run seed first'); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,var(--p),var(--acc))',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 14px' }}>⚡</div>
          <h1 style={{ fontFamily:'var(--fd)',fontSize:24,fontWeight:800 }}>Welcome back</h1>
          <p style={{ color:'var(--t2)',fontSize:13,marginTop:4 }}>Sign in to your Creatokite account</p>
        </div>

        <div style={{ background:'var(--s1)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:28 }}>
          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <Input label="Email" type="email" value={form.email} onChange={upd('email')} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={upd('password')} placeholder="••••••••" required />
            <Btn variant="primary" className="w-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </Btn>
          </form>

          <div style={{ margin:'20px 0', borderTop:'1px solid var(--border)', paddingTop:16 }}>
            <p style={{ fontSize:12,color:'var(--t2)',textAlign:'center',marginBottom:10 }}>Quick demo access</p>
            <div style={{ display:'flex',gap:8 }}>
              {[['👑 Admin','admin@creatokite.com'],['🏢 Brand','brand@demo.com'],['✨ Creator','creator1@demo.com']].map(([l,e])=>(
                <button key={e} onClick={()=>loginDemo(e)} disabled={loading}
                  style={{ flex:1,padding:'7px 4px',fontSize:11,borderRadius:'var(--r)',cursor:'pointer',
                    background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',color:'var(--t2)',
                    transition:'all 0.15s',fontFamily:'var(--fb)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign:'center',fontSize:13,color:'var(--t2)' }}>
            No account? <Link to="/register" style={{ color:'var(--p2)',fontWeight:600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
