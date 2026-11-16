// This configuration tries to mimic the behavior of the combination between CVA and CLSX libraries
import { ButtonVariant } from '../types/custom-components-types';

type ButtonStyles = {
  base: string;
  variants: Record<ButtonVariant, string>;
};

export const CustomButton: ButtonStyles = {
  base: [
    'inline-flex items-center justify-center',
    'rounded-full px-8 py-4',
    'font-bold transition-all duration-200',
    'active:scale-95',
    'focus-within:outline-hidden',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale'
  ].join(' '),

  variants: {
    primary: 'bg-primary text-secondary shadow-lg hover:bg-primary/90',

    accent: [
      'bg-danger text-white',
      'shadow-[0_10px_20px_-10px_rgba(230,57,70,0.5)]',
      'hover:bg-danger/90'
    ].join(' '),

    outline: [
      'border-2 border-primary text-primary',
      'hover:bg-primary hover:text-secondary'
    ].join(' ')
  }
};

export const ButtonLinks: ButtonStyles = {
  base: [
    'inline-flex items-center justify-center w-full',
    // whitespace-nowrap prevents text from wrapping within an element 
    'whitespace-nowrap',
    'px-4 py-4',
    'font-bold transition-all duration-200 text-base md:text-lg',
    'no-underline',
    'active:scale-95',
    'focus-within:outline-hidden',
    'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:grayscale'
  ].join(' '),

  variants: {
    primary: 'bg-accent text-secondary shadow-lg hover:bg-primary/90 rounded-full',

    accent: [
      'bg-danger text-white rounded-full',
      'shadow-[0_10px_20px_-10px_rgba(230,57,70,0.5)]',
      'hover:bg-danger/90'
    ].join(' '),

    outline: [
      'text-primary',
      'hover:border-b-2 hover:border-primary '
    ].join(' ')
  }
};
