/**
 * 匿名新民 API 伺服器設定檔 (API Configuration)
 * 
 * 部署至線上 (如 Render.com) 時，可在此處或透過 VITE_API_URL 變更您的後端網址。
 */
export const RENDER_BACKEND_URL_PRIMARY = 'https://anonymousxinmin-backed.onrender.com/api';
export const RENDER_BACKEND_URL_SECONDARY = 'https://anonymous-xinmin-backend.onrender.com/api';

const isStaticHost = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('github.io') ||
  window.location.hostname.endsWith('github.app') ||
  window.location.hostname.endsWith('vercel.app') ||
  window.location.hostname.endsWith('netlify.app')
);

export const BACKEND_API_URL = import.meta.env.VITE_API_URL || (isStaticHost ? RENDER_BACKEND_URL_PRIMARY : '/api');

