import React, { useState } from 'react';
import { ShieldCheck, Scale, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface RulesConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const RulesConsentModal: React.FC<RulesConsentModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAgreeSubmit = () => {
    if (!agreeChecked) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-lg rounded-none shadow-[10px_10px_0px_#000] border-2 border-[#CBFF00] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1e1e10] border-b-2 border-[#CBFF00] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-[#CBFF00] animate-pulse shrink-0" />
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-wider">發表前社群守則確認</h2>
              <p className="text-[10px] text-yellow-300/80">COMMUNITY RULES & AGREE AGREEMENT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 font-mono">
          
          <div className="p-3 bg-[#0A0A0A] border border-neutral-800 text-[11px] text-[#CBFF00] flex gap-2">
            <AlertTriangle className="w-5 h-5 text-[#CBFF00] shrink-0" />
            <div>
              <p className="font-bold leading-normal">
                請務必完整閱讀並同意以下使用規範。本站為完全匿名討論區，但為維護公共安全與社群品質，若違反以下條約，管理員將永久停權您的 IP 位址且可能刪除您所有的關聯貼文。
              </p>
            </div>
          </div>

          {/* Rules Document (Scroll Box) */}
          <div 
            onScroll={handleScroll}
            className="bg-[#0A0A0A] border border-[#222] p-4 h-64 overflow-y-auto text-xs space-y-4 text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-800"
          >
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#CBFF00] text-[13px] border-b border-neutral-800 pb-1">一、 嚴禁人身攻擊與毀謗</h3>
              <p className="leading-relaxed text-neutral-400">
                禁止發表針對特定教職員、學生 or 個人之姓名、特徵進行人身攻擊、污辱、毀謗或任何侵犯隱私、霸凌之文章。
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#CBFF00] text-[13px] border-b border-neutral-800 pb-1">二、 禁止散播虛假、造謠或未經證實之言論</h3>
              <p className="leading-relaxed text-neutral-400">
                禁止故意捏造不實謠言、散佈不實消息、挑撥離間。發文者需為言論負完全社會與法律責任。
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#CBFF00] text-[13px] border-b border-neutral-800 pb-1">三、 嚴禁不當暴露與色情廣告</h3>
              <p className="leading-relaxed text-neutral-400">
                禁止張貼或留言任何非法廣告、色情、暴露、博弈網站、洗版垃圾訊息。
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#CBFF00] text-[13px] border-b border-neutral-800 pb-1">四、 IP 偵測與安全風控</h3>
              <p className="leading-relaxed text-neutral-400">
                為防止濫用，系統後端會自動比對連線 IP。若判定惡意發文或涉嫌觸犯法律，管理團隊將逕行停權（Ban）該 IP。停權時不會主動寄發通知，直至您嘗試發文或留言時，方會跳出詳細停權頁面。
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-[#CBFF00] text-[13px] border-b border-neutral-800 pb-1">五、 聯帶刪除機制</h3>
              <p className="leading-relaxed text-neutral-400">
                一旦有貼文被判定惡意而遭停權，管理人員在停權您的 IP 前，得一次性選取並刪除該 IP 於本站發表的所有其他貼文。
              </p>
            </div>
            
            <p className="text-[10px] text-center text-neutral-500 pt-3">
              === 規範條款結束 ===
            </p>
          </div>

          {/* Agree Checkbox */}
          <div className="flex items-start gap-2.5 p-1">
            <input 
              type="checkbox"
              id="agree-rules-check"
              checked={agreeChecked}
              onChange={(e) => setAgreeChecked(e.target.checked)}
              className="mt-0.5 w-4.5 h-4.5 border-2 border-neutral-700 bg-black text-[#CBFF00] focus:ring-0 checked:bg-[#CBFF00] cursor-pointer shrink-0"
            />
            <label 
              htmlFor="agree-rules-check"
              className="text-xs text-neutral-300 cursor-pointer select-none leading-tight"
            >
              我已詳閱、充分理解並同意遵守上述所有社群發言守則。若有違反，願意無條件接受 IP 停權與貼文連帶刪除處分。
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0F0F0F] border-t-2 border-neutral-800 flex items-center justify-end gap-3 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-xs uppercase border border-neutral-800 transition-all"
          >
            取消關閉
          </button>
          
          <button
            disabled={!agreeChecked}
            onClick={handleAgreeSubmit}
            className={`px-5 py-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 border shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              agreeChecked 
                ? 'bg-[#CBFF00] text-black border-[#CBFF00] hover:bg-[#b0dc00]'
                : 'bg-neutral-800 text-neutral-500 border-neutral-800 cursor-not-allowed shadow-none'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>我同意遵守並發表</span>
          </button>
        </div>

      </div>
    </div>
  );
};
