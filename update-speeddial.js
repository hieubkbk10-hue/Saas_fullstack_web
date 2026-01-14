const fs = require('fs');
const filePath = 'app/admin/home-components/previews.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the entire SpeedDialPreview component
const oldComponent = `export const SpeedDialPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  config: {
    actions: SpeedDialAction[];
    style: SpeedDialStyle;
    position: 'bottom-right' | 'bottom-left';
    mainButtonColor: string;
    alwaysOpen?: boolean;
  };
  brandColor: string;
  selectedStyle?: SpeedDialStyle;
  onStyleChange?: (style: SpeedDialStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || config.style || 'fab';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as SpeedDialStyle);
  const alwaysOpen = config.alwaysOpen ?? true;
  
  const styles = [
    { id: 'fab', label: 'FAB' },
    { id: 'sidebar', label: 'Sidebar' },
    { id: 'pills', label: 'Pills' },
  ];

  const isRight = config.position !== 'bottom-left';

  // Style 1: FAB - Floating Action Buttons (vertical stack)
  const renderFabStyle = () => (
    <div className={cn(
      "absolute bottom-4 flex flex-col gap-2",
      isRight ? "right-4 items-end" : "left-4 items-start"
    )}>
      {config.actions.map((action) => (
        <a
          key={action.id}
          href={action.url || '#'}
          className="group flex items-center gap-2"
        >
          {isRight && action.label && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
              {action.label}
            </span>
          )}
          <div
            className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: action.bgColor || brandColor }}
          >
            <SpeedDialIcon name={action.icon} size={18} />
          </div>
          {!isRight && action.label && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
              {action.label}
            </span>
          )}
        </a>
      ))}
    </div>
  );

  // Style 2: Sidebar - Vertical bar attached to edge
  const renderSidebarStyle = () => (
    <div className={cn(
      "absolute top-1/2 -translate-y-1/2 flex flex-col overflow-hidden shadow-xl",
      isRight ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl"
    )}>
      {config.actions.map((action, idx) => (
        <a
          key={action.id}
          href={action.url || '#'}
          className="group relative flex items-center justify-center w-12 h-12 text-white hover:w-32 transition-all duration-200 overflow-hidden"
          style={{ backgroundColor: action.bgColor || brandColor }}
        >
          <div className={cn(
            "absolute flex items-center gap-2 transition-all duration-200",
            isRight ? "right-3" : "left-3"
          )}>
            <SpeedDialIcon name={action.icon} size={18} />
          </div>
          {action.label && (
            <span className={cn(
              "absolute text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isRight ? "right-10" : "left-10"
            )}>
              {action.label}
            </span>
          )}
          {idx < config.actions.length - 1 && (
            <div className="absolute bottom-0 left-2 right-2 h-px bg-white/20" />
          )}
        </a>
      ))}
    </div>
  );

  // Style 3: Pills - Horizontal pills with labels
  const renderPillsStyle = () => (
    <div className={cn(
      "absolute bottom-4 flex flex-col gap-2",
      isRight ? "right-4 items-end" : "left-4 items-start"
    )}>
      {config.actions.map((action) => (
        <a
          key={action.id}
          href={action.url || '#'}
          className={cn(
            "flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer",
            isRight ? "flex-row" : "flex-row-reverse"
          )}
          style={{ backgroundColor: action.bgColor || brandColor }}
        >
          <SpeedDialIcon name={action.icon} size={16} />
          {action.label && (
            <span className="text-xs font-medium whitespace-nowrap">
              {action.label}
            </span>
          )}
        </a>
      ))}
    </div>
  );

  return (
    <PreviewWrapper 
      title="Preview Speed Dial" 
      device={device} 
      setDevice={setDevice} 
      previewStyle={previewStyle} 
      setPreviewStyle={setPreviewStyle} 
      styles={styles} 
      info={\`\${config.actions.length} hành động\${alwaysOpen ? ' • Luôn hiển thị' : ''}\`}
    >
      <BrowserFrame>
        <div className="relative h-72 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
          {/* Sample page content */}
          <div className="p-4 space-y-2">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded" />
            <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-700/50 rounded" />
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
              <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
              <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
            </div>
          </div>
          
          {/* Speed Dial */}
          {previewStyle === 'fab' && renderFabStyle()}
          {previewStyle === 'sidebar' && renderSidebarStyle()}
          {previewStyle === 'pills' && renderPillsStyle()}
        </div>
      </BrowserFrame>
    </PreviewWrapper>
  );
};`;

const newComponent = `export const SpeedDialPreview = ({ 
  config, 
  brandColor, 
  selectedStyle, 
  onStyleChange 
}: { 
  config: {
    actions: SpeedDialAction[];
    style: SpeedDialStyle;
    position: 'bottom-right' | 'bottom-left';
    mainButtonColor: string;
    alwaysOpen?: boolean;
  };
  brandColor: string;
  selectedStyle?: SpeedDialStyle;
  onStyleChange?: (style: SpeedDialStyle) => void;
}) => {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const previewStyle = selectedStyle || config.style || 'fab';
  const setPreviewStyle = (s: string) => onStyleChange?.(s as SpeedDialStyle);
  
  // BẮT BUỘC 6 styles theo Best Practice
  const styles = [
    { id: 'fab', label: 'FAB' },
    { id: 'sidebar', label: 'Sidebar' },
    { id: 'pills', label: 'Pills' },
    { id: 'stack', label: 'Stack' },
    { id: 'dock', label: 'Dock' },
    { id: 'minimal', label: 'Minimal' },
  ];

  const isRight = config.position !== 'bottom-left';
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const iconSize = isMobile ? 16 : 18;
  const gap = isMobile ? 'gap-2' : 'gap-2.5';

  // Empty State
  const renderEmptyState = () => (
    <div className={cn("absolute flex flex-col items-center justify-center", isRight ? "right-4 bottom-4" : "left-4 bottom-4")}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 opacity-40" style={{ backgroundColor: \`\${brandColor}20\` }}>
        <Plus size={24} style={{ color: brandColor }} />
      </div>
      <p className="text-xs text-slate-400 text-center max-w-[100px]">Thêm hành động</p>
    </div>
  );

  // Style 1: FAB - Floating Action Buttons
  const renderFabStyle = () => (
    <div className={cn("absolute flex flex-col", gap, isRight ? "right-4 bottom-4 items-end" : "left-4 bottom-4 items-start")} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action, idx) => (
        <a key={action.id} href={action.url || '#'} className="group flex items-center gap-2" aria-label={action.label || action.icon} style={{ animationDelay: \`\${idx * 50}ms\` }}>
          {isRight && action.label && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">{action.label}</span>
          )}
          <div className={cn(isMobile ? "w-11 h-11" : "w-12 h-12", "rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 hover:shadow-xl transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px]")} style={{ backgroundColor: action.bgColor || brandColor }}>
            <SpeedDialIcon name={action.icon} size={iconSize} />
          </div>
          {!isRight && action.label && (
            <span className="px-2.5 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">{action.label}</span>
          )}
        </a>
      ))}
    </div>
  );

  // Style 2: Sidebar - Vertical bar attached to edge
  const renderSidebarStyle = () => (
    <div className={cn("absolute top-1/2 -translate-y-1/2 flex flex-col overflow-hidden shadow-xl", isRight ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl")} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action, idx) => (
        <a key={action.id} href={action.url || '#'} className={cn("group relative flex items-center justify-center text-white transition-all duration-200 overflow-hidden", isMobile ? "w-11 h-11 hover:w-28" : "w-12 h-12 hover:w-32")} style={{ backgroundColor: action.bgColor || brandColor }} aria-label={action.label || action.icon}>
          <div className={cn("absolute flex items-center gap-2 transition-all duration-200", isRight ? "right-3" : "left-3")}>
            <SpeedDialIcon name={action.icon} size={iconSize} />
          </div>
          {action.label && <span className={cn("absolute text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200", isRight ? "right-10" : "left-10")}>{action.label}</span>}
          {idx < config.actions.length - 1 && <div className="absolute bottom-0 left-2 right-2 h-px bg-white/20" />}
        </a>
      ))}
    </div>
  );

  // Style 3: Pills - Rounded pills with labels
  const renderPillsStyle = () => (
    <div className={cn("absolute flex flex-col", gap, isRight ? "right-4 bottom-4 items-end" : "left-4 bottom-4 items-start")} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action) => (
        <a key={action.id} href={action.url || '#'} className={cn("flex items-center rounded-full shadow-lg text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer min-h-[44px]", isMobile ? "gap-2 pl-3 pr-4 py-2" : "gap-2.5 pl-4 pr-5 py-2.5", isRight ? "flex-row" : "flex-row-reverse")} style={{ backgroundColor: action.bgColor || brandColor }} aria-label={action.label || action.icon}>
          <SpeedDialIcon name={action.icon} size={isMobile ? 14 : 16} />
          {action.label && <span className={cn("font-medium whitespace-nowrap", isMobile ? "text-[11px]" : "text-xs")}>{action.label}</span>}
        </a>
      ))}
    </div>
  );

  // Style 4: Stack - Overlapping buttons
  const renderStackStyle = () => (
    <div className={cn("absolute flex flex-col items-center", isRight ? "right-4 bottom-4" : "left-4 bottom-4")} role="group" aria-label="Liên hệ nhanh">
      <div className="relative" style={{ height: \`\${Math.min(config.actions.length * 32 + 20, 180)}px\` }}>
        {config.actions.map((action, idx) => (
          <a key={action.id} href={action.url || '#'} className={cn("group absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full shadow-lg text-white hover:scale-110 hover:z-50 transition-all duration-200 cursor-pointer", isMobile ? "w-10 h-10" : "w-11 h-11")} style={{ backgroundColor: action.bgColor || brandColor, bottom: \`\${idx * (isMobile ? 28 : 32)}px\`, zIndex: config.actions.length - idx, boxShadow: \`0 4px 12px \${action.bgColor || brandColor}40\` }} aria-label={action.label || action.icon}>
            <SpeedDialIcon name={action.icon} size={isMobile ? 14 : 16} />
            {action.label && <span className={cn("absolute px-2 py-1 bg-slate-900/90 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap", isRight ? "right-full mr-2" : "left-full ml-2")}>{action.label}</span>}
          </a>
        ))}
      </div>
    </div>
  );

  // Style 5: Dock - MacOS dock style
  const renderDockStyle = () => (
    <div className={cn("absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end justify-center rounded-2xl p-2", isMobile ? "gap-1" : "gap-1.5")} style={{ backgroundColor: \`\${brandColor}10\`, backdropFilter: 'blur(8px)' }} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action) => (
        <a key={action.id} href={action.url || '#'} className={cn("group relative flex items-center justify-center rounded-xl text-white transition-all duration-200 cursor-pointer hover:scale-125 hover:-translate-y-2", isMobile ? "w-10 h-10" : "w-11 h-11")} style={{ backgroundColor: action.bgColor || brandColor, boxShadow: \`0 4px 12px \${action.bgColor || brandColor}30\` }} aria-label={action.label || action.icon}>
          <SpeedDialIcon name={action.icon} size={isMobile ? 14 : 16} />
          {action.label && <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-[10px] font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">{action.label}</span>}
        </a>
      ))}
    </div>
  );

  // Style 6: Minimal - Icons only, compact bar
  const renderMinimalStyle = () => (
    <div className={cn("absolute flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg px-2 py-1.5", isMobile ? "gap-1 bottom-3" : "gap-1.5 bottom-4", isRight ? "right-4" : "left-4")} style={{ boxShadow: \`0 4px 20px \${brandColor}15\` }} role="group" aria-label="Liên hệ nhanh">
      {config.actions.map((action, idx) => (
        <React.Fragment key={action.id}>
          <a href={action.url || '#'} className={cn("group relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer hover:scale-110", isMobile ? "w-9 h-9" : "w-10 h-10")} style={{ color: action.bgColor || brandColor }} aria-label={action.label || action.icon}>
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ backgroundColor: \`\${action.bgColor || brandColor}15\` }} />
            <SpeedDialIcon name={action.icon} size={isMobile ? 16 : 18} />
            {action.label && <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-[10px] font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10">{action.label}</span>}
          </a>
          {idx < config.actions.length - 1 && <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />}
        </React.Fragment>
      ))}
    </div>
  );

  // Dynamic info
  const getInfo = () => {
    const count = config.actions.length;
    if (count === 0) return 'Chưa có hành động';
    const styleInfo = { fab: 'Buttons dọc với tooltip', sidebar: 'Thanh cố định bên cạnh', pills: 'Nhãn luôn hiển thị', stack: 'Buttons xếp chồng', dock: 'Dock style (phóng to hover)', minimal: 'Chỉ icons, gọn nhẹ' };
    return \`\${count} hành động • \${styleInfo[previewStyle] || ''}\`;
  };

  return (
    <PreviewWrapper title="Preview Speed Dial" device={device} setDevice={setDevice} previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} styles={styles} info={getInfo()}>
      <BrowserFrame>
        <div className={cn("relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden", isMobile ? "h-64" : isTablet ? "h-72" : "h-80")}>
          {/* Sample page content */}
          <div className={cn("space-y-2", isMobile ? "p-3" : "p-4")}>
            <div className={cn("bg-slate-200 dark:bg-slate-700 rounded", isMobile ? "h-4 w-32" : "h-5 w-40")} />
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded" />
            <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-700/50 rounded" />
            <div className={cn("grid gap-2 mt-3", isMobile ? "grid-cols-2" : "grid-cols-3")}>
              <div className={cn("bg-slate-100 dark:bg-slate-700/50 rounded-lg", isMobile ? "h-12" : "h-16")} />
              <div className={cn("bg-slate-100 dark:bg-slate-700/50 rounded-lg", isMobile ? "h-12" : "h-16")} />
              {!isMobile && <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />}
            </div>
          </div>
          
          {/* Speed Dial - 6 styles + empty */}
          {config.actions.length === 0 ? renderEmptyState() : (
            <>
              {previewStyle === 'fab' && renderFabStyle()}
              {previewStyle === 'sidebar' && renderSidebarStyle()}
              {previewStyle === 'pills' && renderPillsStyle()}
              {previewStyle === 'stack' && renderStackStyle()}
              {previewStyle === 'dock' && renderDockStyle()}
              {previewStyle === 'minimal' && renderMinimalStyle()}
            </>
          )}
        </div>
      </BrowserFrame>
    </PreviewWrapper>
  );
};`;

if (content.includes(oldComponent)) {
  content = content.replace(oldComponent, newComponent);
  fs.writeFileSync(filePath, content);
  console.log('SpeedDialPreview component updated successfully!');
} else {
  console.log('Old component pattern not found, skipping...');
}
