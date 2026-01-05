'use client';

import React, { useState } from 'react';
import { Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { BulkActionBar, SelectCheckbox } from '../components/TableUtilities';
import { mockComments } from '../mockData';

export default function CommentsListPage() {
  const [comments, setComments] = useState(mockComments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === comments.length ? [] : comments.map(c => c.id));
  const toggleSelectItem = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if(confirm('Xóa vĩnh viễn bình luận này?')) {
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('Đã xóa bình luận');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} bình luận đã chọn?`)) {
      setComments(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} bình luận`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quản lý bình luận</h1>
          <p className="text-sm text-slate-500">Xem danh sách bình luận mới nhất</p>
        </div>
      </div>

      <BulkActionBar selectedCount={selectedIds.length} onDelete={handleBulkDelete} onClearSelection={() => setSelectedIds([])} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"><SelectCheckbox checked={selectedIds.length === comments.length && comments.length > 0} onChange={toggleSelectAll} indeterminate={selectedIds.length > 0 && selectedIds.length < comments.length} /></TableHead>
              <TableHead className="w-[200px]">Người dùng</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-[180px]">Bài viết / Sản phẩm</TableHead>
              <TableHead className="w-[120px]">Thời gian</TableHead>
              <TableHead className="text-right w-[80px]">Xóa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map(comment => (
              <TableRow key={comment.id} className={selectedIds.includes(comment.id) ? 'bg-blue-500/5' : ''}>
                <TableCell><SelectCheckbox checked={selectedIds.includes(comment.id)} onChange={() => toggleSelectItem(comment.id)} /></TableCell>
                <TableCell>
                  <div className="font-medium">{comment.author}</div>
                  <div className="text-xs text-slate-400">IP: 192.168.1.1</div>
                </TableCell>
                <TableCell><p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[180px]">
                    <FileText size={12} /> {comment.target}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500">{new Date(comment.created).toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Xóa" onClick={() => handleDelete(comment.id)}><Trash2 size={16}/></Button>
                </TableCell>
              </TableRow>
            ))}
            {comments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">Không có bình luận nào.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {comments.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">Hiển thị {comments.length} bình luận</div>
        )}
      </Card>
    </div>
  );
}
