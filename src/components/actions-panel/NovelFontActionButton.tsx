import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export interface NovelFontActionButtonProps {
  fontSrc?: string;
  onClick?: () => void;
}

export const NovelFontActionButton: FC<NovelFontActionButtonProps> = ({ fontSrc, onClick }) => (
  <>
    {fontSrc && (
      <style>
        {`@font-face {
          font-family: 'novel-font-action-button-font';
          src: url(${fontSrc});
        }`}
      </style>
    )}

    <button
      onClick={onClick}
      tabIndex={4}
      className={twMerge(
        'order-4 flex size-10 items-center justify-center rounded-md border border-border bg-paper px-[0.58rem] pb-3 pt-2 text-xl shadow-md hover:bg-paper-hover focus:bg-paper-hover focus:outline-none',
        fontSrc && 'font-[novel-font-action-button-font]',
      )}
    >
      A
    </button>
  </>
);
