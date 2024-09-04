import { forwardRef, HTMLAttributes } from 'react';

export interface IconProps extends HTMLAttributes<HTMLElement> {
  src: string;
}

export const Icon = forwardRef<HTMLElement, IconProps>(({ src, ...iProps }, ref) => (
  <i
    ref={ref}
    {...iProps}
    className={iProps.className ?? 'size-[1em] bg-text-accent'}
    style={{
      mask: `url("${src}") no-repeat center`,
      WebkitMask: `url("${src}") no-repeat center`,
      maskSize: 'contain',
    }}
  />
));
