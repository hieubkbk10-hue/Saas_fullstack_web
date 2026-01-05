'use client';

import React, { useState } from 'react';
import { Upload, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Input } from '../components/ui';
import { mockImages } from '../mockData';

export default function ImagesPage() {
  const [images, setImages] = useState(mockImages);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredImages = images.filter(img => 
    img.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa ảnh này?')) {
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Đã xóa ảnh');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} ảnh đã chọn?`)) {
      setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
      setSelectedIds([]);
      toast.success(`Đã xóa ${selectedIds.length} ảnh`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thư viện ảnh</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tất cả media trên website</p>
        </div>
        <Button className="gap-2"><Upload size={16}/> Tải ảnh lên</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm tên file..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" className="gap-2" onClick={handleBulkDelete}>
              <Trash2 size={14} />
              Xóa ({selectedIds.length})
            </Button>
          )}
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredImages.map(image => (
              <div 
                key={image.id} 
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedIds.includes(image.id) ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-slate-300'}`}
                onClick={() => toggleSelect(image.id)}
              >
                <img src={image.url} alt={image.filename} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                {selectedIds.includes(image.id) && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="p-2 bg-white dark:bg-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{image.filename}</p>
                  <p className="text-xs text-slate-400">{image.size}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredImages.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {searchTerm ? 'Không tìm thấy ảnh phù hợp' : 'Chưa có ảnh nào'}
            </div>
          )}
        </div>
        
        {filteredImages.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
            Hiển thị {filteredImages.length} / {images.length} ảnh
          </div>
        )}
      </Card>
    </div>
  );
}
