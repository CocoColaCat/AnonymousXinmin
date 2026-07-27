import React, { useState } from 'react';
import { Post } from '../types';
import { X, ShieldCheck, Lock, Trash2, AlertCircle, Flag, AlertOctagon, Clock, ShieldAlert, Check } from 'lucide-react';
import { api } from '../lib/api';
import { CloudflareTurnstile } from './CloudflareTurnstile';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onPostDeleted: (postId: string) => void;
  banReason: string;
  banMinutes: number;
  onUpdateBanConfig: (reason: string, minutes: number) => void;
  onTriggerBan: () => void;
  onClearBan: () => void;
  isCurrentlyBanned: boolean;
  unbanTimestamp: number;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  posts,
  onPostDeleted,
  banReason,
  banMinutes,
  onUpdateBanConfig,
  onTriggerBan,
  onClearBan,
  isCurrentlyBanned,
  unbanTimestamp
}) => {
  if (!isOpen) return null;

  const [secretInput, setSecretInput] = useState('');
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Admin Ban Form state
  const [localReason, setLocalReason] = useState(banReason || '違反社群規範與發表不當言論');
  const [localMinutes, setLocalMinutes] = useState(banMinutes || 15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTurnstileVerify = (verified: boolean, token?: string) => {
    setIsTurnstileVerified(verified);
    if (token) setTurnstileToken(token);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTurnstileVerified) {
      setErrorMsg('請先完成 Cloudflare 人機安全驗證');
      return;
    }

    if (!secretInput.trim()) {
      setErrorMsg('請輸入管理員密碼');
      return;
    }

    setIsUnlocked(true);
    setErrorMsg('');
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('確定要刪除這篇貼文嗎？此操作無法復原。')) return;

    try {
      setDeletingId(postId);
      await api.adminDeletePost(postId, secretInput);
      onPostDeleted(postId);
    } catch (err: any) {
      alert(err.message || '管理員權限驗證失敗或操作異常');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveBanSettings = () => {
    onUpdateBanConfig(localReason, localMinutes);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const reportedPosts = posts.filter(p => (p.reportsCount || 0) > 0);

  const formattedUnbanDate = unbanTimestamp > Date.now() 
    ? new Date(unbanTimestamp).toLocaleString('zh-TW', { hour12: false })
    : '無 (正常權限)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-2xl max-h-[90vh] rounded-none shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden border border-[#222]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-6 h-6 text-[#CBFF00]" />
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-wider">匿名新民 ‧ 管理員後台</h2>
              <p className="text-[10px] font-mono text-neutral-500">版主審核、貼文維護與停權機制控制台</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-[#CBFF00] hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {!isUnlocked ? (
            <form onSubmit={handleUnlock} className="max-w-md mx-auto py-6 space-y-5 text-center font-mono">
              <div className="w-12 h-12 bg-[#0A0A0A] border border-[#222] text-[#CBFF00] mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#CBFF00]" />
              </div>

              <div>
                <h3 className="font-black text-base text-white uppercase">管理員驗證入口</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  請輸入版主密碼並完成人機驗證以進入管理介面
                </p>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 border border-rose-800 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3 text-left">
                <label className="block text-xs font-bold text-[#CBFF00] uppercase tracking-wider">
                  管理員密碼
                </label>
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="請輸入管理員密碼..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0A0A0A] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-[#CBFF00] uppercase tracking-wider">
                  Cloudflare Turnstile 人機驗證
                </label>
                <CloudflareTurnstile onVerify={handleTurnstileVerify} />
              </div>

              <button
                type="submit"
                disabled={!isTurnstileVerified}
                className="w-full py-3 bg-[#CBFF00] hover:bg-[#b8e600] disabled:opacity-40 disabled:hover:bg-[#CBFF00] text-black font-black text-xs uppercase border border-[#CBFF00] shadow-[3px_3px_0px_#000]"
              >
                解鎖並進入管理後台
              </button>
            </form>
          ) : (
            <div className="space-y-6 font-mono">
              
              {/* Ban & Suspension Admin Controls */}
              <div className="bg-[#0A0A0A] border border-rose-900/60 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <h3 className="font-black text-sm text-rose-400 flex items-center gap-2 uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    <span>停權設定與測試控制 (Suspension Admin)</span>
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 font-bold ${
                    isCurrentlyBanned ? 'bg-rose-600 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {isCurrentlyBanned ? '目前狀態：已停權' : '目前狀態：權限正常'}
                  </span>
                </div>

                {savedSuccess && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>已成功更新停權原因與預設時長設定！</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>設定停權原因</span>
                    </label>
                    <input
                      type="text"
                      value={localReason}
                      onChange={(e) => setLocalReason(e.target.value)}
                      placeholder="請輸入停權原因..."
                      className="w-full px-3 py-2 text-xs bg-[#141414] text-[#F0F0F0] border border-[#333] focus:border-[#CBFF00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#CBFF00]" />
                      <span>設定解除時間 (以每分鐘為單位)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10080}
                        value={localMinutes}
                        onChange={(e) => setLocalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 px-3 py-2 text-xs font-bold bg-[#141414] text-[#CBFF00] border border-[#333] focus:border-[#CBFF00] outline-none"
                      />
                      <span className="text-xs text-neutral-400">分鐘</span>
                    </div>
                  </div>
                </div>

                {/* Quick Minute Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                  <span className="text-neutral-500 text-[10px] uppercase">快速設定：</span>
                  {[5, 15, 30, 60, 1440].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLocalMinutes(mins)}
                      className={`px-2 py-0.5 border text-[11px] font-bold ${
                        localMinutes === mins 
                          ? 'bg-[#CBFF00] text-black border-[#CBFF00]' 
                          : 'bg-[#141414] text-neutral-300 border-[#333] hover:border-[#CBFF00]'
                      }`}
                    >
                      {mins >= 1440 ? `${mins / 1440}天` : `${mins}分鐘`}
                    </button>
                  ))}
                </div>

                {/* Action Controls */}
                <div className="pt-2 border-t border-[#222] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-neutral-400">
                    預計解除時間：<strong className="text-white">{formattedUnbanDate}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveBanSettings}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#222] text-white border border-[#444] text-xs font-bold"
                    >
                      儲存此設定
                    </button>

                    {!isCurrentlyBanned ? (
                      <button
                        type="button"
                        onClick={onTriggerBan}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs border border-rose-500 shadow-[2px_2px_0px_#000] flex items-center gap-1"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>🔨 測試發送停權</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onClearBan}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-500 shadow-[2px_2px_0px_#000] flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>🔓 解除目前停權</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Stats Bar */}
              <div className="p-3 bg-[#0A0A0A] border border-[#222] text-xs flex items-center justify-between text-neutral-300">
                <span>目前的貼文總數：<strong className="text-white">{posts.length}</strong> 篇</span>
                <span className="text-rose-400 font-bold">被檢舉貼文：{reportedPosts.length} 篇</span>
              </div>

              {/* Reported / Post List */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>貼文列表 (優先顯示受檢舉項目)</span>
                </h3>

                {posts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-neutral-500">目前沒有貼文。</div>
                ) : (
                  posts.map(p => (
                    <div
                      key={p.id}
                      className={`p-4 border flex items-start justify-between gap-3 ${
                        (p.reportsCount || 0) > 0 ? 'bg-rose-950/30 border-rose-800/80' : 'bg-[#0A0A0A] border-[#222]'
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-extrabold text-white">{p.title}</span>
                          <span className="text-[10px] bg-[#141414] text-[#CBFF00] px-2 py-0.5 border border-[#333] font-bold">
                            #{p.category}
                          </span>
                          <span className="text-[10px] text-neutral-500">by {p.alias}</span>
                          {(p.reportsCount || 0) > 0 && (
                            <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 font-bold uppercase">
                              檢舉數: {p.reportsCount}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-400 line-clamp-2 font-sans">{p.content}</p>
                      </div>

                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors uppercase border border-rose-500 shadow-[2px_2px_0px_#000]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === p.id ? '刪除中...' : '刪除'}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0A0A] border-t border-[#222] flex justify-between items-center font-mono">
          <div className="text-[11px] text-neutral-500">
            {isUnlocked ? '已解鎖管理員權限' : '管理區域驗證中'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141414] hover:bg-[#222] text-[#F0F0F0] border border-[#333] font-bold text-xs"
          >
            關閉
          </button>
        </div>

      </div>

    </div>
  );
};
