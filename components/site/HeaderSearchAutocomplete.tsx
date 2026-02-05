'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Briefcase, FileText, Package, Search } from 'lucide-react';
import { api } from '@/convex/_generated/api';

type SuggestionItem = {
  id: string;
  title: string;
  thumbnail?: string | null;
  type: 'post' | 'product' | 'service';
  url: string;
};

type AutocompleteResult = {
  posts: SuggestionItem[];
  products: SuggestionItem[];
  services: SuggestionItem[];
};

export type HeaderSearchAutocompleteProps = {
  placeholder?: string;
  brandColor: string;
  searchProducts: boolean;
  searchPosts: boolean;
  searchServices: boolean;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  showButton?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function HeaderSearchAutocomplete({
  placeholder,
  brandColor,
  searchProducts,
  searchPosts,
  searchServices,
  className,
  inputClassName,
  buttonClassName,
  showButton = true,
  disabled = false,
  autoFocus = false,
}: HeaderSearchAutocompleteProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus();
    }
  }, [autoFocus, disabled]);

  const canSearch = searchProducts || searchPosts || searchServices;
  const shouldSearch = !disabled && debouncedQuery.length >= 1 && canSearch;

  const results = useQuery(api.search.autocomplete, shouldSearch
    ? {
      query: debouncedQuery,
      searchPosts,
      searchProducts,
      searchServices,
      limit: 5,
    }
    : 'skip');

  const isLoading = shouldSearch && results === undefined;
  const data = results as AutocompleteResult | undefined;

  const sections = useMemo(() => ([
    { key: 'products', label: 'Sản phẩm', icon: Package, items: data?.products ?? [] },
    { key: 'posts', label: 'Bài viết', icon: FileText, items: data?.posts ?? [] },
    { key: 'services', label: 'Dịch vụ', icon: Briefcase, items: data?.services ?? [] },
  ]), [data?.posts, data?.products, data?.services]);

  const hasResults = sections.some(section => section.items.length > 0);
  const showDropdown = isOpen && shouldSearch && !disabled;

  const handleSubmit = () => {
    const value = query.trim();
    if (!value) {
      return;
    }
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleSelect = (item: SuggestionItem) => {
    setIsOpen(false);
    router.push(item.url);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onFocus={() => { if (!disabled && query.trim()) { setIsOpen(true); } }}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          if (!disabled) {
            setIsOpen(Boolean(value.trim()));
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder ?? 'Tìm kiếm...'}
        disabled={disabled}
        className={cn('w-full', inputClassName)}
      />
      {showButton && (
        <button
          type="button"
          onClick={handleSubmit}
          className={buttonClassName}
          style={{ backgroundColor: brandColor }}
        >
          <Search size={14} />
        </button>
      )}
      {showDropdown && (
        <div className="absolute right-0 mt-2 min-w-[320px] rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-slate-500">Đang tìm kiếm...</div>
          )}
          {!isLoading && !hasResults && (
            <div className="px-4 py-3 text-sm text-slate-500">Không có kết quả phù hợp.</div>
          )}
          {!isLoading && hasResults && (
            <div className="py-2">
              {sections.map((section) => (
                section.items.length > 0 ? (
                  <div key={section.key} className="pb-2 last:pb-0">
                    <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {section.label}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = section.icon;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => { handleSelect(item); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50"
                          >
                            <div className="relative w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                              {item.thumbnail ? (
                                <Image src={item.thumbnail} alt={item.title} width={36} height={36} className="h-full w-full object-cover" />
                              ) : (
                                <Icon size={16} className="text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
