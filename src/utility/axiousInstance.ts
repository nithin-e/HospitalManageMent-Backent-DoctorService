import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:6001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  }
});

export default axiosInstance;