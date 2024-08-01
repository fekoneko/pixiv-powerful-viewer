import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useOutput } from '@/hooks';
import { twMerge } from 'tailwind-merge';
import { OutputLog } from '@/providers/OutputProvider';

import { Accordion } from './Accordion';

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

// TODO: Make a loading spinner here and near CollectionButton
// Also make some sign when it's hasWarningsOrErrors
// And make a button somewhere to show / hide this accordion without keyboard
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
      mainSection={(isExpanded) => {
        // TODO: Display info / errors / warnings count
        if (isExpanded) return <p>Collection output</p>;
        if (!output) return null;
        if (output.status === 'pending') return <p>Loading collection...</p>;
        if (output.errorsCount) return <p>Failed to load collection</p>;
        if (output.warningsCount) return <p>Some problems occured</p>;
        if (output.infoCount) return <p>Collection output</p>;
        return <p>Collection loaded</p>;
      }}
      rightSection={() => (
        <button
          onClick={toggleHidden}
          className="flex items-baseline rounded-md px-3 pb-2 pt-0.5 text-2xl leading-none hover:bg-text/20 focus:bg-text/20 focus:outline-none"
        >
          ×
        </button>
      )}
      contents={() => (
        <div className="flex flex-col gap-2">
          {output?.logs.map((log, index) => <LogMessage key={index} log={log} />)}
        </div>
      )}
    />
  );
};