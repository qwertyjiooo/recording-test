// src/api/axios.js
import axios from 'axios';
/**
 * @type {import('axios').AxiosInstance}
 */
const axiosInstance = axios.create({
  baseURL: 'http://webtest.mobizone.cn:10251/notes', // 设置全局baseURL
  // baseURL: 'http://localhost:8080', // 设置全局baseURL
  timeout: 10000000, // 设置请求超时时间
  // 其他全局配置...
});
// 你可以在这里添加请求拦截器和响应拦截器
// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };
    // 假设你的token存储在localStorage中
    const token = localStorage.getItem('token');
    if (token) {
      newConfig.headers.Authorization = `Bearer ${token}`;
    }
    return newConfig;
  },
  (error) => Promise.reject(error),
);
export default axiosInstance;
