import { useLingui } from '@lingui/react/macro';

// export { msg, t } from '@lingui/core/macro';
// export { Trans } from '@lingui/react/macro';

export const useTranslation = () => {
  const { i18n } = useLingui();

  return { i18n };
};
