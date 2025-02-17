/* eslint-disable @next/next/no-img-element */
import 'server-only';

import { SquarePlay } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '@i18n/useTranslation';
import { Trans as I18nTrans } from '@lingui/react/macro';
import { Logo } from '../components/Logo';
import { getCurrentYear } from '../helpers/datetime';

export default function LandingPage() {
  const { i18n } = useTranslation();
  return (
    <main
      className='min-h-screen flex flex-col text-white'
      style={{
        backgroundImage: 'linear-gradient(#212d31, #091011), url(/noise.svg)'
      }}
    >
      <div className='container mx-auto px-4 py-16 flex-1'>
        {/* Hero Section */}
        <div className='flex flex-col items-center justify-center text-center py-20 gap-8'>
          <div className='flex flex-col md:flex-row items-center'>
            <span className='mb-6 md:mb-0 md:mr-4 w-[9rem] h-[9rem]'>
              <Logo />
            </span>
            <div>
              <h1 className='text-5xl md:text-8xl font-bold font-suse mb-6 bg-clip-text text-c6 flex items-start'>
                <I18nTrans>VO Pads</I18nTrans>
                <span className='ml-4 text-sm bg-blue-500 text-white px-2 py-1 rounded-md font-mono uppercase tracking-wider'>
                  Beta
                </span>
              </h1>
              <p className='text-lg md:text-xl text-gray-300 max-w-2xl mb-8'>
                <I18nTrans>Pad based Video playback and control</I18nTrans>
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
          <div className='w-2/3 max-w-4xl mt-8'>
            <div className='relative rounded-lg overflow-hidden shadow-2xl border border-gray-800'>
              <img
                src='/media/vo-screen.png'
                alt='VO Pads application interface'
                className='w-full h-auto'
                width={1280}
                height={720}
              />
            </div>
          </div>
        </div>

        {/* Replace the article and FeatureCard components with these sections */}
        <div className='space-y-24'>
          <section className='px-4 py-16 -mx-4 bg-gray-800/30'>
            <div className='container mx-auto'>
              <div className='max-w-3xl'>
                <h2 className='text-3xl font-bold text-blue-400 mb-4'>
                  <I18nTrans>Pad Based Control</I18nTrans>
                </h2>
                <p className='text-xl text-gray-300'>
                  <I18nTrans>
                    Play videos triggered by pad, keyboard, or MIDI. Set up your
                    perfect performance environment with customizable controls
                    and instant playback.
                  </I18nTrans>
                </p>
              </div>
            </div>
          </section>

          <section className='px-4 py-16 -mx-4'>
            <div className='container mx-auto'>
              <div className='max-w-3xl ml-auto text-right'>
                <h2 className='text-3xl font-bold text-blue-400 mb-4'>
                  <I18nTrans>Edit Playback</I18nTrans>
                </h2>
                <p className='text-xl text-gray-300'>
                  <I18nTrans>
                    Take full control of your media with precise timing
                    controls. Set the start and duration, adjust playback speed,
                    and fine-tune volume levels for the perfect mix.
                  </I18nTrans>
                </p>
              </div>
            </div>
          </section>

          <section className='px-4 py-16 -mx-4 bg-gray-800/30'>
            <div className='container mx-auto'>
              <div className='max-w-3xl'>
                <h2 className='text-3xl font-bold text-blue-400 mb-4'>
                  <I18nTrans>Share Your Creation</I18nTrans>
                </h2>
                <p className='text-xl text-gray-300'>
                  <I18nTrans>
                    Share your entire project with a single URL. No downloads,
                    no installs - just open and play. Perfect for collaboration
                    and live performances.
                  </I18nTrans>
                </p>
              </div>
            </div>
          </section>

          {/* Add FAQ section */}
          <section className='px-4 py-16 -mx-4'>
            <div className='container mx-auto'>
              <h2 className='text-4xl font-bold text-blue-400 mb-12 text-center'>
                <I18nTrans>Frequently Asked Questions</I18nTrans>
              </h2>

              <div className='max-w-3xl mx-auto space-y-8'>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-blue-400'>
                    <I18nTrans>What is VO Pads?</I18nTrans>
                  </h3>
                  <p className='text-gray-300'>
                    <I18nTrans>
                      VO Pads is a web-based video player that lets you trigger
                      and control video clips using a pad-based interface,
                      keyboard, or MIDI controller.
                    </I18nTrans>
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-blue-400'>
                    <I18nTrans>Do I need to install anything?</I18nTrans>
                  </h3>
                  <p className='text-gray-300'>
                    <I18nTrans>
                      No! VO Pads runs entirely in your web browser. Just open
                      the URL and start playing. No downloads or installations
                      required.
                    </I18nTrans>
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-blue-400'>
                    <I18nTrans>What browsers are supported?</I18nTrans>
                  </h3>
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
                </div>

                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-blue-400'>
                    <I18nTrans>What video sources are supported?</I18nTrans>
                  </h3>
                  <p className='text-gray-300'>
                    <I18nTrans>
                      Currently, VO Pads supports YouTube videos and local mp4
                      files. Tap on a pad to bring up a selector, where you can
                      add a file, or paste a YouTube URL.
                    </I18nTrans>
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-blue-400'>
                    <I18nTrans>How do I share my project?</I18nTrans>
                  </h3>
                  <p className='text-gray-300'>
                    <I18nTrans>
                      Once you've created your project, you can share it with a
                      single URL. Anyone with the link can open and play your
                      project exactly as you've set it up.
                    </I18nTrans>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Copyright Section */}
      <footer className='w-full border-t border-gray-800'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col items-center gap-4'>
            <div className='flex items-center gap-4'>
              <a
                href='https://bsky.app/profile/vo.odgn.net'
                className='text-gray-400 hover:text-blue-400 transition-colors'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Bluesky'
              >
                <svg
                  className='w-12 h-12'
                  viewBox='0 0 1024 1024'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M351.121 315.106C416.241 363.994 486.281 463.123 512 516.315C537.719 463.123 607.759 363.994 672.879 315.106C719.866 279.83 796 252.536 796 339.388C796 356.734 786.055 485.101 780.222 505.943C759.947 578.396 686.067 596.876 620.347 585.691C735.222 605.242 764.444 670.002 701.333 734.762C581.473 857.754 529.061 703.903 515.631 664.481C513.169 657.254 512.017 653.873 512 656.748C511.983 653.873 510.831 657.254 508.369 664.481C494.939 703.903 442.527 857.754 322.667 734.762C259.556 670.002 288.778 605.242 403.653 585.691C337.933 596.876 264.053 578.396 243.778 505.943C237.945 485.101 228 356.734 228 339.388C228 252.536 304.134 279.83 351.121 315.106Z'
                    fill='#1185FE'
                  />
                </svg>
              </a>
              <a
                href='https://x.com/vopads'
                className='text-gray-400 hover:text-blue-400 transition-colors'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Twitter'
              >
                <svg
                  className='w-6 h-6'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </svg>
              </a>
            </div>

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
}
