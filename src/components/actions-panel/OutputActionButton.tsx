import { useOutput } from '@/hooks';
import { FC } from 'react';

export const OutputActionButton: FC = () => {
  const { isOutputShown, toggleOutput } = useOutput();

  return (
    <button
      role="button"
      onClick={toggleOutput}
      tabIndex={1}
      className="order-1 flex size-10 items-center justify-center rounded-md border border-border bg-paper px-[0.58rem] py-2 text-lg shadow-md hover:bg-paper-hover focus:bg-paper-hover focus:outline-none"
    >
      {isOutputShown ? '⚙️' : '⚙️' /* TODO: different icons */}
    </button>
  );
};
