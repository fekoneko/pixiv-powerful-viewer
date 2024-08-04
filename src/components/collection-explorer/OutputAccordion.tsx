import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useOutput } from '@/hooks';
import { twMerge } from 'tailwind-merge';
import { OutputLog } from '@/providers/OutputProvider';

import { Accordion } from './Accordion';
import { Icon } from '@/components/common/Icon';
import { loadingSpinner } from '@/assets/icons';

const LogMessage: FC<{ log: OutputLog }> = ({ log }) => {
  let badgeTextColor;
  let bargeBorderColor;

  if (log.status === 'error') {
    badgeTextColor = 'text-text-error';
    bargeBorderColor = 'border-text-error';
  } else if (log.status === 'warning') {
    badgeTextColor = 'text-text-warning';
    bargeBorderColor = 'border-text-warning';
  } else {
    badgeTextColor = 'text-text';
    bargeBorderColor = 'border-text';
  }

  return (
    <p className={twMerge('text-sm', badgeTextColor)}>
      <span className={twMerge('rounded border px-1.5', bargeBorderColor)}>
        {log.status.toUpperCase()}
      </span>{' '}
      {log.message}
    </p>
  );
};

export const OutputAccordion: FC = () => {
  const { output } = useOutput();
  const [isHidden, setIsHidden] = useState(true);

  const toggleHidden = useCallback(() => setIsHidden((prev) => !prev), []);

  useKeyboardEvent(
    'keydown',
    'Backquote',
    (e) => {
      e.preventDefault();
      toggleHidden();
    },
    [toggleHidden],
    { control: true, alt: false },
  );

  useEffect(() => {
    if (!output?.status) setIsHidden(true);
    else setIsHidden(false);
  }, [output?.status]);

  return (
    <Accordion
      className={twMerge(
        'mb-2 transition-all duration-200',
        isHidden && '-mt-12 translate-y-12',
        output?.errorsCount && 'error-flash',
        !output?.errorsCount && output?.warningsCount && 'warning-flash',
        // TODO: Make new(Warnings / Errors)Count (not seen) property
      )}
      // TODO: Should I move isExpanded state a level higher (question mark??)
      hotkey={{ key: 'Space', modifiers: { control: true } }}
      forceCollapsed={isHidden || !output?.logs.length}
      icon={
        output?.status === 'pending'
          ? () => <Icon src={loadingSpinner} className="size-full self-center bg-text-accent" />
          : undefined
      }
      mainSection={(isExpanded) => {
        if (isExpanded) return <p>Collection output</p>;
        if (!output) return null;
        if (output.status === 'pending') return <p>Loading collection...</p>;
        if (output.errorsCount) return <p>Failed to load collection</p>;
        if (output.warningsCount) return <p>Some problems occured</p>;
        if (output.infoCount) return <p>Collection output</p>;
        return <p>Collection loaded</p>;
      }}
      rightSection={() => (
        <>
          <div className="my-0.5 flex items-center gap-2.5">
            <p className="text-text">{output?.infoCount ?? 0}</p>
            <div className="my-2 h-1/2 w-px rounded-full bg-paper-accent pt-px" />
            <p className="text-text-warning">{output?.warningsCount ?? 0}</p>
            <div className="my-2 h-1/2 w-px rounded-full bg-paper-accent pt-px" />
            <p className="text-text-error">{output?.errorsCount ?? 0}</p>
          </div>

          <button
            onClick={toggleHidden}
            className="flex items-baseline rounded-md px-2.5 pb-2 pt-0.5 text-2xl leading-none hover:bg-text/20 focus:bg-text/20 focus:outline-none"
          >
            ×
          </button>
        </>
      )}
      contents={() => (
        <div className="flex flex-col gap-2">
          {output?.logs.map((log, index) => <LogMessage key={index} log={log} />)}
        </div>
      )}
    />
  );
};
