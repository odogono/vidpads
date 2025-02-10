'use client';

import { useState } from 'react';

import { setupI18n, type Messages } from '@lingui/core';
import { I18nProvider as LinguiI18nProvider } from '@lingui/react';

export const I18nProvider = ({
  children,
  initialLocale,
  initialMessages
}: {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: Messages;
}) => {
  const [i18n] = useState(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages }
    });
  });
  return <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>;
};
