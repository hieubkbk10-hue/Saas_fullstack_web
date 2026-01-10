import { MetadataRoute } from 'next';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

// Default robots.txt content
const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /system/
Disallow: /api/`;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const client = getConvexClient();
  
  // Get settings in parallel
  const [siteUrlSetting, robotsSetting] = await Promise.all([
    client.query(api.settings.getByKey, { key: 'site_url' }),
    client.query(api.settings.getByKey, { key: 'seo_robots' }),
  ]);
  
  const baseUrl = (siteUrlSetting?.value as string) || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const robotsContent = (robotsSetting?.value as string) || DEFAULT_ROBOTS;

  // Parse robots.txt content to MetadataRoute.Robots format
  const rules = parseRobotsContent(robotsContent);

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

// Parse custom robots.txt content into rules array
function parseRobotsContent(content: string): MetadataRoute.Robots['rules'] {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  const rules: Array<{
    userAgent: string | string[];
    allow?: string | string[];
    disallow?: string | string[];
  }> = [];

  let currentRule: {
    userAgent: string[];
    allow: string[];
    disallow: string[];
  } | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.startsWith('user-agent:')) {
      // Save previous rule if exists
      if (currentRule && currentRule.userAgent.length > 0) {
        rules.push({
          userAgent: currentRule.userAgent.length === 1 ? currentRule.userAgent[0] : currentRule.userAgent,
          ...(currentRule.allow.length > 0 && { allow: currentRule.allow.length === 1 ? currentRule.allow[0] : currentRule.allow }),
          ...(currentRule.disallow.length > 0 && { disallow: currentRule.disallow.length === 1 ? currentRule.disallow[0] : currentRule.disallow }),
        });
      }
      // Start new rule
      const agent = line.substring(11).trim();
      currentRule = { userAgent: [agent], allow: [], disallow: [] };
    } else if (lowerLine.startsWith('allow:') && currentRule) {
      currentRule.allow.push(line.substring(6).trim());
    } else if (lowerLine.startsWith('disallow:') && currentRule) {
      currentRule.disallow.push(line.substring(9).trim());
    }
  }

  // Don't forget the last rule
  if (currentRule && currentRule.userAgent.length > 0) {
    rules.push({
      userAgent: currentRule.userAgent.length === 1 ? currentRule.userAgent[0] : currentRule.userAgent,
      ...(currentRule.allow.length > 0 && { allow: currentRule.allow.length === 1 ? currentRule.allow[0] : currentRule.allow }),
      ...(currentRule.disallow.length > 0 && { disallow: currentRule.disallow.length === 1 ? currentRule.disallow[0] : currentRule.disallow }),
    });
  }

  // Fallback to default if no rules parsed
  if (rules.length === 0) {
    return {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/system/', '/api/'],
    };
  }

  return rules;
}
