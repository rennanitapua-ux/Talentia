import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Returns a viewable URL for a file value.
 * - Public URLs (starting with 'http') are returned as-is.
 * - Private file_uri values are converted to signed URLs via CreateFileSignedUrl.
 * - Empty/null values return null.
 */
export function useSignedUrl(fileValue) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileValue) {
      setUrl(null);
      return;
    }
    // Public URLs (http/https) — use directly
    if (typeof fileValue === 'string' && fileValue.startsWith('http')) {
      setUrl(fileValue);
      return;
    }
    // Private file_uri — create signed URL
    let cancelled = false;
    setLoading(true);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileValue })
      .then((res) => {
        if (!cancelled) setUrl(res.signed_url);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fileValue]);

  return { url, loading };
}

/**
 * Non-hook version: returns a signed URL for a private file_uri, or the value as-is if public.
 * Useful for one-off calls (e.g. before passing to extractResume/InvokeLLM).
 */
export async function getSignedUrl(fileValue) {
  if (!fileValue) return null;
  if (typeof fileValue === 'string' && fileValue.startsWith('http')) return fileValue;
  const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileValue });
  return res.signed_url;
}