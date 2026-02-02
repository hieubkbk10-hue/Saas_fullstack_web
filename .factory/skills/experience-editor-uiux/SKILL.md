 ---
 name: experience-editor-uiux
 description: "Thiết kế UI/UX cho Experience pages với Full Preview + Floating Bottom Panel pattern. Sử dụng khi: (1) Tạo hoặc refactor Experience pages, (2) Cần preview full-width responsive, (3) Config theo layout-specific (mỗi layout có config riêng), (4) Cross-module sync (1 experience điều khiển nhiều modules). Pattern này dựa trên Shopify Theme Editor, WordPress Customizer, và Webflow Designer."
 version: 1.0.0
 ---
 
 # Experience Editor UI/UX
 
 Skill này cung cấp guidelines và patterns để thiết kế Experience pages với **Full Preview + Floating Bottom Panel** pattern.
 
 ## Problem Statement
 
 Experience pages trong admin cần:
 1. **Preview full-width** để test responsive breakpoints chính xác
 2. **Layout-specific config** - mỗi layout (Classic/Modern/Minimal) có config riêng
 3. **Cross-module sync** - một experience có thể điều khiển features từ nhiều modules
 4. **Controls không che preview** - user vẫn thấy preview khi điều chỉnh settings
 
 ## Solution: Full Preview + Floating Bottom Panel
 
 ### Core Pattern
 
 ```
 ┌─────────────────────────────────────────────────────────────────┐
 │  Header: Title + Save Button                                    │
 ├─────────────────────────────────────────────────────────────────┤
 │                                                                 │
 │                                                                 │
 │                   FULL-WIDTH PREVIEW                           │
 │                   (height: calc(100vh - header - panel))        │
 │                                                                 │
 │                   [Device Toggle: Desktop | Tablet | Mobile]    │
 │                                                                 │
 │                                                                 │
 ├─────────────────────────────────────────────────────────────────┤
 │  ┌───────────┬───────────┬───────────┐                         │
 │  │  Classic  │  Modern   │  Minimal  │  ← Layout Tabs          │
 │  ├───────────┴───────────┴───────────┤                         │
 │  │                                   │                         │
 │  │  Layout-specific config controls  │  ← Collapsible Panel    │
 │  │  (toggles, selects, inputs)       │                         │
 │  │                                   │                         │
 │  └───────────────────────────────────┘                         │
 └─────────────────────────────────────────────────────────────────┘
 ```
 
 ### Key Components
 
 1. **Preview Area** (main): Full-width, scrollable, với BrowserFrame
 2. **Device Toggle**: Desktop (1920px) / Tablet (768px) / Mobile (375px)
 3. **Layout Tabs**: Chuyển đổi giữa các layouts, mỗi layout có config riêng
 4. **Config Panel**: Collapsible, chứa settings cho layout đang active
 
 ## Data Structure
 
 ### Layout-Specific Config Pattern
 
 ```typescript
 // Mỗi layout có config object riêng
 type ExperienceConfig = {
   activeLayout: 'classic' | 'modern' | 'minimal';
   layouts: {
     classic: ClassicLayoutConfig;
     modern: ModernLayoutConfig;
     minimal: MinimalLayoutConfig;
   };
   // Shared settings (apply cho tất cả layouts)
   shared?: SharedConfig;
 };
 
 // Ví dụ: PostDetailExperienceConfig
 type PostDetailExperienceConfig = {
   activeLayout: 'classic' | 'modern' | 'minimal';
   layouts: {
     classic: {
       showAuthor: boolean;
       showDate: boolean;
       showShare: boolean;
       showComments: boolean;
       showRelated: boolean;
       sidebarPosition: 'left' | 'right';
       sidebarWidgets: ('toc' | 'recent' | 'tags')[];
     };
     modern: {
       showAuthor: boolean;
       showShare: boolean;
       showComments: boolean;
       showRelated: boolean;
       heroStyle: 'full' | 'split' | 'minimal';
       showExcerpt: boolean;
     };
     minimal: {
       showAuthor: boolean;
       showShare: boolean;
       showComments: boolean;
       showRelated: boolean;
       contentWidth: 'narrow' | 'medium' | 'wide';
       showTableOfContents: boolean;
     };
   };
 };
 ```
 
 ### Cross-Module Sync Pattern
 
 ```typescript
 // Experience có thể điều khiển settings từ nhiều modules
 type CrossModuleConfig = {
   // Main module settings
   posts: {
     showAuthorAvatar: boolean;
     showPublishDate: boolean;
   };
   // Related module settings
   comments: {
     enabled: boolean;
     showLikes: boolean;
     showReplies: boolean;
     maxDepth: number;
   };
 };
 
 // Sync với module settings khi save
 const syncToModules = async (config: CrossModuleConfig) => {
   await Promise.all([
     updateModuleSetting('posts', 'showAuthorAvatar', config.posts.showAuthorAvatar),
     updateModuleSetting('comments', 'enableLikes', config.comments.showLikes),
     // ... other syncs
   ]);
 };
 ```
 
 ## Component Architecture
 
 ### 1. ExperienceEditorLayout
 
 Main layout component:
 
 ```typescript
 interface ExperienceEditorLayoutProps {
   children: React.ReactNode;           // Preview content
   activeLayout: string;                // Current active layout
   layouts: LayoutOption[];             // Available layouts
   onLayoutChange: (layout: string) => void;
   renderControls: () => React.ReactNode; // Layout-specific controls
   isPanelExpanded?: boolean;
   onPanelToggle?: () => void;
 }
 
 type LayoutOption = {
   id: string;
   label: string;
   description?: string;
   icon?: LucideIcon;
 };
 ```
 
 ### 2. PreviewFrame
 
 Browser-like frame with device simulation:
 
 ```typescript
 interface PreviewFrameProps {
   children: React.ReactNode;
   device: 'desktop' | 'tablet' | 'mobile';
   url?: string;                        // Display URL in address bar
   maxHeight?: string;                  // Default: 520px
 }
 
 const deviceWidths = {
   desktop: 'w-full',
   tablet: 'w-[768px] max-w-full',
   mobile: 'w-[375px] max-w-full',
 };
 ```
 
 ### 3. LayoutTabs
 
 Tab component for switching layouts:
 
 ```typescript
 interface LayoutTabsProps {
   layouts: LayoutOption[];
   activeLayout: string;
   onChange: (layout: string) => void;
   accentColor?: string;                // Brand color for active state
 }
 ```
 
 ### 4. ConfigPanel
 
 Collapsible panel for layout-specific controls:
 
 ```typescript
 interface ConfigPanelProps {
   isExpanded: boolean;
   onToggle: () => void;
   children: React.ReactNode;
 }
 ```
 
 ### 5. SyncIndicator
 
 Shows cross-module sync status:
 
 ```typescript
 interface SyncIndicatorProps {
   modules: { key: string; name: string; synced: boolean }[];
 }
 ```
 
 ## Implementation Checklist
 
 ### Phase 1: Setup
 
 - [ ] Define experience config type with layout-specific structure
 - [ ] Create default config for each layout
 - [ ] Setup useExperienceConfig hook với hasChanges detection
 
 ### Phase 2: Preview Area
 
 - [ ] Full-width preview container (height: calc(100vh - header - panel))
 - [ ] BrowserFrame component với address bar
 - [ ] Device toggle (Desktop/Tablet/Mobile)
 - [ ] Preview component receives `config.layouts[activeLayout]`
 
 ### Phase 3: Bottom Panel
 
 - [ ] Layout tabs (always visible)
 - [ ] Collapsible config panel
 - [ ] Expand/collapse toggle button
 - [ ] Panel height: 200-300px expanded, ~50px collapsed
 
 ### Phase 4: Config Controls
 
 - [ ] Render controls based on activeLayout
 - [ ] Each layout has its own control set
 - [ ] Common patterns: toggles, selects, inputs
 - [ ] Group related controls in cards/sections
 
 ### Phase 5: Cross-Module Sync (if applicable)
 
 - [ ] Identify related modules
 - [ ] Add sync indicators
 - [ ] Sync to module settings on save
 - [ ] Handle conflicts (experience overrides module)
 
 ### Phase 6: Polish
 
 - [ ] Smooth transitions (150-300ms)
 - [ ] Loading states
 - [ ] Error handling
 - [ ] Keyboard shortcuts (Ctrl+S to save)
 
 ## Code Examples
 
 ### Basic Experience Page Structure
 
 ```typescript
 'use client';
 
 import React, { useMemo } from 'react';
 import { useQuery } from 'convex/react';
 import { api } from '@/convex/_generated/api';
 import { 
   useExperienceConfig, 
   useExperienceSave,
   EXPERIENCE_NAMES 
 } from '@/lib/experiences';
 
 type LayoutType = 'classic' | 'modern' | 'minimal';
 
 type ExperienceConfig = {
   activeLayout: LayoutType;
   layouts: {
     classic: ClassicConfig;
     modern: ModernConfig;
     minimal: MinimalConfig;
   };
 };
 
 const EXPERIENCE_KEY = 'post_detail_ui';
 
 const LAYOUTS: LayoutOption[] = [
   { id: 'classic', label: 'Classic', description: 'Sidebar layout với widgets' },
   { id: 'modern', label: 'Modern', description: 'Hero image với typography đẹp' },
   { id: 'minimal', label: 'Minimal', description: 'Focus vào content, không clutter' },
 ];
 
 const DEFAULT_CONFIG: ExperienceConfig = {
   activeLayout: 'classic',
   layouts: {
     classic: { showAuthor: true, showDate: true, sidebarPosition: 'right' },
     modern: { showAuthor: true, heroStyle: 'full', showExcerpt: true },
     minimal: { showAuthor: false, contentWidth: 'narrow' },
   },
 };
 
 export default function PostDetailExperiencePage() {
   const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
   const [isPanelExpanded, setIsPanelExpanded] = React.useState(true);
   
   // Load saved config
   const experienceSetting = useQuery(api.settings.getByKey, { key: EXPERIENCE_KEY });
   
   const serverConfig = useMemo<ExperienceConfig>(() => {
     const raw = experienceSetting?.value as Partial<ExperienceConfig> | undefined;
     return {
       activeLayout: raw?.activeLayout ?? DEFAULT_CONFIG.activeLayout,
       layouts: {
         classic: { ...DEFAULT_CONFIG.layouts.classic, ...raw?.layouts?.classic },
         modern: { ...DEFAULT_CONFIG.layouts.modern, ...raw?.layouts?.modern },
         minimal: { ...DEFAULT_CONFIG.layouts.minimal, ...raw?.layouts?.minimal },
       },
     };
   }, [experienceSetting?.value]);
   
   const { config, setConfig, hasChanges } = useExperienceConfig(
     serverConfig, 
     DEFAULT_CONFIG, 
     experienceSetting === undefined
   );
   
   const { handleSave, isSaving } = useExperienceSave(EXPERIENCE_KEY, config);
   
   // Get current layout config
   const currentLayoutConfig = config.layouts[config.activeLayout];
   
   // Update active layout
   const handleLayoutChange = (layout: LayoutType) => {
     setConfig(prev => ({ ...prev, activeLayout: layout }));
   };
   
   // Update current layout's config
   const updateLayoutConfig = <K extends keyof typeof currentLayoutConfig>(
     key: K, 
     value: typeof currentLayoutConfig[K]
   ) => {
     setConfig(prev => ({
       ...prev,
       layouts: {
         ...prev.layouts,
         [prev.activeLayout]: {
           ...prev.layouts[prev.activeLayout],
           [key]: value,
         },
       },
     }));
   };
   
   return (
     <div className="h-screen flex flex-col">
       {/* Header */}
       <header className="flex-shrink-0 px-6 py-4 border-b flex justify-between items-center">
         <div>
           <h1 className="text-xl font-bold">Trải nghiệm: Chi tiết bài viết</h1>
           <p className="text-sm text-slate-500">Cấu hình layout và hiển thị</p>
         </div>
         <Button 
           onClick={handleSave} 
           disabled={!hasChanges || isSaving}
           className="bg-blue-600"
         >
           {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
           Lưu thay đổi
         </Button>
       </header>
       
       {/* Preview Area */}
       <main className="flex-1 overflow-auto p-6">
         <div className="flex justify-center mb-4">
           <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
         </div>
         <div className={`mx-auto transition-all ${deviceWidths[previewDevice]}`}>
           <PreviewFrame device={previewDevice} url="/posts/example-post">
             <PostDetailPreview 
               layoutType={config.activeLayout}
               config={currentLayoutConfig}
             />
           </PreviewFrame>
         </div>
       </main>
       
       {/* Bottom Panel */}
       <div className={cn(
         "flex-shrink-0 border-t bg-white dark:bg-slate-900 transition-all",
         isPanelExpanded ? "h-[280px]" : "h-[52px]"
       )}>
         {/* Layout Tabs - Always Visible */}
         <div className="flex items-center justify-between px-4 h-[52px] border-b">
           <LayoutTabs 
             layouts={LAYOUTS}
             activeLayout={config.activeLayout}
             onChange={handleLayoutChange}
           />
           <button 
             onClick={() => setIsPanelExpanded(!isPanelExpanded)}
             className="p-2 hover:bg-slate-100 rounded-lg"
           >
             {isPanelExpanded ? <ChevronDown /> : <ChevronUp />}
           </button>
         </div>
         
         {/* Config Controls - Collapsible */}
         {isPanelExpanded && (
           <div className="p-4 overflow-auto" style={{ height: 'calc(280px - 52px)' }}>
             {config.activeLayout === 'classic' && (
               <ClassicLayoutControls 
                 config={config.layouts.classic}
                 onChange={(key, value) => updateLayoutConfig(key, value)}
               />
             )}
             {config.activeLayout === 'modern' && (
               <ModernLayoutControls 
                 config={config.layouts.modern}
                 onChange={(key, value) => updateLayoutConfig(key, value)}
               />
             )}
             {config.activeLayout === 'minimal' && (
               <MinimalLayoutControls 
                 config={config.layouts.minimal}
                 onChange={(key, value) => updateLayoutConfig(key, value)}
               />
             )}
           </div>
         )}
       </div>
     </div>
   );
 }
 ```
 
 ### Layout Controls Component
 
 ```typescript
 function ClassicLayoutControls({ 
   config, 
   onChange 
 }: { 
   config: ClassicConfig;
   onChange: <K extends keyof ClassicConfig>(key: K, value: ClassicConfig[K]) => void;
 }) {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       <ControlCard title="Thông tin bài viết">
         <ToggleRow label="Hiển thị tác giả" checked={config.showAuthor} onChange={v => onChange('showAuthor', v)} />
         <ToggleRow label="Hiển thị ngày đăng" checked={config.showDate} onChange={v => onChange('showDate', v)} />
         <ToggleRow label="Nút chia sẻ" checked={config.showShare} onChange={v => onChange('showShare', v)} />
       </ControlCard>
       
       <ControlCard title="Sidebar">
         <SelectRow 
           label="Vị trí sidebar" 
           value={config.sidebarPosition}
           options={[
             { value: 'left', label: 'Bên trái' },
             { value: 'right', label: 'Bên phải' },
           ]}
           onChange={v => onChange('sidebarPosition', v)}
         />
       </ControlCard>
       
       <ControlCard title="Nội dung liên quan">
         <ToggleRow label="Bình luận" checked={config.showComments} onChange={v => onChange('showComments', v)} />
         <ToggleRow label="Bài viết liên quan" checked={config.showRelated} onChange={v => onChange('showRelated', v)} />
       </ControlCard>
     </div>
   );
 }
 ```
 
 ### Device Toggle Component
 
 ```typescript
 const devices = [
   { id: 'desktop', icon: Monitor, label: 'Desktop', width: '1920px' },
   { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
   { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' },
 ] as const;
 
 function DeviceToggle({ 
   value, 
   onChange 
 }: { 
   value: 'desktop' | 'tablet' | 'mobile';
   onChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
 }) {
   return (
     <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
       {devices.map(device => (
         <button
           key={device.id}
           onClick={() => onChange(device.id)}
           title={`${device.label} (${device.width})`}
           className={cn(
             "p-2 rounded-md transition-all",
             value === device.id 
               ? "bg-white dark:bg-slate-700 shadow-sm" 
               : "text-slate-400 hover:text-slate-600"
           )}
         >
           <device.icon size={16} />
         </button>
       ))}
     </div>
   );
 }
 ```
 
 ### BrowserFrame Component
 
 ```typescript
 function BrowserFrame({ 
   children, 
   device, 
   url = 'yoursite.com/page' 
 }: PreviewFrameProps) {
   return (
     <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
       {/* Browser Chrome */}
       <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b">
         <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-400" />
           <div className="w-3 h-3 rounded-full bg-yellow-400" />
           <div className="w-3 h-3 rounded-full bg-green-400" />
         </div>
         <div className="flex-1 ml-4">
           <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">
             {url}
           </div>
         </div>
       </div>
       {/* Content */}
       <div className="max-h-[520px] overflow-y-auto">
         {children}
       </div>
     </div>
   );
 }
 ```
 
 ## Design Guidelines
 
 ### Layout Constraints
 
 - Preview area: `flex-1` (fills remaining space)
 - Bottom panel expanded: 250-300px
 - Bottom panel collapsed: 50-52px
 - Minimum preview height: 400px
 
 ### Responsive Behavior
 
 - Desktop: Full layout as designed
 - Tablet: Panel có thể scroll horizontal nếu cần
 - Mobile: Panel stacks vertically, preview giảm height
 
 ### Colors & Theming
 
 - Use brand color từ settings cho active states
 - Maintain contrast ratio 4.5:1 cho text
 - Support dark mode
 
 ### Animations
 
 - Panel expand/collapse: 200ms ease-out
 - Device switch: 300ms transition
 - Layout tab switch: instant (không animation)
 
 ## Cross-Module Sync Guidelines
 
 ### When to Use
 
 - Experience page controls UI features from multiple modules
 - Settings in experience should override module defaults
 - Need to keep experience and module in sync
 
 ### Implementation Pattern
 
 1. Experience page is the "source of truth" for UI config
 2. On save, sync relevant settings to module tables
 3. Module pages show read-only link to experience for UI settings
 4. Module pages remain master for data-related settings
 
 ### Example: Post Detail syncs with Comments Module
 
 ```typescript
 // Experience controls these Comments settings:
 const commentsSync = {
   'comments.enabled': config.layouts[config.activeLayout].showComments,
   'comments.enableLikes': config.layouts[config.activeLayout].showCommentLikes,
   'comments.enableReplies': config.layouts[config.activeLayout].showCommentReplies,
 };
 
 // On save, update both experience and module settings
 const handleSave = async () => {
   await Promise.all([
     saveExperienceConfig(EXPERIENCE_KEY, config),
     ...Object.entries(commentsSync).map(([key, value]) => 
       updateModuleSetting(key.split('.')[0], key.split('.')[1], value)
     ),
   ]);
 };
 ```
 
 ## Reference Files
 
 ### Current Implementation (VietAdmin)
 
 ```
 app/system/experiences/posts-list/page.tsx    # Simple layout selector
 app/system/experiences/posts-detail/page.tsx  # Cross-module sync example
 components/experiences/previews/              # Preview components
 lib/experiences/index.ts                      # Hooks and utilities
 ```
 
 ### Reusable Components (to be created)
 
 ```
 components/experiences/editor/
 ├── ExperienceEditorLayout.tsx   # Main layout component
 ├── PreviewFrame.tsx             # Browser-like preview frame
 ├── DeviceToggle.tsx             # Desktop/Tablet/Mobile switch
 ├── LayoutTabs.tsx               # Layout tab selector
 ├── ConfigPanel.tsx              # Collapsible bottom panel
 ├── ControlCard.tsx              # Grouped controls container
 ├── ToggleRow.tsx                # Toggle switch with label
 ├── SelectRow.tsx                # Select with label
 └── SyncIndicator.tsx            # Cross-module sync status
 ```
 
 ## Limitations
 
 - Pattern này phù hợp cho 2-5 layouts; nếu nhiều hơn cần horizontal scroll
 - Preview component cần được tối ưu để không gây performance issues
 - Cross-module sync có thể gây race conditions nếu user save quá nhanh
 
 ## Sources & Inspiration
 
 - Shopify Theme Editor: Full preview + sidebar controls
 - WordPress Customizer: Live preview + collapsible panels
 - Webflow Designer: Device simulation + property panels
 - Framer: Bottom panel + canvas-based editing
