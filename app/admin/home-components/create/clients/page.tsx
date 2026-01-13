'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { ComponentFormWrapper, useComponentForm, useBrandColor } from '../shared';
import { ClientsPreview, type ClientsStyle } from '../../previews';
import { MultiImageUploader, ImageItem } from '../../../components/MultiImageUploader';

interface ClientItem extends ImageItem {
  id: string | number;
  url: string;
  link: string;
  name?: string;
}

export default function ClientsCreatePage() {
  const { title, setTitle, active, setActive, handleSubmit, isSubmitting } = useComponentForm('Khách hàng của chúng tôi', 'Clients');
  const brandColor = useBrandColor();
  
  const [clientItems, setClientItems] = useState<ClientItem[]>([
    { id: 'item-1', url: '', link: '', name: '' },
    { id: 'item-2', url: '', link: '', name: '' },
    { id: 'item-3', url: '', link: '', name: '' },
    { id: 'item-4', url: '', link: '', name: '' },
  ]);
  const [style, setStyle] = useState<ClientsStyle>('marquee');

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, { 
      items: clientItems.map(c => ({ url: c.url, link: c.link, name: c.name })), 
      style 
    });
  };

  return (
    <ComponentFormWrapper
      type="Clients"
      title={title}
      setTitle={setTitle}
      active={active}
      setActive={setActive}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Logo khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiImageUploader<ClientItem>
            items={clientItems}
            onChange={setClientItems}
            folder="clients"
            imageKey="url"
            extraFields={[
              { key: 'name', placeholder: 'Tên khách hàng (tùy chọn)', type: 'text' },
              { key: 'link', placeholder: 'Link website (tùy chọn)', type: 'url' }
            ]}
            minItems={3}
            maxItems={20}
            aspectRatio="video"
            columns={4}
            showReorder={true}
            addButtonText="Thêm logo"
            emptyText="Chưa có logo nào (tối thiểu 3)"
            layout="horizontal"
          />
        </CardContent>
      </Card>

      <ClientsPreview 
        items={clientItems.map((item, idx) => ({ id: idx + 1, url: item.url, link: item.link, name: item.name }))} 
        brandColor={brandColor}
        selectedStyle={style}
        onStyleChange={setStyle}
      />
    </ComponentFormWrapper>
  );
}
