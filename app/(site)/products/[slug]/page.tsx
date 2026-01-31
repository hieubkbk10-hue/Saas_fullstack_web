'use client';

import React, { use, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useBrandColor } from '@/components/site/hooks';
import { ArrowLeft, Package, ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Star, Minus, Plus, Check, ArrowRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

type ProductDetailStyle = 'classic' | 'modern' | 'minimal';

function useProductDetailStyle(): ProductDetailStyle {
  const setting = useQuery(api.settings.getByKey, { key: 'products_detail_style' });
  return (setting?.value as ProductDetailStyle) || 'classic';
}

function useEnabledProductFields(): Set<string> {
  const fields = useQuery(api.admin.modules.listEnabledModuleFields, { moduleKey: 'products' });
  return useMemo(() => {
    if (!fields) return new Set<string>();
    return new Set(fields.map(f => f.fieldKey));
  }, [fields]);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const brandColor = useBrandColor();
  const style = useProductDetailStyle();
  const enabledFields = useEnabledProductFields();
  
  const product = useQuery(api.products.getBySlug, { slug });
  const category = useQuery(
    api.productCategories.getById,
    product?.categoryId ? { id: product.categoryId } : 'skip'
  );
  
  const relatedProducts = useQuery(
    api.products.searchPublished,
    product?.categoryId ? { categoryId: product.categoryId, limit: 4 } : 'skip'
  );

  if (product === undefined) {
    return <ProductDetailSkeleton />;
  }

  if (product === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
            <Package size={32} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandColor }}
          >
            <ArrowLeft size={18} />
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelated = relatedProducts?.filter(p => p._id !== product._id).slice(0, 4) || [];
  const productData = { ...product, categoryName: category?.name || 'Sản phẩm', categorySlug: category?.slug };

  return (
    <>
      {style === 'classic' && <ClassicStyle product={productData} brandColor={brandColor} relatedProducts={filteredRelated} enabledFields={enabledFields} />}
      {style === 'modern' && <ModernStyle product={productData} brandColor={brandColor} relatedProducts={filteredRelated} enabledFields={enabledFields} />}
      {style === 'minimal' && <MinimalStyle product={productData} brandColor={brandColor} relatedProducts={filteredRelated} enabledFields={enabledFields} />}
    </>
  );
}

interface ProductData {
  _id: Id<"products">;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  description?: string;
  categoryId: Id<"productCategories">;
  categoryName: string;
  categorySlug?: string;
}

interface RelatedProduct {
  _id: Id<"products">;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image?: string;
}

interface StyleProps {
  product: ProductData;
  brandColor: string;
  relatedProducts: RelatedProduct[];
  enabledFields: Set<string>;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// ====================================================================================
// STYLE 1: CLASSIC - Standard e-commerce product page
// ====================================================================================
function ClassicStyle({ product, brandColor, relatedProducts, enabledFields }: StyleProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');
  const showSku = enabledFields.has('sku');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const discountPercent = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const inStock = !showStock || product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-slate-900 transition-colors">Sản phẩm</Link>
            <ChevronRight size={14} />
            {product.categorySlug && (
              <>
                <Link href={`/products?category=${product.categorySlug}`} className="hover:text-slate-900 transition-colors">{product.categoryName}</Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Product Images */}
          <div className="mb-8 lg:mb-0">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 relative">
              {images.length > 0 ? (
                <Image src={images[selectedImage]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={64} className="text-slate-300" /></div>
              )}
              {showSalePrice && product.salePrice && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg">-{discountPercent}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-orange-500' : 'border-slate-200 hover:border-slate-300'}`}>
                    <Image src={img} alt="" width={80} height={80} className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Link href={`/products?category=${product.categorySlug}`} className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 transition-colors hover:opacity-80" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
              {product.categoryName}
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {showSku && <span className="text-sm text-slate-500">SKU: <span className="font-mono">{product.sku}</span></span>}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={16} className="fill-amber-400 text-amber-400" />))}
                <span className="text-sm text-slate-500 ml-1">(12 đánh giá)</span>
              </div>
            </div>

            {showPrice && (
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                {showSalePrice && product.salePrice && (
                  <>
                    <span className="text-xl text-slate-400 line-through">{formatPrice(product.price)}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-medium rounded">Tiết kiệm {formatPrice(product.price - product.salePrice)}</span>
                  </>
                )}
              </div>
            )}

            {showStock && (
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 10 ? (
                  <><Check size={18} className="text-green-500" /><span className="text-green-600 font-medium">Còn hàng</span></>
                ) : product.stock > 0 ? (
                  <><span className="w-2 h-2 bg-orange-500 rounded-full" /><span className="text-orange-600 font-medium">Chỉ còn {product.stock} sản phẩm</span></>
                ) : (
                  <><span className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-600 font-medium">Hết hàng</span></>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-slate-50 transition-colors" disabled={quantity <= 1}>
                  <Minus size={18} className={quantity <= 1 ? 'text-slate-300' : 'text-slate-600'} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(showStock ? product.stock : 99, q + 1))} className="p-3 hover:bg-slate-50 transition-colors" disabled={showStock && quantity >= product.stock}>
                  <Plus size={18} className={showStock && quantity >= product.stock ? 'text-slate-300' : 'text-slate-600'} />
                </button>
              </div>

              <button className={`flex-1 py-3.5 px-8 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${inStock ? 'hover:shadow-lg hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'}`} style={{ backgroundColor: brandColor }} disabled={!inStock}>
                <ShoppingCart size={20} />
                {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>

              <button className="p-3.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors group">
                <Heart size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              </button>
              <button className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <Share2 size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl mb-8">
              <div className="text-center"><Truck size={24} className="mx-auto mb-2 text-slate-600" /><p className="text-xs text-slate-600">Giao hàng nhanh</p></div>
              <div className="text-center"><Shield size={24} className="mx-auto mb-2 text-slate-600" /><p className="text-xs text-slate-600">Bảo hành chính hãng</p></div>
              <div className="text-center"><RotateCcw size={24} className="mx-auto mb-2 text-slate-600" /><p className="text-xs text-slate-600">Đổi trả 30 ngày</p></div>
            </div>

            {showDescription && product.description && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-slate prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
          </div>
        </div>

        <RelatedProductsSection products={relatedProducts} categorySlug={product.categorySlug} brandColor={brandColor} showPrice={enabledFields.has('price') || enabledFields.size === 0} showSalePrice={enabledFields.has('salePrice')} />

        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: brandColor }}>
            <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}

// ====================================================================================
// STYLE 2: MODERN - Landing page style with hero
// ====================================================================================
function ModernStyle({ product, brandColor, relatedProducts, enabledFields }: StyleProps) {
  const [quantity, setQuantity] = useState(1);

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const discountPercent = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const inStock = !showStock || product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: `${brandColor}08` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${brandColor}20 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${brandColor}15 0%, transparent 50%)` }} />
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <Link href={`/products?category=${product.categorySlug}`} className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-sm text-sm font-medium rounded-full shadow-sm mb-6" style={{ color: brandColor }}>
              {product.categoryName}
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">{product.name}</h1>

            {showPrice && (
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="text-4xl font-bold" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
                {showSalePrice && product.salePrice && (
                  <>
                    <span className="text-xl text-slate-400 line-through">{formatPrice(product.price)}</span>
                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">-{discountPercent}%</span>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-full bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-slate-50 transition-colors rounded-l-full">
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:bg-slate-50 transition-colors rounded-r-full">
                  <Plus size={18} />
                </button>
              </div>

              <button className={`px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center gap-2 transition-all ${inStock ? 'hover:shadow-xl hover:scale-105' : 'opacity-50 cursor-not-allowed'}`} style={{ backgroundColor: brandColor }} disabled={!inStock}>
                <ShoppingCart size={20} />
                {inStock ? 'Mua ngay' : 'Hết hàng'}
              </button>
            </div>

            {showStock && (
              <div className="flex items-center gap-2 mt-6">
                {product.stock > 10 ? (
                  <><Check size={18} className="text-green-500" /><span className="text-green-600">Còn hàng</span></>
                ) : product.stock > 0 ? (
                  <><span className="w-2 h-2 bg-orange-500 rounded-full" /><span className="text-orange-600">Chỉ còn {product.stock} sản phẩm</span></>
                ) : (
                  <><span className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-600">Hết hàng</span></>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Image */}
      {images.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/10]">
            <Image src={images[0]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      {showDescription && product.description && (
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Mô tả sản phẩm</h2>
          <div className="prose prose-lg prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      )}

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="p-8 rounded-3xl text-center" style={{ backgroundColor: `${brandColor}08` }}>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Sẵn sàng sở hữu?</h3>
          <p className="text-slate-600 mb-6">Đặt hàng ngay để nhận ưu đãi đặc biệt.</p>
          <button className="px-8 py-4 rounded-full text-white font-semibold transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto" style={{ backgroundColor: brandColor }}>
            Thêm vào giỏ hàng <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Related */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <RelatedProductsSection products={relatedProducts} categorySlug={product.categorySlug} brandColor={brandColor} showPrice={showPrice} showSalePrice={showSalePrice} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-slate-100">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: brandColor }}>
          <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    </div>
  );
}

// ====================================================================================
// STYLE 3: MINIMAL - Clean, focused design
// ====================================================================================
function MinimalStyle({ product, brandColor, relatedProducts, enabledFields }: StyleProps) {
  const [quantity, setQuantity] = useState(1);

  const showPrice = enabledFields.has('price') || enabledFields.size === 0;
  const showSalePrice = enabledFields.has('salePrice');
  const showStock = enabledFields.has('stock');
  const showDescription = enabledFields.has('description');

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const inStock = !showStock || product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        {/* Back */}
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-12 transition-colors">
          <ArrowLeft size={16} /> Tất cả sản phẩm
        </Link>

        {/* Header */}
        <header className="text-center mb-12">
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: brandColor }}>{product.categoryName}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-6">{product.name}</h1>
          
          {showPrice && (
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold" style={{ color: brandColor }}>{formatPrice(product.salePrice ?? product.price)}</span>
              {showSalePrice && product.salePrice && (
                <span className="text-xl text-slate-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
          )}
        </header>

        {/* Image */}
        {images.length > 0 && (
          <figure className="mb-12">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 max-w-md mx-auto">
              <Image src={images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
            </div>
          </figure>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="flex items-center border border-slate-200 rounded-full">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-slate-50 transition-colors rounded-l-full">
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:bg-slate-50 transition-colors rounded-r-full">
              <Plus size={18} />
            </button>
          </div>

          <button className={`px-12 py-4 rounded-full text-white font-semibold transition-all ${inStock ? 'hover:shadow-lg hover:scale-105' : 'opacity-50 cursor-not-allowed'}`} style={{ backgroundColor: brandColor }} disabled={!inStock}>
            {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>

          {showStock && product.stock <= 10 && product.stock > 0 && (
            <p className="text-sm text-orange-600">Chỉ còn {product.stock} sản phẩm</p>
          )}
        </div>

        {/* Description */}
        {showDescription && product.description && (
          <div className="prose prose-slate max-w-none text-center" dangerouslySetInnerHTML={{ __html: product.description }} />
        )}

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-100">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-8 text-center">Có thể bạn quan tâm</h3>
            <div className="space-y-1">
              {relatedProducts.map((p, index) => (
                <Link key={p._id} href={`/products/${p.slug}`} className="group flex items-center justify-between py-4 border-b border-slate-100 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300 font-mono">{String(index + 1).padStart(2, '0')}</span>
                    <h4 className="font-medium text-slate-900 group-hover:opacity-70 transition-opacity">{p.name}</h4>
                  </div>
                  {showPrice && (
                    <span className="text-sm font-semibold" style={{ color: brandColor }}>{formatPrice(p.salePrice ?? p.price)}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

// Shared Related Products Section
function RelatedProductsSection({ products, categorySlug, brandColor, showPrice, showSalePrice }: { products: RelatedProduct[]; categorySlug?: string; brandColor: string; showPrice: boolean; showSalePrice: boolean }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Sản phẩm liên quan</h2>
        {categorySlug && (
          <Link href={`/products?category=${categorySlug}`} className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: brandColor }}>
            Xem tất cả <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <Link key={p._id} href={`/products/${p.slug}`} className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
            <div className="aspect-square overflow-hidden bg-slate-100 relative">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-300" /></div>
              )}
              {showSalePrice && p.salePrice && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">-{Math.round((1 - p.salePrice / p.price) * 100)}%</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2 text-sm">{p.name}</h3>
              {showPrice && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: brandColor }}>{formatPrice(p.salePrice ?? p.price)}</span>
                  {showSalePrice && p.salePrice && <span className="text-xs text-slate-400 line-through">{formatPrice(p.price)}</span>}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3"><div className="h-4 w-64 bg-slate-200 rounded" /></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="aspect-square bg-slate-200 rounded-2xl mb-4" />
            <div className="flex gap-3">{[1, 2, 3, 4].map((i) => (<div key={i} className="w-20 h-20 bg-slate-200 rounded-lg" />))}</div>
          </div>
          <div className="mt-8 lg:mt-0 space-y-4">
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            <div className="h-10 w-full bg-slate-200 rounded" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-10 w-40 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-200 rounded-xl" />
            <div className="h-32 w-full bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
