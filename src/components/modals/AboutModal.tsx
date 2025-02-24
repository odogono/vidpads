import { BUILT_AT } from '@/buildTime.config';
import { dateToLocaleString, getCurrentYear } from '@helpers/datetime';
import { CommonModal, CommonModalBase } from './CommonModal';

const VERSION = process.env.VERSION;

export const AboutModal = ({ ref }: CommonModalBase) => {
  return (
    <CommonModal ref={ref} showCancel={false}>
      <div className='flex flex-col gap-4'>
        <div className='text-center'>
          <p className=' mb-2 text-xl font-bold'>Video Operator Pads</p>
          <p className=' mb-8'>
            Made with 🤪 by{' '}
            <a href='https://dev.odgn.net'>Alexander Veenendaal</a>
          </p>
          <div className='mb-2 text-sm '>Version {VERSION}</div>
          <div className='mb-2 text-sm '>
            Built on {dateToLocaleString(BUILT_AT)}
          </div>
          <p className='mb-2 text-sm'>
            © {getCurrentYear()} Alexander Veenendaal
          </p>
        </div>
      </div>
    </CommonModal>
  );
};
