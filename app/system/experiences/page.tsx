'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, CreditCard, FileText, Heart, LayoutTemplate, Mail, Menu, MessageSquare, Package, ShoppingCart, Ticket, User } from 'lucide-react';
import { Card, CardContent } from '@/app/admin/components/ui';
import { useI18n } from '../i18n/context';

const experiences = [
  {
    description: 'Layout, filters, search cho danh sách bài viết.',
    href: '/system/experiences/posts-list',
    icon: FileText,
    title: 'Danh sách bài viết',
  },
  {
    description: 'Layout, author info, comments cho chi tiết bài viết.',
    href: '/system/experiences/posts-detail',
    icon: FileText,
    title: 'Chi tiết bài viết',
  },
  {
    description: 'Layout, filters, search cho danh sách dịch vụ.',
    href: '/system/experiences/services-list',
    icon: Briefcase,
    title: 'Danh sách dịch vụ',
  },
  {
    description: 'Layout, author info, comments cho chi tiết dịch vụ.',
    href: '/system/experiences/services-detail',
    icon: Briefcase,
    title: 'Chi tiết dịch vụ',
  },
  {
    description: 'Layout, filters, search cho danh sách sản phẩm.',
    href: '/system/experiences/products-list',
    icon: Package,
    title: 'Danh sách sản phẩm',
  },
  {
    description: 'Layout, rating, wishlist, giỏ hàng cho chi tiết sản phẩm.',
    href: '/system/experiences/product-detail',
    icon: Package,
    title: 'Chi tiết sản phẩm',
  },
  {
    description: 'Style header, topbar, search, cart, wishlist, login.',
    href: '/system/experiences/menu',
    icon: Menu,
    title: 'Header Menu',
  },
  {
    description: 'Layout trang wishlist, nút wishlist, note và notification.',
    href: '/system/experiences/wishlist',
    icon: Heart,
    title: 'Sản phẩm yêu thích',
  },
  {
    description: 'Accordion đơn hàng, thống kê, tracking cho account.',
    href: '/system/experiences/account-orders',
    icon: Package,
    title: 'Đơn hàng (Account)',
  },
  {
    description: 'Profile, quick actions và thông tin liên hệ.',
    href: '/system/experiences/account-profile',
    icon: User,
    title: 'Tài khoản (Account)',
  },
  {
    description: 'Layout giỏ hàng (drawer/page), guest cart, expiry và note.',
    href: '/system/experiences/cart',
    icon: ShoppingCart,
    title: 'Giỏ hàng',
  },
  {
    description: 'Checkout flow, payment methods, shipping và order summary.',
    href: '/system/experiences/checkout',
    icon: CreditCard,
    title: 'Thanh toán & Đặt hàng',
  },
  {
    description: 'Rating display, sort order, likes, replies và moderation.',
    href: '/system/experiences/comments-rating',
    icon: MessageSquare,
    title: 'Bình luận & Đánh giá',
  },
  {
    description: 'Layout form liên hệ, map, contact info và social links.',
    href: '/system/experiences/contact',
    icon: Mail,
    title: 'Trang liên hệ',
  },
  {
    description: 'Danh sách voucher, chương trình khuyến mãi và countdown.',
    href: '/system/experiences/promotions-list',
    icon: Ticket,
    title: 'Khuyến mãi',
  },
];

export default function ExperiencesPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <LayoutTemplate className="text-cyan-600 dark:text-cyan-400" size={20} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.pages.experiences}</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cấu hình theo trải nghiệm người dùng, dễ quan sát và mở rộng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiences.map((exp) => {
          const Icon = exp.icon;
          return (
            <Link key={exp.href} href={exp.href} className="group">
              <Card className="border border-slate-200 dark:border-slate-800 hover:border-cyan-500/60 dark:hover:border-cyan-500/60 transition-colors">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exp.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
