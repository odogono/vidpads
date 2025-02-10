import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

const locales = ['en-gb', 'en-us'];

if (process.env.NODE_ENV !== 'production') {
  locales.push('pseudo');
}

export default defineConfig({
  locales,
  sourceLocale: 'en-gb',
  pseudoLocale: 'pseudo',
  catalogs: [
    {
      path: '<rootDir>/src/i18n/locales/{locale}/messages',
      include: ['src']
    }
  ],
  format: formatter({ origins: false })
});
