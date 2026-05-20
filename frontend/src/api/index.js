import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ── Token injection ─────────────────────────────── */
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ck_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ── Auto-refresh on 401 ─────────────────────────── */
let isRefreshing = false, failQueue = [];
const flush = (err, token=null) => { failQueue.forEach(p=>err?p.reject(err):p.resolve(token)); failQueue=[]; };

api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status===401 && err.response?.data?.code==='TOKEN_EXPIRED' && !orig._retry) {
      if (isRefreshing) return new Promise((res,rej)=>{ failQueue.push({resolve:res,reject:rej}); }).then(t=>{ orig.headers.Authorization=`Bearer ${t}`; return api(orig); });
      orig._retry=true; isRefreshing=true;
      try {
        const rt = localStorage.getItem('ck_refresh');
        if (!rt) throw new Error('No refresh token');
        const { data } = await axios.post('/api/auth/refresh',{ refreshToken:rt });
        const { token, refreshToken } = data;
        localStorage.setItem('ck_token',token); localStorage.setItem('ck_refresh',refreshToken);
        api.defaults.headers.common.Authorization=`Bearer ${token}`;
        flush(null,token); isRefreshing=false;
        orig.headers.Authorization=`Bearer ${token}`;
        return api(orig);
      } catch(e) {
        flush(e); isRefreshing=false;
        localStorage.removeItem('ck_token'); localStorage.removeItem('ck_refresh');
        window.location.href='/login'; return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  }
);

const unwrap = r => r.data;

/* ── Auth ─────────────────────────────────────────── */
export const authAPI = {
  register: d => api.post('/auth/register',d).then(unwrap),
  login:    d => api.post('/auth/login',d).then(unwrap),
  logout:   () => api.post('/auth/logout').then(unwrap),
  refresh:  d => api.post('/auth/refresh',d).then(unwrap),
  me:       () => api.get('/auth/me').then(unwrap),
};

/* ── Campaigns ────────────────────────────────────── */
export const campaignsAPI = {
  list:           p  => api.get('/campaigns',{params:p}).then(unwrap),
  get:            id => api.get(`/campaigns/${id}`).then(unwrap),
  create:         d  => api.post('/campaigns',d).then(unwrap),
  update:         (id,d) => api.put(`/campaigns/${id}`,d).then(unwrap),
  brandCampaigns: () => api.get('/campaigns/brand').then(unwrap),
  myAssigned:     () => api.get('/campaigns/my/assigned').then(unwrap),
  respond:        (id,response) => api.put(`/campaigns/my/assigned/${id}/respond`,{response}).then(unwrap),
  submitWork:     (id,d) => api.put(`/campaigns/my/assigned/${id}/submit`,d).then(unwrap),
};

/* ── Admin ────────────────────────────────────────── */
export const adminAPI = {
  dashboard:    () => api.get('/admin/dashboard').then(unwrap),
  analytics:    () => api.get('/admin/analytics').then(unwrap),
  users:        p  => api.get('/admin/users',{params:p}).then(unwrap),
  getUser:      id => api.get(`/admin/users/${id}`).then(unwrap),
  updateUser:   (id,d) => api.put(`/admin/users/${id}`,d).then(unwrap),
  recalcScore:  id => api.post(`/admin/users/${id}/recalculate`).then(unwrap),
  campaigns:    p  => api.get('/admin/campaigns',{params:p}).then(unwrap),
  pendingCampaigns: () => api.get('/admin/campaigns/pending').then(unwrap),
  updateCampaign:   (id,d) => api.put(`/admin/campaigns/${id}`,d).then(unwrap),
  analyzeAI:    id => api.post(`/admin/campaigns/${id}/analyze`).then(unwrap),
  assignCreators:(id,d) => api.post(`/admin/campaigns/${id}/assign`,d).then(unwrap),
  updateAssignment:(id,cid,d) => api.put(`/admin/campaigns/${id}/assign/${cid}`,d).then(unwrap),
  broadcast:    d  => api.post('/admin/broadcast',d).then(unwrap),
  transactions: p  => api.get('/admin/transactions',{params:p}).then(unwrap),
};

/* ── Users ────────────────────────────────────────── */
export const usersAPI = {
  profile:      () => api.get('/users/profile').then(unwrap),
  updateProfile:d  => api.put('/users/profile',d).then(unwrap),
  publicProfile:handle => api.get(`/users/${handle}`).then(unwrap),
  leaderboard:  p  => api.get('/users/leaderboard',{params:p}).then(unwrap),
  creators:     p  => api.get('/users/creators',{params:p}).then(unwrap),
  notifications:() => api.get('/users/notifications/all').then(unwrap),
  readNotifs:   () => api.put('/users/notifications/read').then(unwrap),
};

/* ── Analytics ────────────────────────────────────── */
export const analyticsAPI = {
  brand:   () => api.get('/analytics/brand').then(unwrap),
  creator: () => api.get('/analytics/creator').then(unwrap),
};

export default api;
