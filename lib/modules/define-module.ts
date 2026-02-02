 import type { LucideIcon } from 'lucide-react';
 
 export interface ModuleFeature {
   key: string;
   label: string;
   icon?: LucideIcon;
   linkedField?: string;
   description?: string;
 }
 
 export interface ModuleSetting {
   key: string;
   label: string;
   type: 'number' | 'select' | 'toggle';
   default?: string | number | boolean;
   options?: { value: string; label: string }[];
 }
 
 export interface ModuleDefinition {
   key: string;
   name: string;
   description: string;
   icon: LucideIcon;
   color: 'cyan' | 'orange' | 'violet' | 'emerald' | 'rose' | 'blue' | 'amber' | 'indigo';
   categoryModuleKey?: string;
   features?: ModuleFeature[];
   settings?: ModuleSetting[];
   conventionNote?: string;
   tabs?: ('config' | 'data' | 'appearance')[];
 }
 
 const COUNT_FEATURES = ['likes', 'views', 'shares', 'comments'];
 
 function getLinkedField(featureKey: string): string {
   const fieldName = featureKey.replace(/^enable/, '');
   const lowercaseFirst = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
   
   if (COUNT_FEATURES.includes(lowercaseFirst.toLowerCase())) {
     return `${lowercaseFirst}Count`;
   }
   
   return lowercaseFirst;
 }
 
 export function defineModule(config: ModuleDefinition): ModuleDefinition {
   const features = config.features?.map(f => ({
     ...f,
     linkedField: f.linkedField ?? getLinkedField(f.key),
   }));
   
   return {
     ...config,
     features,
     tabs: config.tabs ?? ['config', 'data'],
   };
 }
