import React, { useState } from 'react';
import { Post } from '../types';
import { X, ShieldCheck, Lock, Trash2, AlertCircle, Flag, AlertOctagon, Clock, ShieldAlert, Check, ShieldOff, CheckSquare, Square, CornerDownRight } from 'lucide-react';
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
  posts: propPosts,
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Authenticated state received from the backend
  const [adminPosts, setAdminPosts] = useState<Post[]>([]);
  const [adminBans, setAdminBans] = useState<any[]>([]);

  // "Delete and Ban" Page State
  const [banTargetPost, setBanTargetPost] = useState<Post | null>(null);
  const [selectedAssociatedPostIds, setSelectedAssociatedPostIds] = useState<string[]>([]);
  const [banFormReason, setBanFormReason] = useState('違反社群規範與發表不當言論');
  const [banFormDuration, setBanFormDuration] = useState<number | string>(15); // minutes or 'indefinite'
  const [banActionSuccess, setBanActionSuccess] = useState<string | null>(null);

  const handleTurnstileVerify = (verified: boolean, token?: string) => {
    setIsTurnstileVerified(verified);
    if (token) setTurnstileToken(token);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTurnstileVerified) {
      setErrorMsg('請先完成 Cloudflare 人機安全驗證');
      return;
    }

    if (!secretInput.trim()) {
      setErrorMsg('請輸入管理員密碼');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.adminVerifySecret(secretInput);
      if (res.success) {
        // Sort posts so that reported posts are strictly prioritized at the top
        const sorted = [...res.posts].sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0));
        setAdminPosts(sorted);
        setAdminBans(res.bans || []);
        setIsUnlocked(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '管理員密碼錯誤，請重新輸入');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('確定要單純刪除這篇貼文嗎？此操作無法復原。')) return;

    try {
      setDeletingId(postId);
      await api.adminDeletePost(postId, secretInput);
      onPostDeleted(postId);
      
      // Update local state
      setAdminPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err: any) {
      alert(err.message || '操作失敗');
    } finally {
      setDeletingId(null);
    }
  };

  // Open the "Delete and Ban" configuration overlay
  const handleOpenBanSetup = (post: Post) => {
    setBanTargetPost(post);
    setBanFormReason('違反社群規範與發表不當言論');
    setBanFormDuration(15);
    
    // Find associated posts of same IP and auto-select all of them
    const assoc = adminPosts.filter(p => p.ip === post.ip && p.id !== post.id);
    setSelectedAssociatedPostIds(assoc.map(p => p.id));
  };

  // Execute the secure IP Ban & Selective Post Deletion
  const handleConfirmBanAndDeletes = async () => {
    if (!banTargetPost) return;

    try {
      setIsLoading(true);
      // Main post is always deleted, plus any selected associated posts
      const deleteIds = [banTargetPost.id, ...selectedAssociatedPostIds];
      
      const res = await api.adminBan({
        ip: banTargetPost.ip || '127.0.0.1',
        reason: banFormReason,
        durationMinutes: banFormDuration,
        deletePostIds: deleteIds
      }, secretInput);

      if (res.success) {
        setBanActionSuccess(`已成功停權該 IP (${banTargetPost.ip}) 並且一併清除了 ${deleteIds.length} 篇違規貼文！`);
        
        // Refresh local admin lists with fresh server-side data
        const sorted = [...res.posts].sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0));
        setAdminPosts(sorted);
        setAdminBans(res.bans || []);
        
        // Notify Parent App to update home view
        deleteIds.forEach(id => onPostDeleted(id));

        setTimeout(() => {
          setBanActionSuccess(null);
          setBanTargetPost(null);
        }, 3000);
      }
    } catch (err: any) {
      alert(err.message || '停權動作執行失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanIp = async (ip: string) => {
    if (!window.confirm(`確定要解除停權該 IP address (${ip}) 嗎？`)) return;

    try {
      setIsLoading(true);
      const res = await api.adminUnban(ip, secretInput);
      if (res.success) {
        setAdminBans(res.bans || []);
        alert('已解除該用戶的 IP 停權狀態！');
      }
    } catch (err: any) {
      alert(err.message || '解除停權動作失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter associated posts by same IP for visual inspection
  const associatedPosts = banTargetPost 
    ? adminPosts.filter(p => p.ip === banTargetPost.ip && p.id !== banTargetPost.id)
    : [];

  const reportedPostsCount = adminPosts.filter(p => (p.reportsCount || 0) > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-[#141414] text-[#F0F0F0] w-full max-w-3xl max-h-[90vh] rounded-none shadow-[10px_10px_0px_#000] flex flex-col overflow-hidden border-2 border-[#CBFF00]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#CBFF00] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5 font-mono">
            <ShieldCheck className="w-6 h-6 text-[#CBFF00]" />
            <div>
              <h2 className="font-black text-base text-white uppercase tracking-wider">匿名新民 ‧ 核心管理後台</h2>
              <p className="text-[10px] font-mono text-neutral-500 uppercase">Secure Ban Engine & Selective Deletes</p>
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
                <h3 className="font-black text-base text-white uppercase">版主身分驗證</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  請輸入密碼以解鎖進階 IP 停權與聯帶貼文管理權限
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
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0A0A0A] text-[#F0F0F0] border border-[#222] focus:border-[#CBFF00] outline-none font-sans"
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
                disabled={!isTurnstileVerified || isLoading}
                className="w-full py-3 bg-[#CBFF00] hover:bg-[#b8e600] disabled:opacity-40 disabled:hover:bg-[#CBFF00] text-black font-black text-xs uppercase border border-[#CBFF00] shadow-[4px_4px_0px_#000] transition-all"
              >
                {isLoading ? '驗證解鎖中...' : '驗證並載入管理後台'}
              </button>
            </form>
          ) : banTargetPost ? (
            /* =========================================================================
               DETAILED IP BAN & SELECTIVE DELETION WORKFLOW VIEW
               ========================================================================= */
            <div className="space-y-6 font-mono">
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>正在設定 IP: <strong className="text-white underline">{banTargetPost.ip || '127.0.0.1'}</strong> 的停權處置</span>
                </span>
                <button 
                  onClick={() => setBanTargetPost(null)}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  返回列表
                </button>
              </div>

              {banActionSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>{banActionSuccess}</span>
                </div>
              )}

              {/* 1. Ban Configuration Options */}
              <div className="bg-[#0A0A0A] border border-[#222] p-5 space-y-4">
                <h3 className="text-xs font-black uppercase text-[#CBFF00] border-b border-neutral-800 pb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>1. 設定停權細節 (Ban Details)</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">停權原因 (Ban Reason)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {[
                        '違反社群規範與發表不當言論',
                        '涉嫌人身攻擊、污辱、毀謗他人',
                        '張貼不當色情、廣告、洗版垃圾訊息',
                        '刻意造謠、散佈虛假或未經證實言論'
                      ].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setBanFormReason(r)}
                          className={`p-2 text-left text-[11px] border leading-normal transition-all ${
                            banFormReason === r 
                              ? 'bg-rose-950/40 text-rose-300 border-rose-700' 
                              : 'bg-[#141414] text-neutral-400 border-[#222] hover:border-neutral-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={banFormReason}
                      onChange={(e) => setBanFormReason(e.target.value)}
                      placeholder="或手動輸入自訂原因..."
                      className="w-full px-3 py-2 text-xs bg-[#141414] text-[#F0F0F0] border border-[#333] focus:border-[#CBFF00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">停權時長 (Duration)</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '15 分鐘', val: 15 },
                        { label: '1 小時', val: 60 },
                        { label: '1 天 (24h)', val: 1440 },
                        { label: '7 天', val: 10080 },
                        { label: '永久停權', val: 'indefinite' }
                      ].map(d => (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() => setBanFormDuration(d.val)}
                          className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                            banFormDuration === d.val
                              ? 'bg-[#CBFF00] text-black border-[#CBFF00]'
                              : 'bg-[#141414] text-neutral-300 border-[#333] hover:border-[#CBFF00]'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Associated Posts List with Selection checkboxes */}
              <div className="bg-[#0A0A0A] border border-[#222] p-5 space-y-4">
                <div className="border-b border-neutral-800 pb-1.5 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-[#CBFF00] flex items-center gap-1.5">
                    <Flag className="w-4 h-4" />
                    <span>2. 同 IP 發表之其他貼文關聯審查</span>
                  </h3>
                  <span className="text-[10px] text-neutral-400">
                    同 IP 關聯貼文：{associatedPosts.length} 篇
                  </span>
                </div>

                <div className="p-3 bg-[#141414] border border-neutral-800 text-[11px] text-neutral-400 leading-normal">
                  📌 <strong>聯帶刪除機制：</strong>預設已為您勾選此 IP 發表的所有其他貼文。被勾選的貼文將在停權 IP 的同時<strong>一併被刪除</strong>。
                </div>

                {associatedPosts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500 bg-[#0c0c0c] border border-dashed border-[#222]">
                    此 IP 在本站無其他關聯發表貼文。
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {associatedPosts.map(p => {
                      const isSelected = selectedAssociatedPostIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAssociatedPostIds(prev => prev.filter(id => id !== p.id));
                            } else {
                              setSelectedAssociatedPostIds(prev => [...prev, p.id]);
                            }
                          }}
                          className={`p-3 border flex items-start gap-3 cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-rose-950/20 border-rose-900/60' 
                              : 'bg-[#141414] border-[#222] hover:border-[#333]'
                          }`}
                        >
                          <div className="pt-0.5">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-xs text-white leading-none">{p.title}</span>
                              <span className="text-[9px] bg-black text-rose-400 px-1.5 py-0.5 border border-rose-900">
                                #{p.category}
                              </span>
                              {p.reportsCount > 0 && (
                                <span className="text-[9px] bg-rose-600 text-white px-1 font-bold">
                                  檢報: {p.reportsCount}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 line-clamp-1">{p.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBanTargetPost(null)}
                  className="px-4 py-2 border border-[#444] text-xs font-bold hover:bg-[#1A1A1A]"
                >
                  取消返回
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBanAndDeletes}
                  disabled={isLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs uppercase border border-rose-500 shadow-[3px_3px_0px_#000] flex items-center gap-2"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>{isLoading ? '執行處置中...' : '確認執行停權與刪除'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               MAIN ADMIN CONTROL PANEL
               ========================================================================= */
            <div className="space-y-6 font-mono">
              
              {/* 1. Bans Management Block */}
              <div className="bg-[#0A0A0A] border-2 border-neutral-800 p-4 space-y-4">
                <h3 className="font-black text-xs text-[#CBFF00] flex items-center gap-1.5 uppercase tracking-wider border-b border-neutral-800 pb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>目前安全資料庫限制名單 (Security DB Bans: {adminBans.length})</span>
                </h3>

                {adminBans.length === 0 ? (
                  <div className="text-center py-5 text-xs text-neutral-500">
                    目前本站沒有任何已停權的 IP。
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {adminBans.map(b => (
                      <div 
                        key={b.id || b.ip}
                        className="p-3 bg-[#111] border border-neutral-800 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <strong className="text-rose-400 text-xs">{b.ip}</strong>
                            <span className="text-[10px] text-neutral-500">Banned At: {new Date(b.bannedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-neutral-400 text-[11px]">原因：<span className="text-white">{b.reason}</span></p>
                          <p className="text-[#CBFF00] text-[10px] font-bold">
                            解禁期限：{b.expiresAt === 'indefinite' ? '永久/手動解除' : new Date(b.expiresAt).toLocaleString()}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnbanIp(b.ip)}
                          className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <ShieldOff className="w-3 h-3" />
                          <span>解除停權</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="p-3.5 bg-[#0A0A0A] border border-[#222] text-xs flex items-center justify-between text-neutral-300">
                <span>貼文總數：<strong className="text-white">{adminPosts.length}</strong> 篇</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>有被檢舉貼文：{reportedPostsCount} 篇</span>
                </span>
              </div>

              {/* Posts moderation list */}
              <div className="space-y-3">
                <h3 className="font-black text-xs text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>貼文審核區 (已優先依照「檢舉次數」排序)</span>
                </h3>

                {adminPosts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-neutral-500">
                    目前沒有任何貼文。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminPosts.map(p => (
                      <div
                        key={p.id}
                        className={`p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          (p.reportsCount || 0) > 0 
                            ? 'bg-rose-950/20 border-rose-800/80' 
                            : 'bg-[#0A0A0A] border-[#222]'
                        }`}
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-extrabold text-white text-sm">{p.title}</span>
                            <span className="text-[10px] bg-[#141414] text-[#CBFF00] px-2 py-0.5 border border-[#333] font-bold">
                              #{p.category}
                            </span>
                            <span className="text-[10px] text-neutral-500">by {p.alias}</span>
                            <span className="text-[10px] text-neutral-400 underline decoration-dashed">IP: {p.ip || '127.0.0.1'}</span>
                            
                            {(p.reportsCount || 0) > 0 && (
                              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 font-bold uppercase flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>被檢舉 {p.reportsCount} 次</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-300 font-sans leading-relaxed">{p.content}</p>
                        </div>

                        {/* Actions Block */}
                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          {/* 1. Pure Delete */}
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1 transition-colors uppercase border border-neutral-700"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{deletingId === p.id ? '刪中...' : '刪除'}</span>
                          </button>

                          {/* 2. Delete and Ban */}
                          <button
                            onClick={() => handleOpenBanSetup(p)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1 transition-colors uppercase border border-rose-500 shadow-[2px_2px_0px_#000]"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>刪除並停權</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0A0A] border-t-2 border-neutral-800 flex justify-between items-center font-mono">
          <div className="text-[11px] text-neutral-500 uppercase">
            {isUnlocked ? 'SECURE CONSOLE ACTIVE' : 'AWAITING AUTHENTICATION'}
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
