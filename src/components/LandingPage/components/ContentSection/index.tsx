import { Trans as I18nTrans } from '@lingui/react/macro';

interface ContentSectionProps {
  title: string;
  content: string;
  align?: 'left' | 'right';
  darkBg?: boolean;
}

export const ContentSection = ({
  title,
  content,
  align = 'left',
  darkBg = false
}: ContentSectionProps) => {
  return (
    <section className={`px-4 py-16 -mx-4 ${darkBg ? 'bg-gray-800/30' : ''}`}>
      <div className='container mx-auto'>
        <div
          className={`max-w-3xl ${align === 'right' ? 'ml-auto text-right' : ''}`}
        >
          <h2 className='text-3xl font-bold text-blue-400 mb-4'>
            <I18nTrans>{title}</I18nTrans>
          </h2>
          <p className='text-xl text-gray-300'>
            <I18nTrans>{content}</I18nTrans>
          </p>
        </div>
      </div>
    </section>
  );
};
