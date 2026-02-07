export type ContactLayoutStyle = 'form-only' | 'with-map' | 'with-info';

export type LayoutConfig = {
  showMap: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
};

export type ContactExperienceConfig = {
  layoutStyle: ContactLayoutStyle;
  layouts: {
    'form-only': LayoutConfig;
    'with-map': LayoutConfig;
    'with-info': LayoutConfig;
  };
};

export const CONTACT_EXPERIENCE_KEY = 'contact_ui' as const;

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  showContactInfo: true,
  showMap: true,
  showSocialLinks: true,
};

export const DEFAULT_CONTACT_CONFIG: ContactExperienceConfig = {
  layoutStyle: 'with-info',
  layouts: {
    'form-only': { ...DEFAULT_LAYOUT_CONFIG, showContactInfo: false, showMap: false },
    'with-info': { ...DEFAULT_LAYOUT_CONFIG, showMap: false },
    'with-map': { ...DEFAULT_LAYOUT_CONFIG, showContactInfo: false },
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isLayoutStyle = (value: unknown): value is ContactLayoutStyle => {
  return value === 'form-only' || value === 'with-map' || value === 'with-info';
};

const mergeLayout = (value: unknown, fallback: LayoutConfig): LayoutConfig => {
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    showContactInfo: typeof value.showContactInfo === 'boolean' ? value.showContactInfo : fallback.showContactInfo,
    showMap: typeof value.showMap === 'boolean' ? value.showMap : fallback.showMap,
    showSocialLinks: typeof value.showSocialLinks === 'boolean' ? value.showSocialLinks : fallback.showSocialLinks,
  };
};

export const parseContactExperienceConfig = (raw: unknown): ContactExperienceConfig => {
  const source = isRecord(raw) ? raw : {};
  const layoutsRaw = isRecord(source.layouts) ? source.layouts : {};

  return {
    layoutStyle: isLayoutStyle(source.layoutStyle) ? source.layoutStyle : DEFAULT_CONTACT_CONFIG.layoutStyle,
    layouts: {
      'form-only': mergeLayout(layoutsRaw['form-only'], DEFAULT_CONTACT_CONFIG.layouts['form-only']),
      'with-info': mergeLayout(layoutsRaw['with-info'], DEFAULT_CONTACT_CONFIG.layouts['with-info']),
      'with-map': mergeLayout(layoutsRaw['with-map'], DEFAULT_CONTACT_CONFIG.layouts['with-map']),
    },
  };
};
