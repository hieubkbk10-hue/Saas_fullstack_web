import { api } from "@/convex/_generated/api";
import { getConvexClient } from "./convex";

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_url: string;
  site_logo: string;
  site_favicon: string;
  site_brand_color: string;
  site_timezone: string;
  site_language: string;
}

export interface SEOSettings {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
}

export interface ContactSettings {
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_hotline: string;
}

export interface PublicSettings {
  contact: ContactSettings;
  seo: SEOSettings;
  site: SiteSettings;
}

const SETTINGS_KEYS = {
  contact: ["contact_email", "contact_phone", "contact_address", "contact_hotline"],
  seo: ["seo_title", "seo_description", "seo_keywords", "seo_og_image"],
  site: [
    "site_name",
    "site_tagline",
    "site_url",
    "site_logo",
    "site_favicon",
    "site_brand_color",
    "site_timezone",
    "site_language",
  ],
};

export const getSiteSettings =  async (): Promise<SiteSettings> => {
  const client = getConvexClient();
  return client.query(api.settings.getMultiple, {
    keys: SETTINGS_KEYS.site,
  }).then((settings) => ({
    site_brand_color: (settings.site_brand_color as string) || "#3b82f6",
    site_favicon: (settings.site_favicon as string) || "",
    site_language: (settings.site_language as string) || "vi",
    site_logo: (settings.site_logo as string) || "",
    site_name: (settings.site_name as string) || "VietAdmin",
    site_tagline: (settings.site_tagline as string) || "",
    site_timezone: (settings.site_timezone as string) || "Asia/Ho_Chi_Minh",
    site_url: (settings.site_url as string) || "",
  }));
};

export const getSEOSettings =  async (): Promise<SEOSettings> => {
  const client = getConvexClient();
  return client.query(api.settings.getMultiple, {
    keys: SETTINGS_KEYS.seo,
  }).then((settings) => ({
    seo_description: (settings.seo_description as string) || "",
    seo_keywords: (settings.seo_keywords as string) || "",
    seo_og_image: (settings.seo_og_image as string) || "",
    seo_title: (settings.seo_title as string) || "",
  }));
};

export const getContactSettings =  async (): Promise<ContactSettings> => {
  const client = getConvexClient();
  return client.query(api.settings.getMultiple, {
    keys: SETTINGS_KEYS.contact,
  }).then((settings) => ({
    contact_address: (settings.contact_address as string) || "",
    contact_email: (settings.contact_email as string) || "",
    contact_hotline: (settings.contact_hotline as string) || "",
    contact_phone: (settings.contact_phone as string) || "",
  }));
};

export const getAllPublicSettings =  async (): Promise<PublicSettings> => Promise.all([
    getSiteSettings(),
    getSEOSettings(),
    getContactSettings(),
  ]).then(([site, seo, contact]) => ({ contact, seo, site }));
