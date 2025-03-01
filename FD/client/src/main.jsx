import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider, AuthContext } from "./components/context/authContext";
import { setAuthToken } from "./components/utils/axiosInstance";
import React,{useContext, useEffect } from 'react';

// Create a component to set up axios with the auth token
const AxiosSetup = ({ children }) => {
  const { getToken } = useContext(AuthContext);
  
  useEffect(() => {
    setAuthToken(getToken);
  }, [getToken]);

  return children;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AxiosSetup>
        <App />
      </AxiosSetup>
    </AuthProvider>
  </React.StrictMode>
);