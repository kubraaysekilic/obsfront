import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('obs_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('obs_token');
      localStorage.removeItem('obs_user');
      window.location.href = '/login';
    }
    const msg = error.response?.data?.message || error.message || 'Bir hata oluştu';
    return Promise.reject(new Error(msg));
  }
);

export const authService = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
};

export const bolumService = {
  getAll:  ()         => api.get('/bolumler'),
  getById: (id)       => api.get(`/bolumler/${id}`),
  create:  (data)     => api.post('/bolumler', data),
  update:  (id, data) => api.put(`/bolumler/${id}`, data),
  delete:  (id)       => api.delete(`/bolumler/${id}`),
};

export const ogrenciService = {
  getAll:        ()         => api.get('/ogrenciler'),
  getById:       (id)       => api.get(`/ogrenciler/${id}`),
  search:        (keyword)  => api.get(`/ogrenciler/search?keyword=${keyword}`),
  getByBolum:    (bolumId)  => api.get(`/ogrenciler/bolum/${bolumId}`),
  getIstatistik: ()         => api.get('/ogrenciler/istatistik'),
  create:        (data)     => api.post('/ogrenciler', data),
  update:        (id, data) => api.put(`/ogrenciler/${id}`, data),
  delete:        (id)       => api.delete(`/ogrenciler/${id}`),
  toggleAktif:   (id)       => api.patch(`/ogrenciler/${id}/toggle-aktif`),
};

export const dersService = {
  getAll:     ()         => api.get('/dersler'),
  getById:    (id)       => api.get(`/dersler/${id}`),
  getByBolum: (bolumId)  => api.get(`/dersler/bolum/${bolumId}`),
  create:     (data)     => api.post('/dersler', data),
  update:     (id, data) => api.put(`/dersler/${id}`, data),
  delete:     (id)       => api.delete(`/dersler/${id}`),
};

export const notService = {
  getAll:       ()         => api.get('/notlar'),
  getById:      (id)       => api.get(`/notlar/${id}`),
  getByOgrenci: (id)       => api.get(`/notlar/ogrenci/${id}`),
  getByDers:    (id)       => api.get(`/notlar/ders/${id}`),
  create:       (data)     => api.post('/notlar', data),
  update:       (id, data) => api.put(`/notlar/${id}`, data),
  delete:       (id)       => api.delete(`/notlar/${id}`),
};

export default api;

export const kullaniciService = {
  getAll:        ()                  => api.get('/kullanicilar'),
  getById:       (id)                => api.get(`/kullanicilar/${id}`),
  rolDegistir:   (id, rol)           => api.put(`/kullanicilar/${id}/rol-degistir`, { rol }),
  ogrenciBagla:  (id, ogrenciId)     => api.put(`/kullanicilar/${id}/ogrenci-bagla`, { ogrenciId }),
  toggleAktif:   (id)                => api.patch(`/kullanicilar/${id}/toggle-aktif`),
  delete:        (id)                => api.delete(`/kullanicilar/${id}`),
};

export const guvenlikService = {
  getLogs:         () => api.get('/auth/security-logs'),
  getHighRiskLogs: () => api.get('/auth/security-logs/high-risk'),
};
