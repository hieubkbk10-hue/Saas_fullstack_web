import React from 'react';

type ListLayoutStyle = 'grid' | 'list' | 'masonry';
type FilterPosition = 'sidebar' | 'top' | 'none';

type PostsListPreviewProps = {
  layoutStyle: ListLayoutStyle;
  filterPosition: FilterPosition;
  showPagination: boolean;
  showSearch: boolean;
  showCategories: boolean;
};

export function PostsListPreview({
  layoutStyle,
  filterPosition,
  showPagination,
  showSearch,
  showCategories,
}: PostsListPreviewProps) {
  const PostCard = () => (
    <div className="border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
      <div className="bg-slate-200 dark:bg-slate-700 rounded aspect-video" />
      <div className="bg-slate-200 dark:bg-slate-700 rounded h-2 w-3/4" />
      <div className="bg-slate-200 dark:bg-slate-700 rounded h-1 w-1/2" />
      {showCategories && (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded px-1 py-0.5 text-xs w-fit">
          Category
        </div>
      )}
    </div>
  );

  const FilterPanel = () => (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
      {showSearch && (
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 text-xs"
          disabled
        />
      )}
      {showCategories && (
        <div className="space-y-0.5">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Categories</div>
          {['Tech', 'News', 'Blog'].map(cat => (
            <div key={cat} className="flex items-center gap-1">
              <input type="checkbox" className="w-2 h-2" disabled />
              <span className="text-xs text-slate-600 dark:text-slate-400">{cat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-2">
        <div className="font-medium text-blue-700 dark:text-blue-400">
          Layout: {layoutStyle} | Filter: {filterPosition}
        </div>
      </div>

      {filterPosition === 'top' && <FilterPanel />}

      <div className="flex gap-2">
        {filterPosition === 'sidebar' && (
          <div className="w-1/3">
            <FilterPanel />
          </div>
        )}
        
        <div className={filterPosition === 'sidebar' ? 'flex-1' : 'w-full'}>
          {layoutStyle === 'grid' && (
            <div className="grid grid-cols-2 gap-2">
              <PostCard />
              <PostCard />
            </div>
          )}

          {layoutStyle === 'list' && (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="border border-slate-200 dark:border-slate-700 rounded p-2 flex gap-2">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded w-16 h-16" />
                  <div className="flex-1 space-y-1">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded h-2" />
                    <div className="bg-slate-200 dark:bg-slate-700 rounded h-1 w-2/3" />
                    {showCategories && (
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded px-1 py-0.5 text-xs w-fit">
                        Tech
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {layoutStyle === 'masonry' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <PostCard />
                <div className="border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded h-12" />
                  <div className="bg-slate-200 dark:bg-slate-700 rounded h-2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="border border-slate-200 dark:border-slate-700 rounded p-2 space-y-1">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded h-16" />
                  <div className="bg-slate-200 dark:bg-slate-700 rounded h-2" />
                </div>
                <PostCard />
              </div>
            </div>
          )}

          {showPagination && (
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3].map(page => (
                <div 
                  key={page}
                  className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                    page === 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {page}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductsListPreview(props: PostsListPreviewProps) {
  return <PostsListPreview {...props} />;
}

export function ServicesListPreview(props: PostsListPreviewProps) {
  return <PostsListPreview {...props} />;
}
