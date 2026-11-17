import { CardVariant } from '../types/custom-components-types';

type CardStyles = {
  base: string;
  variants: Record<CardVariant, string>;
};

export const CustomCard: CardStyles = {
  base: [
    'group',
    'flex',
    'h-full',
    'flex-col',
    'rounded-2xl',
    'transition-all duration-200'
  ].join(' '),

  variants: {
    default: [
      'border',
      'border-secondary/20',
      'bg-base-100',
      'p-5',
      'shadow-sm',
      'hover:shadow-md'
    ].join(' '),

    featured: [
      'border',
      'border-primary/10',
      'bg-base-100',
      'p-6',
      'shadow-lg',
      'hover:shadow-xl',
      'hover:-translate-y-1'
    ].join(' '),

    compact: [
      'border',
      'border-secondary/20',
      'bg-base-100',
      'p-3',
      'shadow-sm'
    ].join(' ')
  }
};
