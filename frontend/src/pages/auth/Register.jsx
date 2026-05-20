import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Btn, Input } from '../../components/ui';
import toast from 'react-hot-toast';

const NICHES = ['Tech','Beauty','Fashion','Fitness','Food','Travel','Gaming','Education','Finance','Lifestyle','Music','Art','Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName:'', email:'', password:'', role: params.get('role')||'creator',
    niche:'', companyName:'', handle:'',
  });
  const upd = k => e => setForm(p => ({ ...p, [k]:e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.displayName||!form.email||!form.password) return toast.error('Fill all required fields');
    if (form.password.length<6) return toast.error('Password min 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to Creatokite, ${user.displayName}! 🚀`);
      navigate(`/${user.role}/dashboard`, { replace:true });
    } catch(err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ width:'100%',maxWidth:440 }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,var(--p),var(--acc))',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 14px' }}>⚡</div>
          <h1 style={{ fontFamily:'var(--fd)',fontSize:22,fontWeight:800 }}>Create your account</h1>
          <p style={{ color:'var(--t2)',fontSize:13,marginTop:4 }}>Join India's AI-Powered Creator Campaign OS</p>
        </div>

        <div style={{ background:'var(--s1)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:28 }}>
          {/* Role selector */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20 }}>
            {[['creator','✨ Creator','Earn from brand campaigns'],['brand','🏢 Brand','Run AI-powered campaigns']].map(([r,label,sub])=>(
              <div key={r} onClick={()=>setForm(p=>({...p,role:r}))}
                style={{ padding:'12px',borderRadius:'var(--r)',cursor:'pointer',transition:'all 0.15s',
                  background:form.role===r?'rgba(108,99,255,0.12)':'rgba(255,255,255,0.03)',
                  border:form.role===r?'1px solid rgba(108,99,255,0.4)':'1px solid var(--border)' }}>
                <div style={{ fontSize:13,fontWeight:600,color:form.role===r?'var(--p2)':'var(--t1)',marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:11,color:'var(--t3)' }}>{sub}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:13 }}>
            <Input label="Full Name *" value={form.displayName} onChange={upd('displayName')} placeholder="Priya Sharma" required />
            <Input label="Email *" type="email" value={form.email} onChange={upd('email')} placeholder="you@example.com" required />
            <Input label="Password *" type="password" value={form.password} onChange={upd('password')} placeholder="Min 6 characters" required />

            {form.role==='creator' && (
              <>
                <Input label="Username / Handle" value={form.handle} onChange={upd('handle')} placeholder="priyatech" hint="Optional — your public @handle" />
                <div className="form-group">
                  <label className="form-label">Creator Niche</label>
                  <select className="form-input" value={form.niche} onChange={upd('niche')}>
                    <option value="">Select your niche</option>
                    {NICHES.map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </>
            )}
            {form.role==='brand' && (
              <Input label="Company Name" value={form.companyName} onChange={upd('companyName')} placeholder="Your Company Pvt Ltd" />
            )}

            <Btn variant="primary" className="w-full btn-lg" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? 'Creating account…' : `Join as ${form.role==='creator'?'Creator':'Brand'} →`}
            </Btn>
          </form>

          <p style={{ textAlign:'center',fontSize:13,color:'var(--t2)',marginTop:16 }}>
            Already have an account? <Link to="/login" style={{ color:'var(--p2)',fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
