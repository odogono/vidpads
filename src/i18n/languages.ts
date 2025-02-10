import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

interface Languages {
  locale: string;
  msg: MessageDescriptor;
  territory?: string;
  rtl: boolean;
}

export type LOCALES = 'en-us' | 'en-gb' | 'pseudo';

const languages: Languages[] = [
  {
    locale: 'en-us',
    msg: msg`English`,
    territory: 'US',
    rtl: false
  },
  {
    locale: 'en-gb',
    msg: msg`English`,
    territory: 'GB',
    rtl: false
  }
];

if (process.env.NODE_ENV !== 'production') {
  languages.push({
    locale: 'pseudo',
    msg: msg`Pseudo`,
    rtl: false
  });
}

export default languages;
