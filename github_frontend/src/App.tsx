import React, { useState, useEffect, useCallback } from 'react';
import { Post, CategoryType, SortType, CreatePostPayload } from './types';
import { api } from './lib/api';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { NicknameModal } from './components/NicknameModal';
import { AdminModal } from './components/AdminModal';
import { SuspensionModal } from './components/SuspensionModal';
import { Plus, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('全部');
  const [selectedSort, setSelectedSort] = useState<SortType>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // User Nickname State
  const [userNickname, setUserNickname] = useState<string>('');
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isInitialNicknameSetup, setIsInitialNicknameSetup] = useState(false);

  // Modals State
  const [activeDetailPost, setActiveDetailPost] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);

  // Suspension / Ban Management State
  const [banReason, setBanReason] = useState<string>('違反社群規範與發表不當言論');
  const [banMinutes, setBanMinutes] = useState<number>(15);
  const [unbanTimestamp, setUnbanTimestamp] = useState<number>(0);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const checkIsBanned = useCallback(() => {
    return unbanTimestamp > Date.now();
  }, [unbanTimestamp]);

  // On Mount: Check Nickname, Ban State & Admin Route
  useEffect(() => {
    const savedNickname = localStorage.getItem('xinmin_user_nickname');
    if (savedNickname) {
      setUserNickname(savedNickname);
    } else {
      setIsInitialNicknameSetup(true);
      setIsNicknameModalOpen(true);
    }

    // Check Ban State
    const savedBanState = localStorage.getItem('xinmin_ban_state');
    if (savedBanState) {
      try {
        const parsed = JSON.parse(savedBanState);
        if (parsed.banReason) setBanReason(parsed.banReason);
        if (parsed.banMinutes) setBanMinutes(parsed.banMinutes);
        if (parsed.unbanTimestamp && parsed.unbanTimestamp > Date.now()) {
          setUnbanTimestamp(parsed.unbanTimestamp);
        }
      } catch (e) {
        console.error('Failed to parse ban state:', e);
      }
    }

    // Check if URL ends with /admin.html or hash #admin or query ?admin
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    if (
      path.endsWith('/admin.html') ||
      path.endsWith('/admin') ||
      hash === '#admin' ||
      hash.includes('admin') ||
      search.includes('admin')
    ) {
      setIsAdminModalOpen(true);
    }
  }, []);

  // Trigger Ban Action
  const handleTriggerBan = useCallback(() => {
    const durationMs = (banMinutes || 15) * 60 * 1000;
    const newUnbanTime = Date.now() + durationMs;
    const reasonToUse = banReason || '違反社群規範與發表不當言論';

    const banState = {
      banReason: reasonToUse,
      banMinutes: banMinutes || 15,
      unbanTimestamp: newUnbanTime
    };

    localStorage.setItem('xinmin_ban_state', JSON.stringify(banState));
    setUnbanTimestamp(newUnbanTime);
    setIsSuspensionModalOpen(true);
    showToast(`🛑 帳號已被停權！發言權限將暫停 ${banMinutes} 分鐘`);
  }, [banMinutes, banReason]);

  // Clear Ban Action
  const handleClearBan = () => {
    localStorage.removeItem('xinmin_ban_state');
    setUnbanTimestamp(0);
    setIsSuspensionModalOpen(false);
    showToast('🔓 已成功解除帳號停權狀態！');
  };

  // Update Ban Config from Admin
  const handleUpdateBanConfig = (newReason: string, newMinutes: number) => {
    setBanReason(newReason);
    setBanMinutes(newMinutes);

    const savedBanState = localStorage.getItem('xinmin_ban_state');
    if (savedBanState) {
      try {
        const parsed = JSON.parse(savedBanState);
        if (parsed.unbanTimestamp > Date.now()) {
          const updated = {
            ...parsed,
            banReason: newReason,
            banMinutes: newMinutes,
            unbanTimestamp: Date.now() + newMinutes * 60 * 1000
          };
          localStorage.setItem('xinmin_ban_state', JSON.stringify(updated));
          setUnbanTimestamp(updated.unbanTimestamp);
        }
      } catch (e) {}
    }
    showToast('💾 停權設定已更新！');
  };

  const handleOpenCreateModal = () => {
    if (checkIsBanned()) {
      setIsSuspensionModalOpen(true);
      showToast('🛑 權限受限：您已被停權，無法發送貼文');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveNickname = (newNickname: string) => {
    localStorage.setItem('xinmin_user_nickname', newNickname);
    setUserNickname(newNickname);
    setIsNicknameModalOpen(false);
    setIsInitialNicknameSetup(false);
    showToast(`✨ 已設定預設暱稱：「${newNickname}」`);
  };

  // Fetch posts from API
  const fetchPosts = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      setIsRefreshing(true);
      setErrorMsg('');

      const data = await api.getPosts(selectedCategory, selectedSort, searchQuery);
      setPosts(data);
    } catch (err: any) {
      console.error('Fetch posts failed:', err);
      setErrorMsg(err.message || '無法連線至匿名新民 API 伺服器，請確認後端狀況。');
    } fontally: () => {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, selectedSort, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Post Creation
  const handleCreatePost = async (payload: CreatePostPayload) => {
    if (checkIsBanned()) {
      setIsSuspensionModalOpen(true);
      showToast('🛑 權限受限：您已被停權，無法發送貼文');
      throw new Error('帳號已被停權，無法發送貼文');
    }

    const newPost = await api.createPost(payload);
    showToast('🎉 匿名貼文成功發布！');
    fetchPosts(true);
  };

  // Handle Reactions
  const handleReact = async (postId: string, reactionType: 'like' | 'heart' | 'laugh' | 'sad' | 'angry') => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const reactions = { ...p.reactions };
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return { ...p, reactions };
      }
      return p;
    }));

    if (activeDetailPost && activeDetailPost.id === postId) {
      setActiveDetailPost(prev => {
        if (!prev) return null;
        const reactions = { ...prev.reactions };
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return { ...prev, reactions };
      });
    }

    try {
      await api.reactToPost(postId, reactionType);
    } catch (err) {
      console.error('React failed:', err);
    }
  };

  // Handle Poll Vote
  const handleVote = async (postId: string, optionId: string) => {
    try {
      await api.votePoll(postId, optionId);
      showToast('✅ 投票成功！');
      fetchPosts(true);
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  // Handle Report
  const handleReport = async (postId: string) => {
    try {
      const res = await api.reportPost(postId);
      showToast(res.message || '已收到您的檢舉，感謝共同維護社群環境！');
    } catch (err) {
      showToast('檢舉提交失敗');
    }
  };

  // Handle Comment Creation
  const handleAddComment = async (postId: string, content: string, alias?: string, replyToFloor?: number) => {
    if (checkIsBanned()) {
      setIsSuspensionModalOpen(true);
      showToast('🛑 權限受限：您已被停權，無法發表留言');
      throw new Error('帳號已被停權，無法發表留言');
    }

    await api.createComment(postId, { content, alias, replyToFloor });
    showToast('💬 匿名留言成功發送！');
    
    const updatedPost = await api.getPostById(postId);
    setActiveDetailPost(updatedPost);
    fetchPosts(true);
  };

  // Handle Comment Like
  const handleLikeComment = async (postId: string, commentId: string) => {
    await api.likeComment(postId, commentId);
    
    const updatedPost = await api.getPostById(postId);
    setActiveDetailPost(updatedPost);
  };

  // Handle Admin Post Delete
  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (activeDetailPost?.id === postId) {
      setActiveDetailPost(null);
    }
    showToast('🗑️ 貼文已順利刪除');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col font-sans selection:bg-[#CBFF00] selection:text-black">
      
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#141414] text-[#CBFF00] text-xs font-mono font-bold uppercase tracking-wider rounded-none flex items-center gap-2 border-2 border-[#CBFF00] shadow-[4px_4px_0px_#000] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#CBFF00]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userNickname={userNickname}
        onOpenNicknameModal={() => {
          setIsInitialNicknameSetup(false);
          setIsNicknameModalOpen(true);
        }}
        onOpenCreateModal={handleOpenCreateModal}
        onRefresh={() => fetchPosts()}
        isRefreshing={isRefreshing}
        totalPosts={posts.length}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* Category & Sorting Controls */}
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
          postCount={posts.length}
        />

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/40 border-2 border-rose-600 rounded-none flex items-center justify-between text-xs text-rose-200 font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Posts Feed Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-[#141414] rounded-none p-5 border border-[#222] animate-pulse space-y-3">
                <div className="h-4 bg-[#222] rounded-none w-1/3" />
                <div className="h-6 bg-[#222] rounded-none w-3/4" />
                <div className="h-16 bg-[#1A1A1A] rounded-none w-full" />
                <div className="h-4 bg-[#222] rounded-none w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#141414] rounded-none p-10 text-center border-2 border-[#222] shadow-[6px_6px_0px_#000] space-y-4 my-8">
            <div className="w-16 h-16 bg-[#1A1A1A] text-[#CBFF00] border border-[#CBFF00]/40 rounded-none mx-auto flex items-center justify-center font-bold text-2xl">
              🍃
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">目前沒有找到相關匿名貼文</h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {searchQuery ? `搜尋「${searchQuery}」無結果，試試其他關鍵字吧！` : '搶先成為第一個發表貼文的新民吧！'}
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 bg-[#CBFF00] hover:bg-[#b8e600] text-black text-xs font-black uppercase tracking-wider rounded-none shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>發表第一篇貼文</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClickDetail={(p) => setActiveDetailPost(p)}
                onReact={handleReact}
                onVote={handleVote}
                onReport={handleReport}
              />
            ))}
          </div>
        )}

      </main>

      {/* Floating Mobile Post FAB */}
      <button
        onClick={handleOpenCreateModal}
        className="fixed right-5 bottom-6 z-30 sm:hidden w-13 h-13 bg-[#CBFF00] text-black border-2 border-black rounded-none shadow-[4px_4px_0px_#000] flex items-center justify-center active:scale-95 transition-transform"
        aria-label="發送貼文"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Footer */}
      <footer className="mt-12 bg-[#0A0A0A] border-t border-[#222] py-8 px-4 text-center text-xs text-neutral-400 space-y-3 font-mono">
        <div className="flex items-center justify-center gap-2 text-[#CBFF00] font-black uppercase tracking-widest text-sm">
          <MessageSquare className="w-4 h-4" />
          <span>匿名新民 (ANONYMOUS XINMIN)</span>
        </div>
        <p className="max-w-md mx-auto text-[11px] text-neutral-500 uppercase tracking-wider">
          暢所欲言 ‧ 匿名表達 ‧ 自由心聲
        </p>

        {/* Discreet Admin & API Config Links */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-neutral-500">
          <button onClick={() => setIsAdminModalOpen(true)} className="hover:text-[#CBFF00] transition-colors">
            ⚙️ 管理員後台
          </button>
          <span>|</span>
          <button onClick={() => {
            const currentUrl = localStorage.getItem('XINMIN_API_URL') || 'https://anonymousxinmin-backed.onrender.com/api';
            const newUrl = window.prompt('請輸入您的後端 API 網址 (例如 https://yourbackend.onrender.com/api)：', currentUrl);
            if (newUrl !== null) {
              if (newUrl.trim() === '') {
                localStorage.removeItem('XINMIN_API_URL');
              } else {
                localStorage.setItem('XINMIN_API_URL', newUrl.trim());
              }
              window.location.reload();
            }
          }} className="hover:text-[#CBFF00] transition-colors">
            🌐 更改後端 API
          </button>
        </div>

        <div className="text-[10px] text-neutral-600 pt-2 border-t border-[#1A1A1A] max-w-xs mx-auto">
          © {new Date().getFullYear()} 匿名新民 ‧ ARTISTIC FLAIR THEME
        </div>
      </footer>

      {/* Modals */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        currentNickname={userNickname}
        onSave={handleSaveNickname}
        onClose={() => setIsNicknameModalOpen(false)}
        isInitialSetup={isInitialNicknameSetup}
      />

      <PostDetailModal
        post={activeDetailPost}
        onClose={() => setActiveDetailPost(null)}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        posts={posts}
        onPostDeleted={handlePostDeleted}
        banReason={banReason}
        banMinutes={banMinutes}
        onUpdateBanConfig={handleUpdateBanConfig}
        onTriggerBan={handleTriggerBan}
        onClearBan={handleClearBan}
        isCurrentlyBanned={checkIsBanned()}
        unbanTimestamp={unbanTimestamp}
      />

      <SuspensionModal
        isOpen={isSuspensionModalOpen}
        onClose={() => setIsSuspensionModalOpen(false)}
        banReason={banReason}
        unbanTimestamp={unbanTimestamp}
      />

    </div>
  );
}
