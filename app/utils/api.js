import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.6:3000/api/users'; //

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
