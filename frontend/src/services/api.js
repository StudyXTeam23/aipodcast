import axios from 'axios';

// 根据环境变量配置 API 基础 URL
// Empty base URL since API methods already include /api prefix
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10分钟超时（AI生成和音频处理需要更长时间）
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// API 方法
export const podcastAPI = {
  // 上传文件
  upload: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/api/v1/podcasts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // 获取播客列表
  getList: async (params = {}) => {
    return api.get('/api/v1/podcasts', { params });
  },

  // 获取播客详情
  getDetail: async (podcastId) => {
    return api.get(`/api/v1/podcasts/${podcastId}`);
  },

  // 删除播客
  delete: async (podcastId) => {
    return api.delete(`/api/v1/podcasts/${podcastId}`);
  },

  // 获取下载链接
  getDownloadLink: async (podcastId) => {
    return api.get(`/api/v1/podcasts/${podcastId}/download`);
  },

  // 获取任务状态
  getJobStatus: async (jobId) => {
    return api.get(`/api/v1/jobs/${jobId}`);
  },

  // AI 生成播客
  generate: async (data) => {
    return api.post('/api/v1/podcasts/generate', data);
  },
};

export default api;

