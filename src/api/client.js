const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
console.log('📡 API Base URL:', API_BASE);

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Public ─────────────────────────────────────────────────────────────────
export const submitInquiry  = (d) => request('POST', '/inquiries', d);
export const getPublicSettings = () => request('GET', '/settings');
export const getPublicBlog  = (params = {}) => request('GET', `/blog?${new URLSearchParams(params)}`);
export const getBlogPost    = (slug) => request('GET', `/blog/${slug}`);
export const getPublicTeam  = () => request('GET', '/team');
export const chatWithAI     = (message, history) => request('POST', '/ai/chat', { message, history });

// ── Auth ───────────────────────────────────────────────────────────────────
export const adminLogin     = (email, password) => request('POST', '/auth/login', { email, password });
export const verifyToken    = (token) => request('POST', '/auth/verify', null, token);
export const changePassword = (token, currentPassword, newPassword) => request('POST', '/auth/change-password', { currentPassword, newPassword }, token);
export const forgotPassword = (email) => request('POST', '/auth/forgot-password', { email });
export const resetPassword  = (email, pin, newPassword) => request('POST', '/auth/reset-password', { email, pin, newPassword });

// ── Admin — Inquiries ──────────────────────────────────────────────────────
export const getInquiries   = (token, params = {}) => request('GET', `/inquiries?${new URLSearchParams(params)}`, null, token);
export const getStats       = (token) => request('GET', '/inquiries/stats', null, token);
export const getInquiry     = (token, id) => request('GET', `/inquiries/${id}`, null, token);
export const updateStatus   = (token, id, status) => request('PATCH', `/inquiries/${id}/status`, { status }, token);
export const deleteInquiry  = (token, id) => request('DELETE', `/inquiries/${id}`, null, token);

// ── Admin — Settings ───────────────────────────────────────────────────────
export const getSettings    = (token) => request('GET', '/settings', null, token);
export const saveSettings   = (token, data) => request('PUT', '/settings', data, token);

// ── Admin — Blog ───────────────────────────────────────────────────────────
export const getBlogPosts   = (token, params = {}) => request('GET', `/blog?${new URLSearchParams({ ...params, status: 'all' })}`, null, token);
export const createPost     = (token, data) => request('POST', '/blog', data, token);
export const updatePost     = (token, id, data) => request('PUT', `/blog/${id}`, data, token);
export const deletePost     = (token, id) => request('DELETE', `/blog/${id}`, null, token);

// ── Admin — Team ───────────────────────────────────────────────────────────
export const getAllTeam     = (token) => request('GET', '/team/all', null, token);
export const createMember   = (token, data) => request('POST', '/team', data, token);
export const updateMember   = (token, id, data) => request('PUT', `/team/${id}`, data, token);
export const deleteMember   = (token, id) => request('DELETE', `/team/${id}`, null, token);

// ── Content ───────────────────────────────────────────────────────────────
export const getContent     = (page, section) => request('GET', `/content/${page}/${section}`);
export const getAllContent  = () => request('GET', '/content/all');
export const saveContent    = (token, page, section, data) => request('POST', '/content', { page, section, data }, token);

// ── Projects ──────────────────────────────────────────────────────────────
export const getProjects    = () => request('GET', '/projects');
export const getProjectCategories = () => request('GET', '/projects/categories');
export const createProject  = (token, p) => request('POST', '/projects', p, token);
export const updateProject  = (token, id, p) => request('PUT', `/projects/${id}`, p, token);
export const deleteProject  = (token, id) => request('DELETE', `/projects/${id}`, null, token);

// Services
export const getServices    = () => request('GET', '/services');
export const getServiceBySlug = (slug) => request('GET', `/services/${slug}`);
export const createService   = (token, s) => request('POST', '/services', s, token);
export const updateService   = (token, id, s) => request('PUT', `/services/${id}`, s, token);
export const deleteService   = (token, id) => request('DELETE', `/services/${id}`, null, token);

// ── Brands ──────────────────────────────────────────────────────────────
export const getBrands      = () => request('GET', '/brands');
export const createBrand    = (token, data) => request('POST', '/brands', data, token);
export const updateBrand    = (token, id, data) => request('PUT', `/brands/${id}`, data, token);
export const deleteBrand    = (token, id) => request('DELETE', `/brands/${id}`, null, token);

// ── Clients ─────────────────────────────────────────────────────────────
export const getClients     = () => request('GET', '/clients');
export const createClient   = (token, data) => request('POST', '/clients', data, token);
export const updateClient   = (token, id, data) => request('PUT', `/clients/${id}`, data, token);
export const deleteClient   = (token, id) => request('DELETE', `/clients/${id}`, null, token);

export const uploadImage = async (token, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const headers = { 'Authorization': `Bearer ${token}` };
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};
