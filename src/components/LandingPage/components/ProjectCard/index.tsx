/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

import { Card, CardBody, CardFooter } from '@heroui/react';

interface ProjectCardProps {
  name: string;
  description?: string;
  image: string;
  link: string;
}

export const ProjectCard = ({
  name,
  description,
  image,
  link
}: ProjectCardProps) => {
  return (
    <Link href={link} className='block hover:opacity-70 transition-opacity'>
      <Card className='vo-project-card py-4 bg-[#323535]  min-h-[21vh]'>
        <CardBody className='vo-project-card-body py-2'>
          <img
            alt='Card background'
            style={{ animationPlayState: 'paused' }}
            className='object-cover rounded-xl max-h-[12vh] hover:[animation-play-state:running]'
            src={image}
          />
        </CardBody>
        <CardFooter className='pb-0 pt-2 px-4 flex-col items-start min-h-[5vh]'>
          <p className='text-tiny uppercase font-bold mb-2'>{name}</p>
          <small className='text-white/70'>{description}</small>
        </CardFooter>
      </Card>
    </Link>
  );
};
