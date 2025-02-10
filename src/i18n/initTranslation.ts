import { setI18n } from '@lingui/react/server';
import { getI18nInstance } from './server';

export type PageLangParam = {
  params: Promise<{ lang: string }>;
};

export const initTranslation = (lang: string) => {
  const i18n = getI18nInstance(lang);
  setI18n(i18n);
  return { i18n };
};
