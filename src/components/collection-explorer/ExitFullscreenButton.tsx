import { FC } from 'react';

export interface ExitFullscreenButtonProps {
  onClick: () => void;
}

export const ExitFullscreenButton: FC<ExitFullscreenButtonProps> = ({ onClick }) => (
  <div className="absolute left-0 top-0 z-50 flex h-[20dvh] w-screen justify-center pt-2 opacity-0 transition-opacity hover:opacity-80">
    <button
      onClick={onClick}
      tabIndex={-1}
      className="bg-paper hover:text-paper size-12 rounded-full pb-1 text-center text-2xl shadow-lg hover:bg-text"
    >
      ×
    </button>
  </div>
);
