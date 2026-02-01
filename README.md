# VietAdmin - Next.js Admin System

Hệ thống quản trị website full-stack với Next.js 16, Convex, và Experience-Based Configuration.

## Features

- ✅ Module system với dynamic enable/disable
- ✅ Experience Hub - Quản lý UX theo user journey
- ✅ Product Detail với 3 layout styles (Classic, Modern, Minimal)
- ✅ Wishlist, Cart, Checkout, Comments/Rating experiences
- ✅ Type-safe với TypeScript
- ✅ Real-time updates với Convex
- ✅ Dark mode support
- ✅ Mobile-first responsive

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Convex (real-time database + API)
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites
- Node.js 20+
- Bun (recommended) or npm

### Installation

\`\`\`bash
# Clone repo
git clone <repo-url>
cd system-vietadmin-nextjs

# Install dependencies
bun install

# Setup Convex
bunx convex dev

# Run dev server
bun run dev
\`\`\`

Visit:
- Site: http://localhost:3000
- Admin: http://localhost:3000/system

### Seed Data

\`\`\`bash
# Trong Convex dashboard, chạy mutations:
- seedSettingsModule
- seedProductsModule
- seedPostsModule
# ... (các modules khác)
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── (site)/              # Public site pages
│   │   ├── products/        # Product listing & detail
│   │   ├── posts/           # Blog posts
│   │   └── services/        # Services
│   ├── admin/               # Admin panel (legacy, migrating to /system)
│   └── system/              # System admin
│       ├── experiences/     # 🆕 Experience Hub
│       │   ├── product-detail/
│       │   ├── wishlist/
│       │   ├── cart/
│       │   ├── checkout/
│       │   └── comments-rating/
│       ├── modules/         # Module management
│       ├── data/            # Data manager
│       └── integrations/    # Analytics integrations
├── components/
│   ├── modules/shared/      # Shared module components
│   └── site/                # Site components
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema
│   ├── seed.ts              # Seed mutations
│   ├── products.ts          # Products API
│   ├── settings.ts          # Settings API
│   └── admin/               # Admin APIs
├── docs/
│   ├── MIGRATION_EXPERIENCE_CONFIG.md
│   └── ARCHITECTURE_EXPERIENCE_HUB.md
└── types/                   # TypeScript types
\`\`\`

## Experience Hub

Experience Hub là tính năng mới tổ chức config theo user journey:

### Trước (Module-centric):
- Settings rải rác trong từng module
- Khó tìm config cho 1 page cụ thể
- Duplicate toggles

### Sau (Experience-centric):
- Tất cả config cho 1 page tại 1 chỗ
- Dễ quan sát và quản lý
- Cross-module coordination

**Ví dụ**: Product Detail Experience gom:
- Layout style (Products module)
- Rating display (Comments module)
- Wishlist button (Wishlist module)
- Add-to-cart (Cart + Orders modules)

Chi tiết: [docs/ARCHITECTURE_EXPERIENCE_HUB.md](docs/ARCHITECTURE_EXPERIENCE_HUB.md)

## Development

### Lint & Format

\`\`\`bash
# Type-aware lint with oxlint
bunx oxlint --type-aware --type-check --fix

# ESLint (Next.js default)
bun run lint
\`\`\`

### Git Workflow

\`\`\`bash
# Luôn lint trước khi commit
bunx oxlint --type-aware --type-check --fix

# Commit
git add .
git commit -m "feat: your message"
\`\`\`

## Migration from Legacy Settings

Nếu đang có data cũ, xem: [docs/MIGRATION_EXPERIENCE_CONFIG.md](docs/MIGRATION_EXPERIENCE_CONFIG.md)

## Roadmap

### ✅ Completed (Phase 1-4)
- Experience Hub với 5 experiences
- Product Detail full integration
- Migration guides
- Architecture docs

### 🚧 Phase 5: Testing & Polish
- E2E testing
- Performance optimization
- Final review

### 🔮 Future (Phase 6+)
- Admin preview sync (split-screen)
- A/B testing integration
- User segmentation
- Multi-language support

## Contributing

1. Fork repo
2. Create feature branch
3. Commit changes (remember to lint!)
4. Push to branch
5. Create Pull Request

## License

Private project - All rights reserved.

## Support

Liên hệ: contact@vietadmin.com
