import { Post, Product, Order, Customer, User, Role, Category, Comment, ImageFile, Menu, MenuItem, HomeComponent } from './types';

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
  id: `POST-${1000 + i}`,
  title: [
    "Cách làm cà phê muối ngon chuẩn vị Huế",
    "Review chi tiết iPhone 15 Pro Max sau 3 tháng",
    "Kinh nghiệm du lịch Đà Lạt tự túc 3 ngày 2 đêm",
    "Top 10 quán ăn ngon rẻ tại Sài Gòn",
    "Hướng dẫn học ReactJS cơ bản cho người mới",
    "Xu hướng thời trang mùa hè 2024",
    "Làm sao để tiết kiệm tiền hiệu quả?",
    "Những cuốn sách hay nên đọc một lần trong đời",
    "Bí quyết chăm sóc da mụn tại nhà",
    "So sánh MacBook Air M2 và M3"
  ][i],
  category: ["Ẩm thực", "Công nghệ", "Du lịch", "Ẩm thực", "Công nghệ", "Thời trang", "Tài chính", "Giáo dục", "Sức khỏe", "Công nghệ"][i],
  author: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"][randomInt(0, 2)],
  status: ["Published", "Published", "Draft", "Published", "Archived", "Published", "Published", "Draft", "Published", "Published"][i] as Post['status'],
  views: randomInt(100, 5000),
  created: randomDate(new Date(2023, 0, 1), new Date()),
  thumbnail: `https://picsum.photos/300/200?random=${i}`,
}));

export const mockProducts: Product[] = Array.from({ length: 15 }, (_, i) => {
  const price = randomInt(100, 5000) * 1000;
  return {
    id: `PROD-${2000 + i}`,
    name: [
      "Áo thun Local Brand X",
      "Giày Sneaker Basic White",
      "Kem dưỡng ẩm Vitamin C",
      "Bàn phím cơ Keychron K2",
      "Chuột Logitech MX Master 3",
      "Tai nghe Sony WH-1000XM5",
      "Balo chống nước cao cấp",
      "Đồng hồ thông minh Watch S1",
      "Sạc dự phòng 20000mAh",
      "Cáp sạc nhanh Type-C",
      "Quần Jean Slim Fit",
      "Áo khoác Bomber Nam",
      "Váy hoa nhí Vintage",
      "Son môi Matte Lipstick",
      "Nước hoa nam Bleu"
    ][i],
    sku: `SKU-${randomInt(10000, 99999)}`,
    category: ["Thời trang", "Giày dép", "Mỹ phẩm", "Công nghệ", "Công nghệ", "Công nghệ", "Phụ kiện", "Công nghệ", "Phụ kiện", "Phụ kiện", "Thời trang", "Thời trang", "Thời trang", "Mỹ phẩm", "Mỹ phẩm"][i],
    price: price,
    salePrice: randomInt(0, 1) ? price * 0.9 : undefined,
    stock: randomInt(0, 100),
    status: randomInt(0, 10) > 2 ? "Active" : (randomInt(0, 1) ? "Draft" : "Archived"),
    image: `https://picsum.photos/200/200?random=${i + 20}`,
    sales: randomInt(0, 500),
    description: "Mô tả chi tiết sản phẩm đang được cập nhật...",
  }
});

export const mockCustomers: Customer[] = Array.from({ length: 10 }, (_, i) => ({
  id: `CUS-${3000 + i}`,
  name: ["Phạm Minh Tuấn", "Ngô Lan Hương", "Đặng Văn Hùng", "Vũ Thị Mai", "Hoàng Quốc Bảo", "Đỗ Thu Hà", "Lý Gia Hân", "Bùi Tiến Dũng", "Trương Mỹ Lan", "Dương Quá"][i],
  email: `customer${i}@example.com`,
  phone: `09${randomInt(10000000, 99999999)}`,
  ordersCount: randomInt(1, 20),
  totalSpent: randomInt(500, 50000) * 1000,
  status: randomInt(0, 10) > 1 ? "Active" : "Inactive",
  avatar: `https://picsum.photos/100/100?random=${i + 50}`,
  joined: randomDate(new Date(2023, 0, 1), new Date()),
  address: `${randomInt(1, 999)} Nguyễn Trãi`,
  city: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"][randomInt(0, 2)],
  notes: "Khách hàng VIP, thường mua số lượng lớn."
}));

export const mockRoles: Role[] = [
  { 
    id: 'ROLE-ADMIN', 
    name: 'Administrator', 
    description: 'Quyền cao nhất, có thể truy cập mọi tính năng', 
    usersCount: 1, 
    isSystem: true,
    permissions: {
      'posts': ['view', 'create', 'edit', 'delete'],
      'products': ['view', 'create', 'edit', 'delete'],
      'orders': ['view', 'create', 'edit', 'delete'],
      'users': ['view', 'create', 'edit', 'delete'],
      'settings': ['view', 'edit']
    }
  },
  { 
    id: 'ROLE-EDITOR', 
    name: 'Editor', 
    description: 'Quản lý nội dung và sản phẩm, không thể truy cập cấu hình hệ thống', 
    usersCount: 2, 
    isSystem: false,
    permissions: {
      'posts': ['view', 'create', 'edit', 'delete'],
      'products': ['view', 'create', 'edit'],
      'orders': ['view', 'edit'],
      'users': ['view'],
      'settings': []
    }
  },
  { 
    id: 'ROLE-AUTHOR', 
    name: 'Author', 
    description: 'Chỉ có thể viết bài và xem sản phẩm', 
    usersCount: 2, 
    isSystem: false,
    permissions: {
      'posts': ['view', 'create', 'edit'],
      'products': ['view'],
      'orders': [],
      'users': [],
      'settings': []
    }
  },
  { 
    id: 'ROLE-SUPPORT', 
    name: 'Customer Support', 
    description: 'Hỗ trợ khách hàng, xem đơn hàng và phản hồi', 
    usersCount: 0, 
    isSystem: false,
    permissions: {
      'posts': ['view'],
      'products': ['view'],
      'orders': ['view', 'edit'],
      'users': ['view'],
      'settings': []
    }
  }
];

export const mockUsers: User[] = [
  { id: 'U1', name: 'Admin User', email: 'admin@vietadmin.com', phone: '0901234567', role: 'Administrator', roleId: 'ROLE-ADMIN', status: 'Active', lastLogin: '2 phút trước', avatar: 'https://picsum.photos/100/100?random=90', created: '2023-01-01T00:00:00Z' },
  { id: 'U2', name: 'Nguyễn Thị Chi', email: 'chi@vietadmin.com', phone: '0909876543', role: 'Editor', roleId: 'ROLE-EDITOR', status: 'Active', lastLogin: '1 giờ trước', avatar: 'https://picsum.photos/100/100?random=91', created: '2023-02-15T00:00:00Z' },
  { id: 'U3', name: 'Trần Văn Nam', email: 'nam@vietadmin.com', phone: '0912345678', role: 'Author', roleId: 'ROLE-AUTHOR', status: 'Active', lastLogin: '2 ngày trước', avatar: 'https://picsum.photos/100/100?random=92', created: '2023-03-20T00:00:00Z' },
  { id: 'U4', name: 'Lê Tuyết Mai', email: 'mai@vietadmin.com', phone: '0987654321', role: 'Author', roleId: 'ROLE-AUTHOR', status: 'Inactive', lastLogin: '1 tháng trước', avatar: 'https://picsum.photos/100/100?random=93', created: '2023-04-10T00:00:00Z' },
  { id: 'U5', name: 'Phạm Hùng', email: 'hung@vietadmin.com', phone: '0956789012', role: 'Editor', roleId: 'ROLE-EDITOR', status: 'Active', lastLogin: '5 giờ trước', avatar: 'https://picsum.photos/100/100?random=94', created: '2023-05-05T00:00:00Z' },
];

export const mockOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
  const cus = mockCustomers[randomInt(0, 9)];
  return {
    id: `ORD-${5000 + i}`,
    customer: cus.name,
    customerId: cus.id,
    total: randomInt(100, 2000) * 1000,
    status: ["Pending", "Processing", "Completed", "Cancelled", "Completed"][randomInt(0, 4)] as Order['status'],
    date: randomDate(new Date(2024, 0, 1), new Date()),
    itemsCount: randomInt(1, 5),
  }
});

export const mockComments: Comment[] = Array.from({ length: 20 }, (_, i) => ({
  id: `CMT-${6000 + i}`,
  content: ["Bài viết rất hay!", "Sản phẩm tốt, giao hàng nhanh.", "Cần tư vấn thêm.", "Giá hơi cao so với mặt bằng chung.", "Tuyệt vời!", "Chất lượng không như quảng cáo.", "Admin rep inbox nhé.", "Hữu ích.", "Thanks for sharing.", "Đã đặt hàng."][randomInt(0, 9)],
  author: mockCustomers[randomInt(0, 9)].name,
  target: randomInt(0, 1) ? mockPosts[randomInt(0, 9)].title : mockProducts[randomInt(0, 14)].name,
  status: ["Pending", "Approved", "Approved", "Spam"][randomInt(0, 3)] as Comment['status'],
  created: randomDate(new Date(2024, 2, 1), new Date()),
}));

export const mockImages: ImageFile[] = Array.from({ length: 30 }, (_, i) => ({
  id: `IMG-${7000 + i}`,
  url: `https://picsum.photos/300/300?random=${i + 100}`,
  filename: `image_upload_${i}.jpg`,
  size: `${randomInt(100, 5000)} KB`,
  dimensions: "1920x1080",
  uploaded: randomDate(new Date(2024, 0, 1), new Date()),
}));

export const mockCategories: Category[] = [
  { id: 'CAT-1', name: 'Điện thoại', slug: 'dien-thoai', count: 120 },
  { id: 'CAT-2', name: 'Laptop', slug: 'laptop', count: 85 },
  { id: 'CAT-3', name: 'Phụ kiện', slug: 'phu-kien', count: 230 },
  { id: 'CAT-4', name: 'Thời trang nam', slug: 'thoi-trang-nam', count: 45 },
  { id: 'CAT-5', name: 'Thời trang nữ', slug: 'thoi-trang-nu', count: 67 },
  { id: 'CAT-6', name: 'Đồng hồ', slug: 'dong-ho', count: 12 },
];

export const mockPostCategories: Category[] = [
  { id: 'PCAT-1', name: 'Công nghệ', slug: 'cong-nghe', count: 45 },
  { id: 'PCAT-2', name: 'Ẩm thực', slug: 'am-thuc', count: 32 },
  { id: 'PCAT-3', name: 'Du lịch', slug: 'du-lich', count: 28 },
  { id: 'PCAT-4', name: 'Giáo dục', slug: 'giao-duc', count: 15 },
  { id: 'PCAT-5', name: 'Sức khỏe', slug: 'suc-khoe', count: 19 },
  { id: 'PCAT-6', name: 'Tài chính', slug: 'tai-chinh', count: 10 },
];

export const mockMenus: Menu[] = [
  { id: 'M1', name: 'Header Menu', location: 'Header', itemsCount: 6 },
  { id: 'M2', name: 'Footer About', location: 'Footer Col 1', itemsCount: 4 },
  { id: 'M3', name: 'Footer Policy', location: 'Footer Col 2', itemsCount: 3 },
];

export const mockMenuItems: MenuItem[] = [
  { id: 'MI1', menuId: 'M1', label: 'Trang chủ', url: '/', order: 1, depth: 0 },
  { id: 'MI2', menuId: 'M1', label: 'Sản phẩm', url: '/products', order: 2, depth: 0 },
  { id: 'MI3', menuId: 'M1', label: 'Điện thoại', url: '/products/dien-thoai', order: 3, depth: 1 },
  { id: 'MI4', menuId: 'M1', label: 'Laptop', url: '/products/laptop', order: 4, depth: 1 },
  { id: 'MI5', menuId: 'M1', label: 'Bài viết', url: '/blog', order: 5, depth: 0 },
  { id: 'MI6', menuId: 'M1', label: 'Liên hệ', url: '/contact', order: 6, depth: 0 },
  { id: 'MI7', menuId: 'M2', label: 'Về chúng tôi', url: '/about', order: 1, depth: 0 },
  { id: 'MI8', menuId: 'M2', label: 'Tuyển dụng', url: '/careers', order: 2, depth: 0 },
  { id: 'MI9', menuId: 'M2', label: 'Hệ thống cửa hàng', url: '/stores', order: 3, depth: 0 },
  { id: 'MI10', menuId: 'M2', label: 'Liên hệ', url: '/contact', order: 4, depth: 0 },
  { id: 'MI11', menuId: 'M3', label: 'Chính sách bảo hành', url: '/policy/warranty', order: 1, depth: 0 },
  { id: 'MI12', menuId: 'M3', label: 'Chính sách đổi trả', url: '/policy/return', order: 2, depth: 0 },
  { id: 'MI13', menuId: 'M3', label: 'Vận chuyển', url: '/policy/shipping', order: 3, depth: 0 },
];

export const mockHomeComponents: HomeComponent[] = [
  { id: 'HC1', type: 'Banner', title: 'Hero Banner Mùa Hè', active: true, order: 1, preview: 'Slider ảnh khổ lớn đầu trang' },
  { id: 'HC2', type: 'Stats', title: 'Thống kê nổi bật', active: true, order: 2, preview: '4 box số liệu: Khách hàng, Sản phẩm...' },
  { id: 'HC3', type: 'ProductGrid', title: 'Sản phẩm bán chạy', active: true, order: 3, preview: 'Grid 4x2 sản phẩm có tag Hot' },
  { id: 'HC4', type: 'News', title: 'Tin tức mới nhất', active: true, order: 4, preview: 'Danh sách 3 bài viết mới nhất' },
  { id: 'HC5', type: 'Partners', title: 'Đối tác tiêu biểu', active: true, order: 5, preview: 'Carousel logo đối tác' },
  { id: 'HC6', type: 'CTA', title: 'Đăng ký nhận tin', active: false, order: 6, preview: 'Form đăng ký email Newsletter' },
];
