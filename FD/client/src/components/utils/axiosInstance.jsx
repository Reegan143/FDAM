import axios from "axios";

const createAPIInstance = (port) => {
  return axios.create({
    baseURL: `http://localhost:${port}/api`,
  });
};

export const userAPI = createAPIInstance(import.meta.env.VITE_PORT);
export const adminAPI = createAPIInstance(import.meta.env.VITE_ADMINPORT);
export const vendorAPI = createAPIInstance(import.meta.env.VITE_VENDORPORT);
export const utilsAPI = createAPIInstance(import.meta.env.VITE_UTILSPORT);
export const authAPI = createAPIInstance(import.meta.env.VITE_AUTHPORT);

const instances = [userAPI, adminAPI, vendorAPI, utilsAPI];
export const setAuthToken = (getToken) => {
  
  instances.forEach(instance => {
    instance.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        if (!(error instanceof Error)) {
          return Promise.reject(new Error(error?.message.error || 'Request failed'));
        }
        return Promise.reject(error);
      }
    );
  });
};



export default {
  user: userAPI,
  admin: adminAPI,
  vendor: vendorAPI,
  utils: utilsAPI,
  auth : authAPI
};