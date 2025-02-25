/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';

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
  const isVideo = image.endsWith('.mp4');
  const videoRef = useRef<HTMLVideoElement>(null);

  const startVideo = () =>
    isVideo && videoRef.current && videoRef.current.play();

  const stopVideo = () =>
    isVideo && videoRef.current && videoRef.current.pause();

  const handlePointerEnter = (e: React.PointerEvent) =>
    e.pointerType === 'mouse' && startVideo();

  const handlePointerLeave = (e: React.PointerEvent) =>
    e.pointerType === 'mouse' && stopVideo();

  const handlePointerDown = (e: React.PointerEvent) =>
    e.pointerType === 'touch' && startVideo();

  const handlePointerUp = (e: React.PointerEvent) =>
    e.pointerType === 'touch' && stopVideo();

  return (
    <Link href={link} className='block hover:opacity-70 transition-opacity'>
      <Card
        className='vo-project-card py-4 bg-[#323535] min-h-[21vh]'
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <CardBody className='vo-project-card-body py-2'>
          {isVideo ? (
            <video
              ref={videoRef}
              src={image}
              className='object-cover rounded-xl max-h-[12vh] hover:[animation-play-state:running]'
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={image}
              alt='Card background'
              className='object-cover rounded-xl max-h-[12vh]'
            />
          )}
        </CardBody>
        <CardFooter className='pb-0 pt-2 px-4 flex-col items-start min-h-[5vh]'>
          <p className='text-tiny uppercase font-bold mb-2'>{name}</p>
          <small className='text-white/70'>{description}</small>
        </CardFooter>
      </Card>
    </Link>
  );
};
