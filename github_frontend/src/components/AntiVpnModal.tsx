import React from 'react';
import { ShieldOff, AlertTriangle, RefreshCw, X, Lock } from 'lucide-react';

interface AntiVpnModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const AntiVpnModal: React.FC<AntiVpnModalProps> = ({
  isOpen,
  onClose,
  message = '你的網路觸發了安全防護請重開網路或者是關閉VPN或Proxy'
}) => {
  if (!isOpen) return null;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-[#121212] text-[#F0F0F0] w-full max-w-lg rounded-none shadow-[10px_10px_0px_#000] border-2 border-amber-500 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-amber-950/80 border-b-2 border-amber-500 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <ShieldOff className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
            <div>
              <h2 className="font-black text-lg text-white uppercase tracking-wider">發生錯誤</h2>
              <p className="text-[10px] text-amber-300">SECURITY GUARD — ANTI VPN / PROXY</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-amber-300 hover:text-white hover:bg-amber-900/50 transition-colors"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 font-mono">
          
          {/* Main Error Alert Box */}
          <div className="p-4 bg-[#1A1305] border-2 border-amber-500/80 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                SECURITY ALERT
              </span>
              <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                {message}
              </p>
            </div>
          </div>

          {/* Details & Troubleshooting Steps */}
          <div className="bg-[#0A0A0A] border border-[#262626] p-4 space-y-3.5 text-xs text-neutral-300">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-[#222] pb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>為什麼會顯示此提示？</span>
            </div>
            
            <p className="text-neutral-400 leading-relaxed">
              系統檢測到您的網路連線使用了 <span className="text-amber-300 font-bold">VPN、Proxy 代理伺服器或數據中心網路</span>。為了防止洗版、大量機器人惡意攻擊與維護匿名討論環境之真實性，目前無法在此連線下進行貼文、留言、投票或點讚。
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-white block">💡 建議解決方法：</span>
              <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] pl-1">
                <li>關閉手機或電腦上的 <span className="text-white font-semibold">VPN / Proxy 代理軟體</span>。</li>
                <li>將網路切換至 <span className="text-white font-semibold">流動數據 (5G/4G)</span> 或家用寬頻網絡。</li>
                <li>重新開啟行動網路或路由器連線後點擊下方重設。</li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[#222] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleReload}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider border border-amber-400 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新連線與重試</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white font-bold text-xs uppercase tracking-wider border border-[#333] shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>關閉視窗</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
