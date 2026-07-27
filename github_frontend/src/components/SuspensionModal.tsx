import React, { useState, useEffect } from 'react';
import { AlertOctagon, Clock, ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface SuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  banReason: string;
  unbanTimestamp: number;
}

export const SuspensionModal: React.FC<SuspensionModalProps> = ({
  isOpen,
  onClose,
  banReason,
  unbanTimestamp
}) => {
  if (!isOpen) return null;

  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = unbanTimestamp - now;

      if (diff <= 0) {
        setTimeLeftStr('0 分鐘 0 秒');
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        setTimeLeftStr(`${days} 天 ${hours} 小時 ${minutes} 分鐘`);
      } else if (hours > 0) {
        setTimeLeftStr(`${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`);
      } else {
        setTimeLeftStr(`${minutes} 分鐘 ${seconds} 秒`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [unbanTimestamp]);

  const formattedUnbanDate = unbanTimestamp > 0 
    ? new Date(unbanTimestamp).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '已解除';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-lg rounded-none shadow-[10px_10px_0px_#000] border-2 border-rose-600 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950/80 border-b-2 border-rose-600 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-500 animate-pulse shrink-0" />
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-wider">帳號發言功能已停權</h2>
              <p className="text-[10px] text-rose-300">SYSTEM SUSPENSION NOTICE</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-rose-300 hover:text-white hover:bg-rose-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 font-mono">
          
          <div className="p-3.5 bg-[#0A0A0A] border border-rose-900/60 text-xs text-neutral-300 space-y-1.5">
            <p className="text-white font-bold leading-relaxed">
              很抱歉，您的帳號發言權限目前處於<span className="text-rose-400 font-extrabold">「停權限制」</span>狀態，暫時無法發送匿名貼文與發表留言。
            </p>
          </div>

          {/* Ban Details Card */}
          <div className="bg-[#0A0A0A] border border-[#222] p-4 space-y-4">
            
            {/* Reason */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>停權原因</span>
              </label>
              <div className="p-3 bg-[#141414] border border-[#333] text-xs text-rose-300 font-bold leading-relaxed">
                {banReason || '違反匿名社群發言規範與不當內容條款'}
              </div>
            </div>

            {/* Unban Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#CBFF00]" />
                  <span>預計解除時間</span>
                </label>
                <div className="p-2.5 bg-[#141414] border border-[#333] text-xs text-white font-mono font-bold">
                  {formattedUnbanDate}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#CBFF00]" />
                  <span>剩餘停權倒數</span>
                </label>
                <div className={`p-2.5 bg-[#141414] border border-[#333] text-xs font-mono font-black ${
                  isExpired ? 'text-[#CBFF00]' : 'text-rose-400'
                }`}>
                  {isExpired ? '停權時間已屆滿' : timeLeftStr}
                </div>
              </div>
            </div>

          </div>

          <div className="text-[11px] text-neutral-400 space-y-1">
            <p>💡 停權到期後，系統將自動恢復您的貼文與留言發言功能。</p>
            <p className="text-neutral-500">若有疑問請聯絡社群管理團隊處理。</p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider border border-rose-500 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>我知道了</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
