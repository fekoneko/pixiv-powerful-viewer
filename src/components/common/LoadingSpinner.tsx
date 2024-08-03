import { FC, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const LoadingSpinner: FC<HTMLAttributes<HTMLElement>> = (iProps) => {
  return (
    <i {...iProps} className={twMerge('animate-spin', iProps.className)}>
      ◐
    </i>
  );
};
