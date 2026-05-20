import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api';
import { PageLoader, StatCard } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Target, Wallet, TrendingUp, Star } from 'lucide-react';

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--s2)', border:'1px solid var(--border2)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--t2)', marginBottom:4 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color:p.color, fontWeight:600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function CreatorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.creator().then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  const s = data?.stats || {};
  const trend = data?.trend || [];

  return (
    <div className="page-enter" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h2 style={{ fontFamily:'var(--fd)', fontWeight:800, fontSize:18, marginBottom:4 }}>My Analytics</h2>
        <p style={{ color:'var(--t2)', fontSize:13 }}>Your campaign performance and earnings overview.</p>
      </div>

      <div className="grid-4">
        <StatCard label="Total Campaigns" value={s.total||0}       icon={Target}     color="var(--p2)" />
        <StatCard label="Completed"        value={s.completed||0}  icon={Star}       color="var(--acc2)" />
        <StatCard label="Total Earned"     value={`₹${((s.earned||0)/1000).toFixed(1)}K`} icon={Wallet} color="var(--gold)" />
        <StatCard label="Success Rate"     value={`${s.successRate||100}%`} icon={TrendingUp} color="var(--acc)" />
      </div>

      {trend.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:18 }}>Campaign Assignments Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--t3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--t3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="assignments" stroke="var(--p2)" strokeWidth={2.5} dot={{ fill:'var(--p2)', strokeWidth:0, r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Campaign list */}
      {data?.campaigns?.length > 0 && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontSize:13, fontWeight:700 }}>Campaign History</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th><th>Niche</th><th>Status</th><th>Earned</th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{c.title}</td>
                    <td><span className="badge badge-purple">{c.niche}</span></td>
                    <td><span className="badge" style={{ background:'rgba(255,255,255,0.05)', color:'var(--t2)' }}>{c.assignment?.status||'—'}</span></td>
                    <td style={{ color:'var(--acc2)', fontWeight:600 }}>₹{(c.assignment?.paymentAlloc||0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
