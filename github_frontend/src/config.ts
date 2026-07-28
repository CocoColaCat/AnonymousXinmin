/**
 * 匿名新民 API 伺服器設定檔 (API Configuration)
 * 
 * 部署至線上 (如 Render.com) 時，請直接修改下方的 BACKEND_API_URL 變更為您的後端網址：
 * 例如：
 * export const BACKEND_API_URL = 'https://your-backend-service.onrender.com/api';
 */
export const BACKEND_API_URL = import.meta.env.VITE_API_URL || '/api';
