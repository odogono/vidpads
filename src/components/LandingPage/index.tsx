import { SquarePlay } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@components/Icons/Logo';
import { getCurrentYear } from '@helpers/datetime';
import { useTranslation } from '@i18n/useTranslation';
import { Trans as I18nTrans } from '@lingui/react/macro';
import { ContentSection } from './components/ContentSection';
import { ProjectCard } from './components/ProjectCard';
import { SocialLinks } from './components/SocialLinks';

export const LandingPage = () => {
  const { i18n } = useTranslation();

  return (
    <main
      className='min-h-screen flex flex-col text-white'
      style={{
        backgroundImage: 'linear-gradient(#2e2e2e, #0e0e0e), url(/noise.svg)'
      }}
    >
      {/* Nav section */}
      <nav className='container mx-auto px-4 py-4 flex justify-end'>
        <SocialLinks />
      </nav>

      <div className='container mx-auto px-4 py-16 flex-1'>
        {/* Hero Section */}
        <div className='flex flex-col items-center justify-center text-center py-20 gap-8'>
          <div className='flex flex-col md:flex-row items-center'>
            <span className='mb-6 md:mb-8 md:mr-4 w-[9rem] h-[9rem]'>
              <Logo />
            </span>
            <div>
              <h1 className='text-5xl md:text-8xl md:pt-8 font-bold font-suse mb-6 bg-clip-text text-c6 flex items-start'>
                <I18nTrans>VO Pads</I18nTrans>
                <span className='ml-4 text-sm bg-blue-500 text-white px-2 py-1 rounded-md font-mono uppercase tracking-wider'>
                  Beta
                </span>
              </h1>
              <p className='text-lg md:text-xl text-gray-300 max-w-2xl mb-8'>
                <I18nTrans>
                  Perfomative Video player with editing and sequencing
                </I18nTrans>
              </p>
            </div>
          </div>

          <Link
            href='/player'
            className='group flex items-center gap-2 bg-c7 hover:bg-c7/80 text-c0 px-8 py-3 rounded-full text-lg font-semibold transition-all'
          >
            {i18n._(`Let's Play`)}
            <SquarePlay className='w-6 h-6 group-hover:translate-x-1 transition-transform' />
          </Link>

          {/* Add screenshot */}
          {/* <div className='w-1/3 max-w-4xl mt-8'>
              <div className='relative rounded-lg overflow-hidden shadow-2xl border border-gray-800'>
                <img
                  src='/media/vo-screen.png'
                  alt='VO Pads application interface'
                  className='w-full h-auto'
                  width={1280}
                  height={720}
                />
              </div>
            </div> */}
        </div>

        <section className='px-4 py-16 -mx-4'>
          <h2 className='text-3xl font-bold text-blue-400 mb-4'>
            <I18nTrans>Explore</I18nTrans>
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <ProjectCard
              name='Interactive Drum Machine'
              description='the classic forerunner of VO pads, from 13 years ago'
              image='https://i.imgur.com/9RPOq6m.mp4'
              link='https://is.gd/lumwoV'
            />
            <ProjectCard
              name='Everything Stays'
              description={`Rebecca Sugar's timeless song`}
              image='https://i.imgur.com/uQ7ieo5.mp4'
              link='https://is.gd/hmFlc5'
            />
            <ProjectCard
              name='Time... to die'
              description={`I've seen things you people wouldn't believe...`}
              image='https://i.imgur.com/P4P2kZ1.mp4'
              link='https://is.gd/1sTzi9'
            />
            <ProjectCard
              name='Get Away - De La Soul'
              description='Explore the sample sources from this Wu flavoured track'
              image='https://i.imgur.com/djOiEQt.mp4'
              link='https://is.gd/TbjRYA'
            />
          </div>
        </section>

        {/* Content sections */}
        <div className='space-y-24'>
          <ContentSection
            title='Pad Based Control'
            content='Play videos triggered by pad, keyboard, or MIDI. Set up your perfect performance environment with customizable controls and instant playback.'
            darkBg
          />

          <ContentSection
            title='Edit Playback'
            content='Take full control of your media with precise timing controls. Set the start and duration, adjust playback speed, and fine-tune volume levels for the perfect mix.'
            align='right'
          />

          <ContentSection
            title='Share Your Creation'
            content='Share your entire project with a single URL. No downloads, no installs - just open and play. Perfect for collaboration and live performances.'
            darkBg
          />

          {/* Add FAQ section */}
          <section className='px-4 py-16 -mx-4'>
            <div className='container mx-auto'>
              <h2 className='text-4xl font-bold text-blue-400 mb-12 text-center'>
                <I18nTrans>Frequently Asked Questions</I18nTrans>
              </h2>

              <div className='max-w-3xl mx-auto space-y-8'>
                <FAQSection title={`What is VO Pads`}>
                  <I18nTrans>
                    VO Pads is a web-based video player that lets you trigger
                    and control video clips using a pad-based interface,
                    keyboard, or MIDI controller.
                  </I18nTrans>
                </FAQSection>

                <FAQSection title={`Do I need to install anything?`}>
                  <I18nTrans>
                    No! VO Pads runs entirely in your web browser. Just open the
                    URL and start playing. No downloads or installations
                    required.
                  </I18nTrans>
                </FAQSection>

                <FAQSection title={`What browsers are supported?`}>
                  <p className='text-gray-300'>
                    <I18nTrans>
                      VO Pads is a web app, so it runs on any browser that
                      supports HTML5.
                    </I18nTrans>
                  </p>
                  <p>
                    <I18nTrans>
                      For the best experience, we recommend using Chrome.
                    </I18nTrans>
                  </p>
                  <p>
                    <I18nTrans>
                      Please note that on iOS or iPadOS, only one video can be
                      played at a time.
                    </I18nTrans>
                  </p>
                </FAQSection>

                <FAQSection title={`What video sources are supported?`}>
                  <I18nTrans>
                    Currently, VO Pads supports YouTube videos and local mp4
                    files. Tap on a pad to bring up a selector, where you can
                    add a file, or paste a YouTube URL.
                  </I18nTrans>
                </FAQSection>

                <FAQSection title={`How do I share my project?`}>
                  <I18nTrans>
                    Once you&apos;ve created your project, you can share it with
                    a single URL. Anyone with the link can open and play your
                    project exactly as you&apos;ve set it up.
                  </I18nTrans>
                </FAQSection>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className='w-full border-t border-gray-800'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col items-center gap-4'>
            <SocialLinks />
            <p className='text-gray-400 text-sm text-center'>
              © {getCurrentYear()}{' '}
              <a
                href='https://dev.odgn.net'
                className='text-blue-400 hover:text-blue-300 transition-colors'
                target='_blank'
                rel='noopener noreferrer'
              >
                Alexander Veenendaal
              </a>
              . All rights reserved. Especially those ones.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

const FAQSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className='space-y-2'>
      <h3 className='text-2xl font-semibold text-blue-400'>
        <I18nTrans>{title}</I18nTrans>
      </h3>

      {Array.isArray(children) ? (
        children
      ) : (
        <p className='text-gray-300'>{children}</p>
      )}
    </div>
  );
};
