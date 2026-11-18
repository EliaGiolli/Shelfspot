
import { FormVariant } from '../types/custom-components-types';

interface FormStyles {
  base: string;
  variants: Record<FormVariant, string>;
}

export const CustomForm: FormStyles = {
  base: [
    'flex',
    'flex-col',
    'gap-6',
    'w-full',
    'rounded-2xl',
    'transition-all duration-200'
  ].join(' '),

  variants: {
    default: [
      'max-w-3xl',
      'mx-auto',
      'bg-base-100',
      'p-8',
      'shadow-md',
      'border',
      'border-base-300'
    ].join(' '),

    auth: [
      'max-w-md',
      'mx-auto',
      'bg-base-100',
      'p-8',
      'shadow-lg',
      'border',
      'border-base-300'
    ].join(' ')
  }
};
