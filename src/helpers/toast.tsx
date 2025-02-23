import { Toaster, toast } from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        className: '',
        style: {
          border: '1px solid var(--c0)',
          padding: '16px',
          color: 'var(--c6)',
          backgroundColor: 'var(--c2)'
        },
        success: {
          iconTheme: {
            primary: 'var(--c7)',
            secondary: 'black'
          }
        },
        error: {
          iconTheme: {
            primary: 'var(--c3)',
            secondary: 'var(--c6)'
          }
        }
      }}
    />
  );
};
