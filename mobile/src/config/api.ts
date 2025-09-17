// API配置
export const API_CONFIG = {
  // 开发环境
  development: {
    API_URL: 'http://localhost:3001',
    WS_URL: 'ws://localhost:3001',
  },
  // 生产环境
  production: {
    API_URL: 'https://your-api-domain.com',
    WS_URL: 'wss://your-api-domain.com',
  },
};

// 获取当前环境
const getEnvironment = () => {
  return __DEV__ ? 'development' : 'production';
};

// 获取API配置
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
};

// 导出常用配置
export const API_URL = getApiConfig().API_URL;
export const WS_URL = getApiConfig().WS_URL;
