import { FC, HTMLAttributes } from 'react';

export interface IconProps extends HTMLAttributes<HTMLElement> {
  src: string;
}

export const Icon: FC<IconProps> = ({ src, ...iProps }) => (
  <i
    {...iProps}
    className={iProps.className ?? 'size-[1em] bg-text-accent'}
    style={{
      mask: `url("${src}") no-repeat center`,
      WebkitMask: `url("${src}") no-repeat center`,
      maskSize: 'contain',
    }}
  />
);
