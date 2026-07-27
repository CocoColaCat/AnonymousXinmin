import React, { useState, useEffect, useRef } from 'react';
import { CategoryType, CreatePostPayload, Post } from '../types';
import { X, Sparkles, Image, BarChart2, Plus, Trash2, AlertCircle, Upload } from 'lucide-react';
import { CloudflareTurnstile } from './CloudflareTurnstile';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePostPayload) => Promise<void>;
}

const categories: CategoryType[] = ['閒聊', '告白', '抱怨', '課業', '心事', '生活', '求助'];

const themes: { id: Post['cardTheme']; label: string; colorClass: string }[] = [
  { id: 'default', label: '預設純黑', colorClass: 'bg-[#141414] text-white border-[#333]' },
  { id: 'pink', label: '霓虹粉', colorClass: 'bg-[#2a0818] text-rose-300 border-rose-900/60' },
  { id: 'yellow', label: '螢光黃', colorClass: 'bg-[#222800] text-[#CBFF00] border-[#CBFF00]/40' },
  { id: 'purple', label: '電光紫', colorClass: 'bg-[#1e082b] text-purple-300 border-purple-900/60' },
  { id: 'blue', label: '賽博藍', colorClass: 'bg-[#061e2b] text-sky-300 border-sky-900/60' },
  { id: 'dark', label: '深淵灰', colorClass: 'bg-[#0A0A0A] text-neutral-300 border-[#333]' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const savedNickname = typeof window !== 'undefined' ? (localStorage.getItem('xinmin_user_nickname') || '') : '';
  const userAlias = savedNickname || '匿名新民';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('閒聊');
  const [cardTheme, setCardTheme] = useState<Post['cardTheme']>('default');
  const [imageUrl, setImageUrl] = useState('');

  // Image Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Cloudflare Turnstile CAPTCHA
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('請上傳有效的圖片檔案 (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('圖片大小不能超過 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('請填寫貼文標題');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('請填寫貼文內容');
      return;
    }

    if (!isTurnstileVerified) {
      setErrorMsg('請先完成 Cloudflare 人機安全驗證');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload: CreatePostPayload = {
        title: title.trim(),
        content: content.trim(),
        category,
        alias: userAlias,
        cardTheme,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (showPoll && pollQuestion.trim()) {
        payload.pollQuestion = pollQuestion.trim();
        payload.pollOptions = pollOptions.filter(o => o.trim() !== '');
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '發布失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-xl max-h-[90vh] rounded-none shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden border border-[#222]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2 font-mono">
            <div className="w-8 h-8 rounded-none bg-[#CBFF00] text-black flex items-center justify-center font-black">
              ✍️
            </div>
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-wider">發表匿名貼文</h2>
              <p className="text-[10px] font-mono text-neutral-500">以 <strong className="text-[#CBFF00]">{userAlias}</strong> 身份匿名發表</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-[#CBFF00] hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Select */}
          <div className="font-mono">
            <label className="block text-xs font-bold text-[#CBFF00] mb-1 uppercase tracking-wider">
              貼文分類 <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0A0A0A] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#141414] text-[#F0F0F0]">{cat}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#CBFF00] mb-1 font-mono uppercase tracking-wider">
              貼文標題 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="給貼文一個吸引人的標題吧..."
              className="w-full px-3.5 py-2 text-sm font-bold bg-[#0A0A0A] text-white border border-[#222] focus:border-[#CBFF00] outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-[#CBFF00] mb-1 font-mono uppercase tracking-wider">
              貼文內容 <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="請輸入您想匿名表達的心情、故事或問題..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#0A0A0A] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none resize-none"
            />
          </div>

          {/* Theme card selection */}
          <div className="font-mono">
            <label className="block text-xs font-bold text-neutral-400 mb-1.5 uppercase tracking-wider">
              選擇貼文卡片風格
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {themes.map(th => (
                <button
                  type="button"
                  key={th.id}
                  onClick={() => setCardTheme(th.id)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-all ${th.colorClass} ${
                    cardTheme === th.id ? 'ring-2 ring-[#CBFF00] scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="font-mono">
            <label className="block text-xs font-bold text-neutral-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Image className="w-3.5 h-3.5 text-[#CBFF00]" />
              <span>上傳附圖 (可選)</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {!imageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-3 bg-[#0A0A0A] border border-dashed border-[#333] hover:border-[#CBFF00] cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs text-neutral-400 transition-colors"
              >
                <Upload className="w-5 h-5 text-[#CBFF00]" />
                <span>點擊上傳圖片</span>
                <span className="text-[10px] text-neutral-500">支援 JPG, PNG, WEBP, GIF (最大 5MB)</span>
              </div>
            ) : (
              <div className="relative border border-[#333] bg-[#0A0A0A] p-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={imageUrl} alt="預覽" className="w-12 h-12 object-cover border border-[#222]" />
                  <span className="text-xs text-neutral-300 truncate font-mono">已成功選擇圖片</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>刪除圖片</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle Poll section */}
          <div className="pt-2 border-t border-[#222] font-mono">
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#CBFF00] hover:underline"
            >
              <BarChart2 className="w-4 h-4" />
              <span>{showPoll ? '取消新增投票選單' : '+ 新增全民投票選項'}</span>
            </button>

            {showPoll && (
              <div className="mt-3 p-3.5 bg-[#0A0A0A] border border-[#CBFF00]/30 space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#CBFF00] mb-1">
                    投票問題
                  </label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="例如：大家宵夜首選是鹹酥雞還是豆漿？"
                    className="w-full px-3 py-1.5 text-xs bg-[#141414] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#CBFF00]">
                    投票選項
                  </label>
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...pollOptions];
                          copy[idx] = e.target.value;
                          setPollOptions(copy);
                        }}
                        placeholder={`選項 ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs bg-[#141414] text-[#F0F0F0] border border-[#222] outline-none focus:border-[#CBFF00]"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="p-1.5 text-rose-400 hover:bg-rose-950/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-xs text-[#CBFF00] font-bold hover:underline flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增選項</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cloudflare Turnstile Robot Protection */}
          <div className="pt-2 border-t border-[#222] font-mono">
            <label className="block text-xs font-bold text-[#CBFF00] mb-2 uppercase tracking-wider">
              Cloudflare 人機驗證 <span className="text-rose-500">*</span>
            </label>
            <CloudflareTurnstile onVerify={setIsTurnstileVerified} />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              取消
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isTurnstileVerified}
              className="px-6 py-2 bg-[#CBFF00] hover:bg-[#b8e600] disabled:opacity-40 disabled:hover:bg-[#CBFF00] text-black font-black text-xs uppercase border border-[#CBFF00] shadow-[3px_3px_0px_#000] transition-all flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? '發布中...' : '發送匿名貼文'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
