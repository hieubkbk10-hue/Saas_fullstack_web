'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

export type ServiceSortOption = 'newest' | 'oldest' | 'popular' | 'title' | 'price_asc' | 'price_desc';

interface Category {
  _id: Id<"serviceCategories">;
  name: string;
  slug: string;
}

interface ServicesFilterProps {
  categories: Category[];
  selectedCategory: Id<"serviceCategories"> | null;
  onCategoryChange: (categoryId: Id<"serviceCategories"> | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: ServiceSortOption;
  onSortChange: (sort: ServiceSortOption) => void;
  totalResults: number;
  brandColor: string;
}

const SORT_OPTIONS: { value: ServiceSortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'popular', label: 'Xem nhiều' },
  { value: 'title', label: 'Theo tên A-Z' },
  { value: 'price_asc', label: 'Giá: Thấp đến cao' },
  { value: 'price_desc', label: 'Giá: Cao đến thấp' },
];

export function ServicesFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
  brandColor,
}: ServicesFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const clearFilters = useCallback(() => {
    setLocalSearch('');
    onSearchChange('');
    onCategoryChange(null);
    onSortChange('newest');
  }, [onSearchChange, onCategoryChange, onSortChange]);

  const hasActiveFilters = selectedCategory || searchQuery || sortBy !== 'newest';
  const selectedCategoryName = categories.find(c => c._id === selectedCategory)?.name;

  return (
    <div className="space-y-4">
      {/* Desktop Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Category Pills - Desktop */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={!selectedCategory ? { backgroundColor: brandColor } : undefined}
            >
              Tất cả
            </button>
            {categories.slice(0, 5).map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryChange(category._id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category._id
                    ? 'text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={selectedCategory === category._id ? { backgroundColor: brandColor } : undefined}
              >
                {category.name}
              </button>
            ))}
            {categories.length > 5 && (
              <div className="relative group">
                <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1">
                  +{categories.length - 5} <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {categories.slice(5).map((category) => (
                    <button
                      key={category._id}
                      onClick={() => onCategoryChange(category._id)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-slate-50 ${
                        selectedCategory === category._id ? 'font-medium' : ''
                      }`}
                      style={selectedCategory === category._id ? { color: brandColor } : undefined}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="hidden lg:block relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as ServiceSortOption)}
              className="appearance-none px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 cursor-pointer"
              style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: brandColor }}
              />
            )}
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 space-y-4">
            {/* Categories */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Danh mục
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCategoryChange(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  style={!selectedCategory ? { backgroundColor: brandColor } : undefined}
                >
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => onCategoryChange(category._id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category._id
                        ? 'text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    style={selectedCategory === category._id ? { backgroundColor: brandColor } : undefined}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ServiceSortOption)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Applied Filters & Results Count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Results count */}
          <span className="text-sm text-slate-500">
            {totalResults} dịch vụ
          </span>

          {/* Applied filters */}
          {selectedCategoryName && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              {selectedCategoryName}
              <button
                onClick={() => onCategoryChange(null)}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              &quot;{searchQuery}&quot;
              <button
                onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm hover:underline"
            style={{ color: brandColor }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
