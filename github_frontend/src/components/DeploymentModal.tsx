import React, { useState, useEffect } from 'react';
import { X, Server, Github, CheckCircle2, AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, api } from '../lib/api';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'status' | 'frontend' | 'backend'>('status');
  const [apiUrlInput, setApiUrlInput] = useState(getApiBaseUrl());
  const [statusText, setStatusText] = useState<'checking' | 'connected' | 'error'>('checking');
  const [healthData, setHealthData] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatusText('checking');
      const res = await api.getHealth();
      setHealthData(res);
      setStatusText('connected');
    } catch (err) {
      setStatusText('error');
      setHealthData(null);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrlInput);
    checkConnection();
  };

  const handleResetDefault = () => {
    setApiBaseUrl('');
    setApiUrlInput('/api');
    checkConnection();
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-2xl max-h-[90vh] rounded-none shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden border border-[#222]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2 font-mono">
            <div className="w-8 h-8 rounded-none bg-[#CBFF00] text-black flex items-center justify-center font-black">
              🚀
            </div>
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-wider">伺服器與部署指南</h2>
              <p className="text-[10px] font-mono text-neutral-500">github_frontend ＋ render_backend 雙資料夾結構</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-[#CBFF00] hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222] bg-[#0A0A0A] px-6 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 border-b-2 uppercase font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-[#CBFF00] bg-[#141414] text-[#CBFF00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>API 網址與連線測試</span>
          </button>

          <button
            onClick={() => setActiveTab('frontend')}
            className={`px-4 py-2.5 border-b-2 uppercase font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'frontend'
                ? 'border-[#CBFF00] bg-[#141414] text-[#CBFF00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>github_frontend</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`px-4 py-2.5 border-b-2 uppercase font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'backend'
                ? 'border-[#CBFF00] bg-[#141414] text-[#CBFF00]'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>render_backend</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm text-neutral-300">
          {activeTab === 'status' && (
            <div className="space-y-4 font-mono">
              <div className={`p-4 border flex items-center justify-between ${
                statusText === 'connected'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : statusText === 'error'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : 'bg-[#0A0A0A] border-[#222] text-neutral-300'
              }`}>
                <div className="flex items-center gap-3">
                  {statusText === 'connected' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
                  {statusText === 'error' && <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />}
                  {statusText === 'checking' && <RefreshCw className="w-6 h-6 text-[#CBFF00] animate-spin shrink-0" />}

                  <div>
                    <div className="font-bold text-sm">
                      {statusText === 'connected' && 'API 伺服器連線正常 ✅'}
                      {statusText === 'error' && '無法連線至指定的 API 端點 ❌'}
                      {statusText === 'checking' && '正在測試 API 連線中...'}
                    </div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      當前 Base URL: <code className="font-mono font-bold text-[#CBFF00]">{getApiBaseUrl()}</code>
                    </div>
                  </div>
                </div>

                <button
                  onClick={checkConnection}
                  className="px-3 py-1.5 bg-[#141414] border border-[#333] hover:border-[#CBFF00] text-neutral-200 font-bold text-xs"
                >
                  重新檢測
                </button>
              </div>

              {healthData && (
                <div className="p-3 bg-[#0A0A0A] border border-[#222] text-xs font-mono text-neutral-300 space-y-1">
                  <div>專案服務：{healthData.service}</div>
                  <div>伺服器狀態：{healthData.status}</div>
                  <div>資料庫貼文數：{healthData.totalPosts}</div>
                </div>
              )}

              <div className="p-4 bg-[#0A0A0A] border border-[#222] space-y-3 font-mono">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-[#CBFF00]">🔗 自訂 Render 後端 URL (串接線上 Render API)</span>
                </h4>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  如果您已經將 <code className="bg-[#141414] text-[#CBFF00] px-1 py-0.5 border border-[#333]">render_backend</code> 部署至 Render.com，可以在此處輸入您的 Render Web Service 網址，前端即會自動改為串接您的 Render 線上資料庫！
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={apiUrlInput}
                    onChange={(e) => setApiUrlInput(e.target.value)}
                    placeholder="https://xxx.onrender.com/api 或 /api"
                    className="flex-1 px-3 py-2 text-xs bg-[#141414] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none font-mono"
                  />
                  <button
                    onClick={handleSaveApiUrl}
                    className="px-4 py-2 bg-[#CBFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase border border-[#CBFF00]"
                  >
                    儲存變更
                  </button>
                  <button
                    onClick={handleResetDefault}
                    className="px-3 py-2 bg-[#141414] hover:bg-[#222] text-neutral-300 border border-[#333] font-bold text-xs"
                  >
                    重置為預設
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'frontend' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 bg-[#0A0A0A] border border-[#CBFF00]/40">
                <h3 className="font-bold text-[#CBFF00] text-sm mb-1 uppercase tracking-wider">
                  📂 github_frontend 資料夾說明
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  這個資料夾包含獨立的 React + Vite 前端程式碼，專為部署於 <strong>GitHub Pages (github.io)</strong> 打造。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider">部署 3 步驟：</h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-400">
                  <li>將專案推送到 GitHub Repository。</li>
                  <li>前往儲存庫設定 <strong>Settings -&gt; Pages</strong>，將 Source 設定為 GitHub Actions。</li>
                  <li>在專案中建立 <code className="bg-[#0A0A0A] text-[#CBFF00] px-1 border border-[#333]">.github/workflows/deploy.yml</code> 即可自動化發布！</li>
                </ol>

                <div className="p-3 bg-[#0A0A0A] border border-[#222] text-[#CBFF00] font-mono text-[11px] overflow-x-auto relative">
                  <button
                    onClick={() => handleCopy(`cd github_frontend\nnpm install\nnpm run build`, 'fe-cmd')}
                    className="absolute right-2 top-2 px-2 py-1 bg-[#141414] hover:bg-[#222] text-neutral-300 border border-[#333] text-xs flex items-center gap-1"
                  >
                    {copiedText === 'fe-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'fe-cmd' ? '已複製' : '複製指令'}</span>
                  </button>
                  <pre>{`cd github_frontend\nnpm install\nnpm run build`}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4 font-mono">
              <div className="p-4 bg-[#0A0A0A] border border-emerald-800/60">
                <h3 className="font-bold text-emerald-400 text-sm mb-1 uppercase tracking-wider">
                  📂 render_backend 資料夾說明
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  這個資料夾包含獨立的 Node.js + Express API 伺服器，附帶 CORS 跨域支援與持久化資料儲存，可免費部署於 <strong>Render.com (Free Tier)</strong>。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider">Render 部署設定值：</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-neutral-500 block text-[10px]">Root Directory</span>
                    <strong className="font-mono text-[#CBFF00]">render_backend</strong>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-neutral-500 block text-[10px]">Build Command</span>
                    <strong className="font-mono text-[#CBFF00]">npm install</strong>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-neutral-500 block text-[10px]">Start Command</span>
                    <strong className="font-mono text-[#CBFF00]">node index.js</strong>
                  </div>
                  <div className="p-2.5 bg-[#0A0A0A] border border-[#222]">
                    <span className="text-neutral-500 block text-[10px]">CORS_ORIGIN</span>
                    <strong className="font-mono text-[#CBFF00]">* (允許所有前端)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#222] flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#CBFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase border border-[#CBFF00]"
          >
            了解並關閉
          </button>
        </div>

      </div>
    </div>
  );
};
