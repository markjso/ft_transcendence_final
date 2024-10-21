import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {jwtDecode} from "jwt-decode";
import dayjs from "dayjs";

const outputColorRed = "color:red; font-size:20px;"

// const hostname = location.hostname
// const baseUrl: string = `http://${hostname}:8000/api/v1`;
const baseUrl: string = `${import.meta.env.VITE_CN_URL}/api`

// Utility functions for token management
const getAccessToken = (): string | null => localStorage.getItem('access_token');
const getRefreshToken = (): string | null => localStorage.getItem('refresh_token');
const setAccessToken = (token: string): void => localStorage.setItem('access_token', token);

const removeTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Utility function for token expiration check
const isTokenExpired = (token: string): boolean => {
  try {
    const { exp }: { exp: number } = jwtDecode(token);
    return dayjs.unix(exp).diff(dayjs()) < 1;
  } catch (error) {
    console.error(`%c Error decoding token:`, outputColorRed, error);
    return false;
  }
};

// Handle logout functionality
const handleLogout = async (): Promise<void> => {
  try {
    const refresh_token = getRefreshToken();
    if (refresh_token) {
      const res: AxiosResponse = await axios.post(`${baseUrl}/v1/auth/logout/`, { "refresh": refresh_token });
      if (res.status === 200) {
        removeTokens();
        AxiosInstance.defaults.headers.Authorization = "";
        axios.defaults.headers.Authorization = "";
      }
    }
  } catch (error) {
    console.error("Error during logout:");
  }
};

// Create Axios instance with base URL and default headers
const AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-type': 'application/json',
    "Authorization": getAccessToken() ? `Bearer ${getAccessToken()}` : ""
  }
});

// Axios request interceptor for handling token refresh
AxiosInstance.interceptors.request.use(async (req: InternalAxiosRequestConfig) => {
  let access_token = getAccessToken();
  const refresh_token = getRefreshToken();

  if (access_token && !isTokenExpired(access_token)) {
    req.headers.Authorization = `Bearer ${access_token}`;
    return req;
  }

  if (refresh_token) {
    try {
      const response: AxiosResponse = await axios.post(`${baseUrl}/v1/auth/token/refresh/`, { "refresh": refresh_token });
      if (response.status === 200) {
        access_token = response.data.access;
        if (access_token) {
          setAccessToken(access_token);
          req.headers.Authorization = `Bearer ${access_token}`;
        }
        else {
          await handleLogout();
        }
      } else {
        await handleLogout();
      }
    } catch (error) {
      await handleLogout();
    }
  } else {
    await handleLogout();
  }

  return req;
}, (error) => {
  return Promise.reject(error);
});

export default AxiosInstance;
