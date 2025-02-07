import 'server-only';

import Link from 'next/link';

import { ArrowRightIcon } from '@heroicons/react/24/solid';

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-gray-900 to-black text-white'>
      <div className='container mx-auto px-4 py-16'>
        {/* Hero Section */}
        <div className='flex flex-col items-center justify-center text-center py-20'>
          <h1 className='text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500'>
            Video Operator Pads
          </h1>
          <p className='text-xl text-gray-300 max-w-2xl mb-8'>
            Professional video sequencing and control system for live
            performances and installations
          </p>
          <Link
            href='/player'
            className='group flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all'
          >
            Let&apos;s Play
            <ArrowRightIcon className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
          </Link>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-16'>
          <FeatureCard
            title='Video Sequencing'
            description='Create complex video sequences with precise timing and control'
          />
          <FeatureCard
            title='MIDI Integration'
            description='Full MIDI support for hardware control surfaces and automation'
          />
          <FeatureCard
            title='Real-time Processing'
            description='Hardware-accelerated video processing with minimal latency'
          />
          <FeatureCard
            title='Multi-format Support'
            description='Support for various video formats and codecs using FFmpeg'
          />
          <FeatureCard
            title='Timeline Control'
            description='Advanced timeline controls with frame-accurate playback'
          />
          <FeatureCard
            title='Custom Triggers'
            description='Create custom triggers and automation sequences'
          />
        </div>
        <div className='grid grid-cols-4 gap-4'>
          <div className='rounded-xl bg-foreground p-4 w-32 h-32 text-background'>
            foreground
          </div>
          <div className='rounded-xl bg-background p-4 w-32 h-32 text-foreground'>
            background
          </div>
          <div className='rounded-xl bg-c0 p-4 w-32 h-32'>c0</div>
          <div className='rounded-xl bg-c1 p-4 w-32 h-32'>c1</div>
          <div className='rounded-xl bg-c2 p-4 w-32 h-32'>c2</div>
          <div className='rounded-xl bg-c3 p-4 w-32 h-32'>c3</div>
          <div className='rounded-xl bg-c4 p-4 w-32 h-32'>c4</div>
          <div className='rounded-xl bg-c5 p-4 w-32 h-32'>c5</div>
          <div className='rounded-xl bg-c6 p-4 w-32 h-32'>c6</div>
          <div className='rounded-xl bg-c7 p-4 w-32 h-32'>c7</div>
          <div className='rounded-xl bg-c8 p-4 w-32 h-32'>c8</div>
          <div className='rounded-xl bg-c9 p-4 w-32 h-32'>c9</div>
        </div>
      </div>
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
