// ─────────────────────────────────────────────
// CLIENT-SIDE FREE GOOGLE TRANSLATION HELPER
// On-the-fly translation of dynamic database data from French to English
// ─────────────────────────────────────────────

// Simple memory cache to avoid redundant API calls
const translationCache: Record<string, string> = {};

// Load cache from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('signal_translation_cache');
    if (saved) {
      Object.assign(translationCache, JSON.parse(saved));
    }
  } catch {}
}

const saveCache = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('signal_translation_cache', JSON.stringify(translationCache));
    } catch {}
  }
};

/**
 * Translates a single text segment from French (fr) to English (en)
 * using the free Google Translate client API.
 */
export async function translateFrToEn(text: string): Promise<string> {
  const clean = text?.trim();
  if (!clean) return '';
  
  // If it's already cached, return it
  if (translationCache[clean]) {
    return translationCache[clean];
  }

  // Basic check: if it contains mostly English/common terms or is very short,
  // or looks like code/URL/metrics, return it directly.
  if (/^https?:\/\//i.test(clean) || /^\+?\d+%?$/.test(clean)) {
    return clean;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation failed');
    
    const data = await res.json();
    // Google Translate returns an array of sentences: [[["sentence1 translated", "sentence1 original", ...], ["sentence2 ..."]]]
    if (data && data[0]) {
      const translated = data[0]
        .map((x: any) => x[0])
        .filter(Boolean)
        .join('');
      
      if (translated) {
        translationCache[clean] = translated;
        saveCache();
        return translated;
      }
    }
  } catch (err) {
    console.warn('Error during translation of:', clean, err);
  }

  return clean; // Fallback to original text on error
}
