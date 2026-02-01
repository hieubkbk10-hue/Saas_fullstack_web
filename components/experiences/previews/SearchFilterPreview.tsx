import React from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';

type SearchLayoutStyle = 'search-only' | 'with-filters' | 'advanced';
type ResultsDisplayStyle = 'grid' | 'list';

type SearchFilterPreviewProps = {
  layoutStyle: SearchLayoutStyle;
  resultsDisplayStyle: ResultsDisplayStyle;
  showFilters: boolean;
  showSorting: boolean;
  showResultCount: boolean;
};

export function SearchFilterPreview({
  layoutStyle,
  resultsDisplayStyle,
  showFilters,
  showSorting,
  showResultCount,
}: SearchFilterPreviewProps) {
  const SearchBar = () => (
    <div className="flex gap-1">
      <div className="flex-1 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5">
        <Search size={10} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm..." 
          className="flex-1 bg-transparent text-xs outline-none"
          disabled
        />
      </div>
      <button className="bg-teal-500 text-white rounded px-2 py-0.5 text-xs">
        Tìm
      </button>
    </div>
  );

  const FilterPanel = () => (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
      <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
        <Filter size={10} />
        <span>Filters</span>
      </div>
      <div className="space-y-0.5">
        <div className="text-xs text-slate-600 dark:text-slate-400">Price</div>
        <div className="flex gap-1">
          <input type="text" placeholder="Min" className="w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs" disabled />
          <input type="text" placeholder="Max" className="w-1/2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs" disabled />
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="text-xs text-slate-600 dark:text-slate-400">Category</div>
        {['All', 'Tech', 'News'].map(cat => (
          <div key={cat} className="flex items-center gap-1">
            <input type="checkbox" className="w-2 h-2" disabled />
            <span className="text-xs text-slate-600 dark:text-slate-400">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ResultsHeader = () => (
    <div className="flex items-center justify-between">
      {showResultCount && (
        <div className="text-slate-600 dark:text-slate-400">
          Tìm thấy 15 kết quả
        </div>
      )}
      {showSorting && (
        <div className="flex items-center gap-1">
          <SlidersHorizontal size={10} className="text-slate-400" />
          <select className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs" disabled>
            <option>Mới nhất</option>
            <option>Giá thấp</option>
          </select>
        </div>
      )}
    </div>
  );

  const ResultItem = () => (
    <div className="border border-slate-200 dark:border-slate-700 rounded p-2">
      <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-video mb-1" />
      <div className="bg-slate-200 dark:bg-slate-700 rounded h-2 w-3/4" />
    </div>
  );

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded p-2">
        <div className="font-medium text-teal-700 dark:text-teal-400">
          Layout: {layoutStyle} | Results: {resultsDisplayStyle}
        </div>
      </div>

      {layoutStyle === 'search-only' && (
        <div className="space-y-2">
          <SearchBar />
          <ResultsHeader />
          <div className={resultsDisplayStyle === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            <ResultItem />
            <ResultItem />
          </div>
        </div>
      )}

      {layoutStyle === 'with-filters' && (
        <div className="space-y-2">
          <SearchBar />
          <div className="flex gap-2">
            {showFilters && (
              <div className="w-1/3">
                <FilterPanel />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <ResultsHeader />
              <div className={resultsDisplayStyle === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                <ResultItem />
                <ResultItem />
              </div>
            </div>
          </div>
        </div>
      )}

      {layoutStyle === 'advanced' && (
        <div className="space-y-2">
          <SearchBar />
          {showFilters && (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1">
              <div className="flex gap-1 flex-wrap">
                <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded px-1 py-0.5">
                  Category: Tech
                </span>
                <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded px-1 py-0.5">
                  Price: 100k-500k
                </span>
              </div>
            </div>
          )}
          <ResultsHeader />
          <div className={resultsDisplayStyle === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            <ResultItem />
            <ResultItem />
          </div>
        </div>
      )}
    </div>
  );
}
