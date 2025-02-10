import { GetStaticPropsContext, GetStaticPropsResult } from 'next';

import { messages as enGbMessages } from '@i18n/locales/en-gb/messages';
import { Messages, i18n } from '@lingui/core';

i18n.load('en-gb', enGbMessages);
i18n.activate('en-gb');

export const loadCatalog = async (locale: string) => {
  const { messages } = await import(`@i18n/locales/${locale}/messages.po`);

  return messages;
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<{ i18n: Messages }>> => {
  return {
    props: {
      i18n: await loadCatalog(ctx.locale as string)
    }
  };
};
