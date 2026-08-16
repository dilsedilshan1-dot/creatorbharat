const isProd = import.meta.env.PROD || import.meta.env.MODE === 'production';

export const ENV = {
  apiUrl: import.meta.env.VITE_API_URL || (isProd ? 'https://creatorbharat.onrender.com/api' : 'http://localhost:4000/api'),
  authMode: isProd ? 'api' : (import.meta.env.VITE_AUTH_MODE || 'api'),
  appEnv: import.meta.env.VITE_ENV || import.meta.env.MODE || (isProd ? 'production' : 'development'),
};

export const isDemoAuthMode = () => {
  if (isProd) {
    return false; // Strictly fail closed in production builds
  }
  return ENV.authMode === 'demo';
};
