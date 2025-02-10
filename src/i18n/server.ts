import 'server-only';

import { GetStaticPropsContext } from 'next';

// see https://lingui.dev/tutorials/react-rsc
/// https://github.com/lingui/js-lingui/blob/main/examples/nextjs-swc/src/appRouterI18n.ts

import { I18n, Messages, setupI18n } from '@lingui/core';
import linguiConfig from '../../lingui.config';

export { t } from '@lingui/core/macro';
export { Trans } from '@lingui/react/macro';

const { locales } = linguiConfig;

type SupportedLocales = string;

const loadCatalog = async (
  locale: SupportedLocales
): Promise<{
  [k: string]: Messages;
}> => {
  const { messages } = await import(`@i18n/locales/${locale}/messages.po`);
  return {
    [locale]: messages
  };
};
const catalogs = await Promise.all(locales.map(loadCatalog));

// transform array of catalogs into a single object
export const allMessages = catalogs.reduce((acc, oneCatalog) => {
  return { ...acc, ...oneCatalog };
}, {});

type AllI18nInstances = { [K in SupportedLocales]: I18n };

export const allI18nInstances: AllI18nInstances = locales.reduce(
  (acc, locale) => {
    const messages = allMessages[locale] ?? {};
    const i18n = setupI18n({
      locale,
      messages: { [locale]: messages }
    });
    return { ...acc, [locale]: i18n };
  },
  {}
);

export const getI18nInstance = (locale: SupportedLocales): I18n => {
  if (!allI18nInstances[locale]) {
    // eslint-disable-next-line no-console
    console.warn(`No i18n instance found for locale "${locale}"`);
  }
  return allI18nInstances[locale]! || allI18nInstances['en']!;
};

export const getStaticI18nProps = async (ctx: GetStaticPropsContext) => ({
  props: {
    i18n: await loadCatalog(ctx.locale as string)
  }
});
