import React from 'react';
import { MessageSquare, PlusCircle, Search, RefreshCw, User, Edit3 } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userNickname: string;
  onOpenNicknameModal: () => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalPosts: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  userNickname,
  onOpenNicknameModal,
  onOpenCreateModal,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#CBFF00] text-black border border-[#CBFF00] flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_#222]">
            <MessageSquare className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#CBFF00]">匿名新民</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#1A1A1A] text-[#CBFF00] border border-[#CBFF00]/40 uppercase tracking-wider">
                v1.0
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase hidden sm:block">暢所欲言 ‧ 匿名表達 ‧ 自由心聲</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋貼文標題、關鍵字或匿名暱稱..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#141414] text-[#F0F0F0] placeholder:text-neutral-600 border border-[#222] focus:border-[#CBFF00] transition-all outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-[#CBFF00]"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* User Nickname Badge Button */}
          <button
            onClick={onOpenNicknameModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1A1A1A] text-neutral-200 border border-[#222] hover:border-[#CBFF00] transition-colors font-mono text-xs max-w-[140px] sm:max-w-[200px]"
            title="點擊修改預設暱稱"
          >
            <User className="w-3.5 h-3.5 text-[#CBFF00] shrink-0" />
            <span className="truncate font-bold">{userNickname || '設定暱稱'}</span>
            <Edit3 className="w-3 h-3 text-neutral-500 shrink-0 ml-0.5" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="重新整理貼文"
            className="p-2 text-neutral-400 hover:text-[#CBFF00] hover:bg-[#141414] border border-[#222] hover:border-[#CBFF00] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CBFF00]' : ''}`} />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#CBFF00] hover:bg-[#b8e600] text-black text-xs sm:text-sm font-black uppercase tracking-wider border border-[#CBFF00] shadow-[3px_3px_0px_#222] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>發送貼文</span>
          </button>
        </div>

      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-2.5 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋貼文..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#141414] border border-[#222] text-[#F0F0F0] placeholder:text-neutral-600 focus:outline-none focus:border-[#CBFF00] font-mono"
          />
        </div>
      </div>
    </header>
  );
};
