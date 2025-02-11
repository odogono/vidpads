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
              <h1 className='text-5xl md:text-8xl font-bold font-suse mb-6 bg-clip-text text-c6 flex items-center justify-center'>
                <I18nTrans>VO Pads</I18nTrans>
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
        </div>

        <article>
          {/* Features Grid */}
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-16'>
            <FeatureCard
              title={i18n._(`Pad Based Control`)}
              description={i18n._(
                `Play videos triggered by pad, keyboard, or MIDI`
              )}
            />
            <FeatureCard
              title={i18n._(`Edit Playback`)}
              description={i18n._(
                `Set the start and duration, speed, and volume of the video`
              )}
            />
            <FeatureCard
              title={i18n._(`Share`)}
              description={i18n._(
                `Share your project with others via a single URL`
              )}
            />
            <FeatureCard
              title={i18n._(`Serverless`)}
              description={i18n._(
                `No need to install anything, just open the URL`
              )}
            />
            <FeatureCard
              title={i18n._(`Have a great time`)}
              description={i18n._(
                `Have a great time with your friends and family`
              )}
            />
            <FeatureCard
              title={i18n._(`Be a better person`)}
              description={i18n._(
                `Learn to play the drums, guitar, or piano. IDK, I'm not a psychologist.`
              )}
            />
          </div>
        </article>
      </div>

      {/* Copyright Section */}
      <footer className='w-full border-t border-gray-800'>
        <div className='container mx-auto px-4 py-8'>
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
      </footer>
    </main>
  );
}

const FeatureCard = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => (
  <div className='p-6 rounded-xl bg-gray-800/50 backdrop-blur border border-gray-700 hover:border-blue-500/50 transition-all'>
    <h3 className='text-xl font-semibold mb-3 text-blue-400'>{title}</h3>
    <p className='text-gray-400'>{description}</p>
  </div>
);
