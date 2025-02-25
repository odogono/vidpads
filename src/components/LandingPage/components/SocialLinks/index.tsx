import { IconBluesky } from '@components/Icons/bluesky';
import { IconDiscord } from '@components/Icons/discord';
import { IconGithub } from '@components/Icons/github';
import { IconTwitter } from '@components/Icons/twitter';

const SocialLink = ({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      className='text-gray-400 hover:text-blue-400 transition-colors'
      target='_blank'
      rel='noopener noreferrer'
      aria-label={label}
    >
      {children}
    </a>
  );
};

export const SocialLinks = () => {
  return (
    <div className='flex items-center gap-4'>
      <SocialLink href='https://bsky.app/profile/vo.odgn.net' label='Bluesky'>
        <IconBluesky size='small' fill='#888' />
      </SocialLink>
      <SocialLink
        href='https://github.com/odogono/video-operator-pads'
        label='GitHub'
      >
        <IconGithub size='small' fill='#888' />
      </SocialLink>
      <SocialLink
        href='https://discord.com/channels/1343830946734145567/1343834241141837916'
        label='Discord'
      >
        <IconDiscord size='small' fill='#888' />
      </SocialLink>
      <SocialLink href='https://x.com/vopads' label='Twitter'>
        <IconTwitter size='small' fill='#888' />
      </SocialLink>
    </div>
  );
};
