import { InputVariant } from '../types/custom-components-types';

type InputStyles = {
  base: string;
  variants: Record<InputVariant, string>;
};

export const CustomInput: InputStyles = {
  base: [
    'input',
    'w-full',
    'rounded-xl',
    'transition-all duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ].join(' '),

  variants: {
    default: [
      'input-bordered',
      'bg-base-100'
    ].join(' '),

    search: [
      'input-bordered',
      'bg-base-100',
      'border-primary/20',
      'focus:border-primary'
    ].join(' ')
  }
};