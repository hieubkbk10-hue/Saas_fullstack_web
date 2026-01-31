'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { FileText, Calendar, Eye, ArrowLeft, Share2, Clock, ChevronRight, Home, Check, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

type PostDetailStyle = 'classic' | 'modern' | 'minimal';

function usePostDetailStyle(): PostDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'posts_detail_style' });
  return (setting?.value as PostDetailStyle) || 'classic';
}

// Hook để lấy danh sách các fields đang bật cho posts module
function useEnabledPostFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'posts' });
  return useMemo(() => {
    if (!fields) return new Set<string>();
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = usePostDetailStyle();
  const enabledFields = useEnabledPostFields();
  const post = useQuery(api.posts.getBySlug, { slug });
  const category = useQuery(
    api.postCategories.getById, 
    post?.categoryId ? { id: post.categoryId } : 'skip'
  );
  const incrementViews = useMutation(api.posts.incrementViews);
  
  // Related posts - lấy cùng category
  const relatedPosts = useQuery(
    api.posts.listByCategory,
    post?.categoryId 
      ? { categoryId: post.categoryId, status: 'Published', paginationOpts: { numItems: 4, cursor: null } }
      : 'skip'
  );

  // Increment views on mount
  useEffect(() => {
    if (post?._id) {
      void incrementViews({ id: post._id });
    }
  }, [post?._id, incrementViews]);

  if (post === undefined) {
    return <PostDetailSkeleton />;
  }

  if (post === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="mx-auto mb-4 text-slate-300" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-slate-500 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: brandColor }}
          >
            <ArrowLeft size={18} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Filter out current post from related
  const filteredRelated = relatedPosts?.page.filter(p => p._id !== post._id).slice(0, 3) || [];

  const postData = {
    ...post,
    categoryName: category?.name || 'Tin tức',
  };

  return (
    <>
      {style === 'classic' && <ClassicStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} enabledFields={enabledFields} />}
      {style === 'modern' && <ModernStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} enabledFields={enabledFields} />}
      {style === 'minimal' && <MinimalStyle post={postData} brandColor={brandColor} relatedPosts={filteredRelated} enabledFields={enabledFields} />}
    </>
  );
}

interface PostData {
  _id: Id<"posts">;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  categoryId: Id<"postCategories">;
  categoryName: string;
  views: number;
  publishedAt?: number;
}

interface RelatedPost {
  _id: Id<"posts">;
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt?: string;
  publishedAt?: number;
}

interface StyleProps {
  post: PostData;
  brandColor: string;
  relatedPosts: RelatedPost[];
  enabledFields: Set<string>;
}

// Style 1: Classic - Truyền thống với sidebar
function ClassicStyle({ post, brandColor, relatedPosts }: StyleProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed top-0 left-0 h-1 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress * 100}%`, backgroundColor: brandColor }}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-muted-foreground">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only">Trang chủ</span>
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li>
              <Link href="/posts" className="hover:text-foreground transition-colors">Bài viết</Link>
            </li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-medium text-foreground truncate max-w-[150px] sm:max-w-xs">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <article className="lg:col-span-9 space-y-8">
            <header className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor, borderColor: `${brandColor}30` }}
                >
                  {post.categoryName}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} phút đọc</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{post.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </header>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/60 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              {post.thumbnail ? (
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="prose prose-zinc prose-lg max-w-none lg:max-w-[640px] dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div className="border-t pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <Link
                  href="/posts"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Tất cả bài viết
                </Link>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 w-full sm:w-auto min-w-[140px]"
                  style={{ backgroundColor: isCopied ? `${brandColor}15` : brandColor, color: isCopied ? brandColor : '#fff' }}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {isCopied ? 'Đã copy link' : 'Chia sẻ'}
                </button>
              </div>
            </div>
          </article>

          <aside className="lg:col-span-3 space-y-6">
            {relatedPosts.length > 0 && (
              <div className="h-fit sticky top-24 rounded-lg bg-muted/30">
                <div className="flex flex-col space-y-1.5 p-6 px-0 sm:px-6">
                  <h3 className="text-base font-semibold">Bài viết liên quan</h3>
                </div>
                <div className="p-6 pt-0 px-0 sm:px-6 gap-3 flex flex-col">
                  {relatedPosts.map((p) => (
                    <Link key={p._id} href={`/posts/${p.slug}`} className="group flex gap-3 items-start">
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted/60">
                        {p.thumbnail ? (
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:opacity-80 transition-colors">
                          {p.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

// Style 2: Modern - Medium/Substack inspired - Focus on typography and reading experience
function ModernStyle({ post, brandColor, relatedPosts, enabledFields }: StyleProps) {
  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));
  const showExcerpt = enabledFields.has('excerpt');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-12 font-sans selection:bg-accent/30">
      <main className="container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-8 md:space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
              <span className="sr-only">Trang chủ</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <Link href="/posts" className="hover:text-foreground transition-colors">
              Bài viết
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-md">
              {post.title}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Copy link"
          >
            {isCopied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
            {isCopied ? 'Đã copy' : 'Copy link'}
          </button>
        </div>

        <section className="max-w-4xl mx-auto text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center">
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-widest"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor, borderColor: `${brandColor}30` }}
            >
              {post.categoryName}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time className="font-medium">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
            </div>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{readingTime} phút đọc</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{post.views.toLocaleString()} lượt xem</span>
            </div>
          </div>
        </section>

        {post.thumbnail && (
          <section className="relative overflow-hidden rounded-2xl bg-muted aspect-[16/9] md:aspect-[21/9] max-w-6xl mx-auto">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-1000 hover:scale-105"
            />
          </section>
        )}

        <article className="max-w-4xl mx-auto space-y-5">
          {showExcerpt && post.excerpt && (
            <p
              className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-medium font-sans border-l-4 pl-5 py-1"
              style={{ borderColor: brandColor }}
            >
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-loose">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          <div className="pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span
                className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-normal"
                style={{ backgroundColor: `${brandColor}10`, color: brandColor, borderColor: `${brandColor}30` }}
              >
                {post.categoryName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-muted h-9 px-4 shrink-0"
            >
              <LinkIcon className="h-4 w-4" />
              {isCopied ? 'Đã copy' : 'Copy link bài viết'}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Link
              href="/posts"
              className="group font-semibold px-8 h-12 rounded-full shadow-lg transition-all hover:-translate-y-0.5 inline-flex items-center justify-center"
              style={{ backgroundColor: brandColor, color: '#fff' }}
            >
              Tất cả bài viết
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="pt-8 border-t">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Bài viết cùng chủ đề</h2>
                <Link href="/posts" className="text-muted-foreground hover:text-foreground">
                  Xem thêm
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {relatedPosts.map((p) => (
                  <Link key={p._id} href={`/posts/${p.slug}`} className="group overflow-hidden border-none shadow-none bg-transparent hover:bg-muted/30 transition-all duration-300 p-0 cursor-pointer rounded-xl">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3 relative">
                      {p.thumbnail ? (
                        <Image
                          src={p.thumbnail}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="font-semibold text-base md:text-lg text-foreground group-hover:opacity-80 transition-colors leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Style 3: Minimal - Tối giản, tập trung nội dung
function MinimalStyle({ post, brandColor, relatedPosts }: StyleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));

  const handleShare = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-accent/30 text-foreground pb-20">
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
          <Link
            href="/posts"
            className="group -ml-2 text-muted-foreground hover:text-foreground inline-flex items-center h-9 px-3"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Bài viết</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Chia sẻ"
            className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
          >
            {isCopied ? <Check className="w-5 h-5 text-muted-foreground" /> : <Share2 className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
      </nav>

      <main className="container max-w-7xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
        <header className="text-center mb-10 space-y-6 max-w-3xl mx-auto">
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-medium"
            style={{ backgroundColor: `${brandColor}15`, color: brandColor, borderColor: `${brandColor}30` }}
          >
            {post.categoryName}
          </span>

          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.1] tracking-tight text-foreground text-balance">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground/70" />
              <time>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</time>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground/70" />
              <span>{readingTime} phút đọc</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground/70" />
              <span>{post.views.toLocaleString()} lượt xem</span>
            </div>
          </div>
        </header>

        {post.thumbnail && (
          <figure className="relative w-full max-w-6xl mx-auto aspect-[21/9] mb-12 overflow-hidden rounded-2xl shadow-sm border bg-muted group">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </figure>
        )}

        <article className="prose prose-slate prose-lg md:prose-xl max-w-3xl mx-auto text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-img:rounded-xl">
          {post.excerpt && (
            <p
              className="lead text-xl md:text-2xl text-foreground/90 font-medium leading-relaxed mb-10 border-l-4 pl-6"
              style={{ borderColor: brandColor }}
            >
              {post.excerpt}
            </p>
          )}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className="h-24" />

        {relatedPosts.length > 0 && (
          <section className="border-t pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Bài viết liên quan</h2>
              <Link href="/posts" className="hidden sm:flex items-center gap-1 text-muted-foreground hover:opacity-80">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((p) => (
                <Link
                  key={p._id}
                  href={`/posts/${p.slug}`}
                  className="group border-none shadow-none bg-transparent hover:bg-muted/50 transition-colors p-0 overflow-hidden cursor-pointer rounded-xl"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted relative">
                    {p.thumbnail ? (
                      <Image
                        src={p.thumbnail}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('vi-VN') : ''}
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:opacity-80 transition-colors mb-2">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link
                href="/posts"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
              >
                Xem tất cả bài viết
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Skeleton Loading Component
function PostDetailSkeleton() {
  return (
    <div className="py-8 px-4 animate-pulse">
      <div className="max-w-3xl mx-auto">
        {/* Back link skeleton */}
        <div className="h-4 w-32 bg-slate-200 rounded mb-8" />
        
        {/* Header skeleton */}
        <div className="mb-10 text-center">
          <div className="h-3 w-20 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-10 w-3/4 bg-slate-200 rounded mx-auto mb-4" />
          <div className="h-4 w-48 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Featured Image skeleton */}
        <div className="aspect-[2/1] rounded-lg bg-slate-200 mb-10" />

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}
