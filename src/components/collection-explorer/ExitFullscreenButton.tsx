import { FC } from 'react';

export interface ExitFullscreenButtonProps {
  onClick: () => void;
}

export const ExitFullscreenButton: FC<ExitFullscreenButtonProps> = ({ onClick }) => (
  <div className="absolute left-0 top-0 z-50 flex h-[20dvh] w-screen justify-center pt-2 opacity-0 transition-opacity hover:opacity-80">
    <button
      onClick={onClick}
      tabIndex={-1}
      className="size-12 rounded-full border border-text/30 bg-background pb-1 text-center text-2xl shadow-lg hover:bg-text hover:text-background"
    >
      ×
    </button>
  </div>
);
