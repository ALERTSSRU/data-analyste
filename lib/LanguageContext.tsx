'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Lang } from '@/lib/i18n';
import { translateFrToEn } from '@/lib/translate';

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations.fr;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: translations.fr,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved && (saved === 'fr' || saved === 'en')) {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Automatically translates French text content to English when lang === 'en'
 */
export function Trans({ children }: { children: string | undefined | null }) {
  const { lang } = useLanguage();
  const [text, setText] = useState(children || '');

  useEffect(() => {
    if (!children) {
      setText('');
      return;
    }
    if (lang === 'fr') {
      setText(children);
    } else {
      // Fetch translation
      translateFrToEn(children).then((translated) => {
        setText(translated);
      });
    }
  }, [children, lang]);

  return <>{text}</>;
}
