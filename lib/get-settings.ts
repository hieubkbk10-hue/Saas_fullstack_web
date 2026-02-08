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
  seo_business_type: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
  seo_opening_hours: string;
  seo_price_range: string;
  seo_geo_lat: string;
  seo_geo_lng: string;
  seo_hreflang: string;
  seo_robots: string;
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
  seo: [
    "seo_title",
    "seo_description",
    "seo_keywords",
    "seo_og_image",
    "seo_robots",
    "seo_business_type",
    "seo_opening_hours",
    "seo_price_range",
    "seo_geo_lat",
    "seo_geo_lng",
    "seo_hreflang",
  ],
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
    seo_business_type: (settings.seo_business_type as string) || "LocalBusiness",
    seo_description: (settings.seo_description as string) || "",
    seo_geo_lat: (settings.seo_geo_lat as string) || "",
    seo_geo_lng: (settings.seo_geo_lng as string) || "",
    seo_hreflang: (settings.seo_hreflang as string) || "",
    seo_keywords: (settings.seo_keywords as string) || "",
    seo_og_image: (settings.seo_og_image as string) || "",
    seo_opening_hours: (settings.seo_opening_hours as string) || "",
    seo_price_range: (settings.seo_price_range as string) || "",
    seo_robots: (settings.seo_robots as string) || "",
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
