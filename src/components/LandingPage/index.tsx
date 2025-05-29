import { SquarePlay } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@components/Icons/Logo';
import { getCurrentYear } from '@helpers/datetime';
import { ContentSection } from './components/ContentSection';
import { ProjectCard } from './components/ProjectCard';
import { SocialLinks } from './components/SocialLinks';
import { ThankyouSection } from './components/ThankyouSection';

export const LandingPage = () => {
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
                VO Pads
                <span className='ml-4 text-sm bg-blue-500 text-white px-2 py-1 rounded-md font-mono uppercase tracking-wider'>
                  Beta
                </span>
              </h1>
              <p className='text-lg md:text-xl text-gray-300 max-w-2xl mb-8'>
                Expressive Video player with editing and sequencing
              </p>
            </div>
          </div>

          <Link
            href='/player'
            className='group flex items-center gap-2 bg-c7 hover:bg-c7/80 text-c0 px-8 py-3 rounded-full text-lg font-semibold transition-all'
          >
            {`Let's Play`}
            <SquarePlay className='w-6 h-6 group-hover:translate-x-1 transition-transform' />
          </Link>
        </div>

        <section className='px-4 py-16 -mx-4'>
          <h2 className='text-3xl font-bold text-blue-400 mb-4'>Demo</h2>
          <div className='relative rounded-lg overflow-hidden shadow-2xl border border-gray-800 aspect-video'>
            <iframe
              src='https://www.youtube.com/embed/R0DIJ43FIp0'
              title='Assembling: Get Away - De La Soul'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='absolute top-0 left-0 w-full h-full'
            />
          </div>
        </section>

        <section className='px-4 py-16 -mx-4'>
          <h2 className='text-3xl font-bold text-blue-400 mb-4'>Explore</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <ProjectCard
              name='Interactive Drum Machine'
              description='the classic forerunner of VO pads, from 13 years ago'
              image='https://i.imgur.com/9RPOq6m.mp4'
              link='https://vo.odgn.net/player?p=ea0ae7c925&d=4%7CeJyV0MtOwkAUBuBXcdmEOMyZa%2BckLEQtYtIFl6Kkq%2BlQbbFFAhWpaXx203gjsRu3k%2FP955%2BTWmpT7QyTzXhTpTvrqvyQnl3tXsqz0Los36RNVlXbPfb7OcnLx5cdcc9lf701N2rIyWP%2B0IDmxlfMKNOAFlQY42vWWIgTnJTBm6ujOrye1qs7WoTri2Nvj%2B81r6fH89VK37p9r0KGjBime1sEpIieZXGCEZOZK6MiXA%2Bv3WZR3c7Hr%2BFkMOjwAiWRTHx5hp7l%2FwtQqAlo%2BVtAtOXZ8eDY4ql1s9FTmzNe3k%2B6vE8oSDSEi%2B8SgJ6VcYJzPiySvL1Atv0MCmhHAFAEIELxE67iBGejYmMvozoMpoekuzswBE64PjmfbhePDG8XLkam6lICQRJh1K%2Fy2z%2FzolqWwb5LaKIBwRBFf1DTGBpb8ARXhqJlnq%2B5j1Z8P0iPgS9k73QEpGB%2FRz4AXGW%2FAQ%3D%3D'
            />
            <ProjectCard
              name='Everything Stays'
              description={`Rebecca Sugar's timeless song`}
              image='https://i.imgur.com/uQ7ieo5.mp4'
              link='https://vo.odgn.net/player?p=accfc80890&d=4%7CeJyt1Mtu2kAUBuBX6dIS0jD3y5G6aKNgSgtSIIDjrMaYWzMYFC6tEeqzd8aEikbuiq5sWeg7%2F%2FnN2E4ms4nG2uDT%2FWH6Wu4Wy2L%2BYbCz5fa02O02W2g2l2i5mu9f0WS9ai52X6f0Pkbz5exEFMeUc81odcuN4ZicLHnO4DEe4Q7ruu73z0VWDstu7Padxy8%2F8njhwjWlrTKNR%2FvGFn6VWa%2BY7Q935JsbNnZAFVKSAaNICNbYAAEMQCJLPTtcucK2HwKLbTwq04Gn2%2Fk6TToVOx0bEq5ZPFrld9VYXDPibAPTiGlyNYL5ESO6cNkysO6QBz5ON9mqtc3aL2Hsyo7FSxhhk4ePdbRG0hDgDGmmrmge6Lflc0%2F4xEc77rszVRW1teN8nfutaljOgZsrTtzWseBISgHChLAXlkZW%2Fr%2BOvW0YAcmRFupqhLq9YymQMAoURpLrK1rf1rEioMQ70niyn6RuUjhfhtunoed2Dz8l7lhHCKSUBqMQ5%2FKKIdg7D4V%2FX%2BetQpRjHrttVhXYWz%2BNRZEm3bptNUbaaNAV7U18McklW9Vk7xDsCf25SekC%2ByZrrbd8BBH%2BlxUO12DMzxUlfZzFw3DP%2FrGnB%2Fy5ByPfZwonaFC90f4hW%2BbVvjlt7as%2FSrt%2FyejS5FNdPoOoNEA5IvRPfacTe7YkYlRJDVZGRDLNwbJIE0PBmohQ%2F1xHHBsJVkQU%2B2SWRsR%2Fm8CqSBD%2FKx5RIX8DgwaDbg%3D%3D'
            />
            <ProjectCard
              name='Time... to die'
              description={`I've seen things you people wouldn't believe...`}
              image='https://i.imgur.com/P4P2kZ1.mp4'
              link='https://vo.odgn.net/player?p=b4df7802a9&d=4%7CeJx1Uttu4jAQ%2FZU%2BRkIyHtshsaU%2BdFvVgAoSlyQlPNnJFlI5JSp3FPXbVzagBSl9mvHlzDlnZjTLP4IQE8XraVH%2BRQg9TFcPL4XN6uVmU61Fu12golxsv1G2KtvPJ77p5Qotio8aAoYZUKDknPKQhVArmGsxmeQknUTHQXdo0oSZwecfrKTZpnRgc1%2FTyMZ9mvC9li6nmsbrVLKv%2FDk6DmTfaGlMXkaPrbX4OQ5XT6dKwSH4jFobAZijoCMAAsQxeIrMtRi9j%2FEsGX73p719RJZV1nVUO13YcmmVlY5ml5azixx3PinJQcuxydw%2FXlq8pv1KE9ZIfeYUQBgKcegpemc3X%2BZyuEqTka398pb0zSyBk62ZkkOVd688Zmvvcrk07k2%2BHtXR3vtm9t671RfNEn87ka%2BQkfjYpOesQwAFFIDvKWZ7kRzWl%2Fq7jLg6G03A6K%2Bx05ITs9aXNju%2Fkp%2Fyp8dGv9RHhPkCfIYIEE%2F5cy1iaTbphG3frJfueHf2YEwT3u8gTEMBHYw4ZZ7i136Nmvmuo8WI%2BWGrEiCwEMRTgOdaRCQ2etEMBECMMBc5vUOCk7ysdJmfGpEEYRa62OncAu1eJQmHX0AcAgFAEWXkFmU3IpLxLpOHxo6cEQKAIYyDW6SdXUzcPm77dNRskyFMAhepf8drJzMq47VK4l%2B7CwyxjuX2EaX%2Fuev6H96KOU0%3D'
            />
            <ProjectCard
              name='Get Away - De La Soul'
              description='Explore the sample sources from this Wu flavoured track'
              image='https://i.imgur.com/djOiEQt.mp4'
              link='https://vo.odgn.net/player?p=eeb3a4d99b&d=4%7CeJxtzN2KE0EQBeBXmcuGxkqf7qr%2BqbusrisYxSAO6FxIR8cYzJo1OzEuDD67ZBSikrtTdT5O369C5Y%2BlrMYnfbOozevdYds8am76oZkf68P4eRju7nU229Dmdn3Y04fd7Sw8Xi%2F3Ny2tN59GpFAyfGE%2FInEWccgyVnT3%2BvOhrPyLtkX4Mf9iBxUKgBYq2W7V2TuFOlVT%2FWRbXh6eve%2BfvuG3dlAQmJXJhfgvlgnL9feX26t5vWpPwxDnKUU5BaEgcubxEufCFDmcQiInOPN0eT2TD1EhcBTTXzxf5HBUCk6BCems4Sa%2BmC%2FX27RLZcETp%2BKhXsgLTAX%2BN6YiTL93u%2F3x%2Bfz47dXXaztocMSKlKd5qGKMrkPnuui66k2hjKyecvG2wgDKFGOxNRsE8qKBkIqt8uf0JMXWZMDqiYPYGg3kd8Muj6mrYgJnRK3ReIhjrclkFK81G4H%2FBUJanEQ%3D'
            />
          </div>
        </section>

        <section className='px-4 py-16 -mx-4'>
          <h2 className='text-3xl font-bold text-blue-400 mb-4'>Overview</h2>
          <div className='relative rounded-lg overflow-hidden shadow-2xl border border-gray-800 aspect-video'>
            <iframe
              src='https://www.youtube.com/embed/fIHXmgrRzSc'
              title='VO Pads Demo'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='absolute top-0 left-0 w-full h-full'
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
                Frequently Asked Questions
              </h2>

              <div className='max-w-3xl mx-auto space-y-8'>
                <FAQSection title={`What is VO Pads`}>
                  VO Pads is a web-based video player that lets you trigger and
                  control video clips using a pad-based interface, keyboard, or
                  MIDI controller.
                </FAQSection>

                <FAQSection title={`Do I need to install anything?`}>
                  No! VO Pads runs entirely in your web browser. Just open the
                  URL and start playing. No downloads or installations required.
                </FAQSection>

                <FAQSection title={`What browsers are supported?`}>
                  <p className='text-gray-300'>
                    VO Pads is a web app, so it runs on any browser that
                    supports HTML5.
                  </p>
                  <p>For the best experience, we recommend using Chrome.</p>
                  <p>
                    Please note that on iOS or iPadOS, only one video can be
                    played at a time.
                  </p>
                </FAQSection>

                <FAQSection title={`What video sources are supported?`}>
                  Currently, VO Pads supports YouTube videos and local mp4
                  files. Tap on a pad to bring up a selector, where you can add
                  a file, or paste a YouTube URL.
                </FAQSection>

                <FAQSection title={`How do I share my project?`}>
                  Once you&apos;ve created your project, you can share it with a
                  single URL. Anyone with the link can open and play your
                  project exactly as you&apos;ve set it up.
                </FAQSection>
              </div>
            </div>
          </section>

          <ThankyouSection />
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
      <h3 className='text-2xl font-semibold text-blue-400'>{title}</h3>

      {Array.isArray(children) ? (
        children
      ) : (
        <p className='text-gray-300'>{children}</p>
      )}
    </div>
  );
};
