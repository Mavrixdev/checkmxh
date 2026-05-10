'use client';

import { useEffect } from 'react';
import { usePublicSettings } from '@/hooks/useAdminData';
import { setLookupApiBaseUrl } from '@/lib/api';

const upsertMeta = (name: string, content: string) => {
  if (!content) return;
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
};

export function SiteMetadata() {
  const { data: settings } = usePublicSettings();

  useEffect(() => {
    if (!settings?.site) return;
    document.title = settings.site.title || document.title;
    upsertMeta('description', settings.site.description);
    upsertMeta('keywords', settings.site.keywords);
    setLookupApiBaseUrl(settings.api.baseUrl);
  }, [settings]);

  return null;
}
