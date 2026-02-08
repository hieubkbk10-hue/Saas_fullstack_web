export const parseHreflang = (input?: string): Record<string, string> => {
  if (!input) {
    return {};
  }

  return input
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const [locale, url] = entry.split(':').map((part) => part.trim());
      if (!locale || !url) {
        return acc;
      }
      acc[locale] = url;
      return acc;
    }, {});
};
