
import { ButtonVariant } from '../types/custom-components-types';

type ButtonStyles = {
  base: string;
  variants: Record<ButtonVariant, string>;
};

export const CustomButton: ButtonStyles = {
  base: [
    'btn',
    'rounded-full',
    'px-8 py-4',
    'font-bold',
    'transition-all duration-200',
    'active:scale-95',
    'focus-visible:outline-2 focus-visible:outline-offset-4'
  ].join(' '),

  variants: {
    primary: 'btn-primary shadow-lg',

    accent: [
      'btn-error',
      'text-white',
      'shadow-[0_10px_20px_-10px_rgba(230,57,70,0.5)]'
    ].join(' '),

    outline: 'btn-outline'
  }
};

export const ButtonLinks: ButtonStyles = {
  base: [
    'btn',
    'whitespace-nowrap',
    'px-4 py-4',
    'text-base md:text-lg',
    'font-bold',
    'no-underline',
    'transition-all duration-200',
    'active:scale-95',
    'focus-visible:outline-2 focus-visible:outline-offset-4'
  ].join(' '),

  variants: {
    primary: 'btn-primary shadow-lg',

    accent: [
      'btn-error',
      'text-white',
      'shadow-[0_10px_20px_-10px_rgba(230,57,70,0.5)]'
    ].join(' '),

    outline: 'btn-ghost'
  }
};
