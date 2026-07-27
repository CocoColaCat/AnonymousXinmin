import React from 'react';
import { CategoryType, SortType } from '../types';
import { Flame, Clock, MessageSquare, Filter } from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  selectedSort: SortType;
  onSelectSort: (sort: SortType) => void;
  postCount: number;
}

const categories: { label: CategoryType; emoji: string }[] = [
  { label: '全部', emoji: '🌟' },
  { label: '閒聊', emoji: '☕' },
  { label: '告白', emoji: '💖' },
  { label: '抱怨', emoji: '😤' },
  { label: '課業', emoji: '📚' },
  { label: '心事', emoji: '🌙' },
  { label: '生活', emoji: '🍜' },
  { label: '求助', emoji: '🆘' },
  { label: '公告', emoji: '📌' },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  postCount
}) => {
  return (
    <div className="bg-[#141414] rounded-none p-3 sm:p-4 border border-[#222] shadow-[4px_4px_0px_#000] mb-6">
      
      {/* Top row: Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[#222] text-[#CBFF00] text-xs font-mono font-bold uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>分類</span>
        </div>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => onSelectCategory(cat.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#CBFF00] text-black border-[#CBFF00] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#0A0A0A] text-[#A0A0A0] border-[#222] hover:border-[#CBFF00] hover:text-[#CBFF00]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="my-2 border-t border-[#222]" />

      {/* Bottom row: Sort tabs & post count */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
        <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 border border-[#222]">
          <button
            onClick={() => onSelectSort('latest')}
            className={`flex items-center gap-1 px-3 py-1 font-bold transition-all ${
              selectedSort === 'latest'
                ? 'bg-[#CBFF00] text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>最新排序</span>
          </button>

          <button
            onClick={() => onSelectSort('hot')}
            className={`flex items-center gap-1 px-3 py-1 font-bold transition-all ${
              selectedSort === 'hot'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>熱門推薦</span>
          </button>

          <button
            onClick={() => onSelectSort('most_commented')}
            className={`flex items-center gap-1 px-3 py-1 font-bold transition-all ${
              selectedSort === 'most_commented'
                ? 'bg-amber-400 text-black shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>熱烈討論</span>
          </button>
        </div>

        <div className="text-neutral-500 font-mono text-[11px] sm:text-xs">
          TOTAL <span className="font-bold text-[#CBFF00]">{postCount}</span> POSTS
        </div>
      </div>

    </div>
  );
};
