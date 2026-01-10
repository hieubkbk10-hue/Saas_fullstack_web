import { getConvexClient } from "./convex";
import { api } from "@/convex/_generated/api";

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

const SETTINGS_KEYS = {
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
  seo: ["seo_title", "seo_description", "seo_keywords", "seo_og_image"],
  contact: ["contact_email", "contact_phone", "contact_address", "contact_hotline"],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const client = getConvexClient();
  const settings = await client.query(api.settings.getMultiple, {
    keys: SETTINGS_KEYS.site,
  });

  return {
    site_name: (settings.site_name as string) || "VietAdmin",
    site_tagline: (settings.site_tagline as string) || "",
    site_url: (settings.site_url as string) || "",
    site_logo: (settings.site_logo as string) || "",
    site_favicon: (settings.site_favicon as string) || "",
    site_brand_color: (settings.site_brand_color as string) || "#3b82f6",
    site_timezone: (settings.site_timezone as string) || "Asia/Ho_Chi_Minh",
    site_language: (settings.site_language as string) || "vi",
  };
}

export async function getSEOSettings(): Promise<SEOSettings> {
  const client = getConvexClient();
  const settings = await client.query(api.settings.getMultiple, {
    keys: SETTINGS_KEYS.seo,
  });

  return {
    seo_title: (settings.seo_title as string) || "",
    seo_description: (settings.seo_description as string) || "",
    seo_keywords: (settings.seo_keywords as string) || "",
    seo_og_image: (settings.seo_og_image as string) || "",
  };
}

export async function getContactSettings(): Promise<ContactSettings> {
  const client = getConvexClient();
  const settings = await client.query(api.settings.getMultiple, {
    keys: SETTINGS_KEYS.contact,
  });

  return {
    contact_email: (settings.contact_email as string) || "",
    contact_phone: (settings.contact_phone as string) || "",
    contact_address: (settings.contact_address as string) || "",
    contact_hotline: (settings.contact_hotline as string) || "",
  };
}

export async function getAllPublicSettings() {
  const [site, seo, contact] = await Promise.all([
    getSiteSettings(),
    getSEOSettings(),
    getContactSettings(),
  ]);

  return { site, seo, contact };
}
