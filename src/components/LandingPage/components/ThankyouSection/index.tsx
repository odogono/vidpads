/* eslint-disable @next/next/no-img-element */

import { cn } from '@helpers/tailwind';

export const ThankyouSection = () => {
  return (
    <section className='px-4 py-16 -mx-4'>
      <h2 className='text-3xl font-bold text-blue-400 mb-4'>Thanks to</h2>
      <div className='relative rounded-lg shadow-2xl  aspect-video'>
        <ThankyouItem
          name='Koala Sampler'
          description={[
            'A key inspiration for this project and, quite simply, a perfect music App.',
            `If you haven't tried it yet, you should.`
          ]}
          image='/media/koala.jpg'
          link='https://www.koalasampler.com'
        />
        <ThankyouItem
          reverse
          name='Who Sampled'
          description={[
            'The definitive source for sources of music samples.',
            `I have spent countless hours digging on this site.`
          ]}
          image='/media/whosampled.jpg'
          link='https://www.whosampled.com'
        />
        <ThankyouItem
          name='De La Soul'
          description={['My first hip-hop love ❤️.']}
          image='/media/delasoul.png'
          link='https://www.wearedelasoul.com'
        />
      </div>
    </section>
  );
};

const ThankyouItem = ({
  name,
  description,
  image,
  link,
  reverse = false
}: {
  name: string;
  description: string[];
  image: string;
  link: string;
  reverse?: boolean;
}) => {
  return (
    <a
      href={link}
      target='_blank'
      rel='noopener noreferrer'
      className='mb-4 block opacity-60 hover:opacity-100 transition-opacity'
    >
      <div
        className={cn('flex gap-4 items-center', {
          'flex-row-reverse': reverse,
          'flex-row': !reverse
        })}
      >
        <img
          src={image}
          className='w-[20vw] h-[20vw] aspect-square object-cover rounded-md'
        />

        <div
          className={cn('text-gray-300 w-full flex flex-col', {
            'items-end': reverse
          })}
        >
          <h3 className='text-2xl font-bold text-blue-400 mb-4'>{name}</h3>
          {description.map((item, index) => (
            <p key={index} className='mb-4'>
              {item}
            </p>
          ))}
          <p className='text-c7'>{link.replace('https://', '')}</p>
        </div>
      </div>
    </a>
  );
};
