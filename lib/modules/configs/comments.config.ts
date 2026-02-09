 import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';
 import { defineModule } from '../define-module';
 
 export const commentsModule = defineModule({
   key: 'comments',
   name: 'Bình luận',
   description: 'Cấu hình bình luận và đánh giá cho bài viết, sản phẩm',
   icon: MessageSquare,
   color: 'cyan',
   
   features: [
     { key: 'enableLikes', label: 'Lượt thích', icon: ThumbsUp, linkedField: 'likesCount' },
     { key: 'enableReplies', label: 'Trả lời', icon: Reply, linkedField: 'parentId' },
   ],
   
   settings: [
     { key: 'commentsPerPage', label: 'Số bình luận / trang', type: 'number', default: 20 },
     { 
       key: 'defaultStatus', 
       label: 'Trạng thái mặc định', 
       type: 'select',
       default: 'Pending',
       options: [
         { value: 'Pending', label: 'Chờ duyệt' },
         { value: 'Approved', label: 'Tự động duyệt' },
       ],
     },
   ],
   
   conventionNote: 'Trường targetType xác định loại (post/product). status: Pending, Approved, Spam. Bình luận hỗ trợ polymorphic relationship.',
   
  tabs: ['config'],
 });
