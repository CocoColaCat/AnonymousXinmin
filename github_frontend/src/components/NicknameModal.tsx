import React, { useState } from 'react';
import { User, Dices, Check, Sparkles, X } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  currentNickname: string;
  onSave: (nickname: string) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

const RANDOM_NICKNAMES = [
  '不具名的神秘新民',
  '吉他彈一半的新民',
  '凌晨三點喝珍奶的新民',
  '躺平中的研究生',
  '剛下課的新民',
  '期末通宵戰士',
  '圖書館角落的訪客',
  '愛吃宵夜的新民',
  '深淵中的哲學家',
  '被微積分折磨的新民',
  '發呆中的社畜',
  '聽音樂路過的新民',
  '熱血黑客新民',
  '只想睡覺的新民',
  '神秘校園情報員'
];

export const NicknameModal: React.FC<NicknameModalProps> = ({
  isOpen,
  currentNickname,
  onSave,
  onClose,
  isInitialSetup = false,
}) => {
  const [nicknameInput, setNicknameInput] = useState(currentNickname || '不具名的神秘新民');

  if (!isOpen) return null;

  const handleRandom = () => {
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setNicknameInput(random);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNickname = nicknameInput.trim() || '不具名的神秘新民';
    onSave(finalNickname);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-md rounded-none border-2 border-[#222] shadow-[8px_8px_0px_#000] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0A0A0A] border-b border-[#222] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#CBFF00] text-black flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white uppercase tracking-wider">
                {isInitialSetup ? '歡迎！請設定您的匿名暱稱' : '修改匿名暱稱'}
              </h3>
              <p className="text-[10px] text-neutral-400">進入匿名新民社群前的專屬身份設定</p>
            </div>
          </div>

          {!isInitialSetup && onClose && (
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 font-mono">
          <div className="p-3 bg-[#0A0A0A] border border-[#222] text-xs text-neutral-300 leading-relaxed">
            💡 設定專屬暱稱後，您在發表貼文與留言時將預設使用此暱稱，無需每次重複輸入！隨時可在上方導覽列修改。
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              匿名暱稱
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                placeholder="例如：凌晨三點喝珍奶的新民"
                className="flex-1 px-3.5 py-2.5 bg-[#0A0A0A] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none text-xs font-mono font-bold"
                required
              />
              <button
                type="button"
                onClick={handleRandom}
                title="隨機生成暱稱"
                className="px-3 py-2.5 bg-[#1A1A1A] hover:bg-[#222] text-[#CBFF00] border border-[#333] hover:border-[#CBFF00] text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Dices className="w-4 h-4 text-[#CBFF00]" />
                <span>隨機</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#CBFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider border border-[#CBFF00] shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isInitialSetup ? '儲存暱稱並開始使用' : '儲存暱稱變更'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
