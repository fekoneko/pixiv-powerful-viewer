import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useKeyboardEvent, useOutput, useTimeout } from '@/hooks';
import { twMerge } from 'tailwind-merge';
import { OutputLog } from '@/providers/OutputProvider';

import { Accordion } from './Accordion';

const LogMessage: FC<{ log: OutputLog }> = ({ log }) => {
  if (log.status === 'info')
    return (
      <p className="text-sm text-text">
        <span className="rounded border border-text px-1.5">INFO</span> {log.message}
      </p>
    );

  if (log.status === 'warning')
    return (
      <p className="text-sm text-text-warning">
        <span className="rounded border border-text-warning px-1.5">WARNING</span> {log.message}
      </p>
    );

  return (
    <p className="text-sm text-text-error">
      <span className="rounded border border-text-error px-1.5">ERROR</span> {log.message}
    </p>
  );
};

// TODO: Make a loading spinner here and near CollectionButton
// Also make some sign when it's hasWarningsOrErrors
// And make a button somewhere to show / hide this accordion without keyboard
export const OutputAccordion: FC = () => {
  const { output } = useOutput();
  const [isHidden, setIsHidden] = useState(true);
  const [, updateHidingTimeout] = useTimeout();

  const hasWarningsOrErrors = useMemo(
    () => output?.logs.find((log) => log.status !== 'info'),
    [output],
  );

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
    if (output?.status === 'pending' || output?.status === 'error' || hasWarningsOrErrors) {
      setIsHidden(false);
    } else if (output?.status === 'success') {
      updateHidingTimeout(() => setIsHidden(true), 1000);
    } else {
      setIsHidden(true);
    }
  }, [output?.status, updateHidingTimeout, hasWarningsOrErrors]);

  return (
    <Accordion
      className={twMerge('mb-2 transition-all duration-200', isHidden && '-mt-12 translate-y-12')}
      // TODO: Should I move isExpanded state a level higher (question mark??)
      hotkey={{ key: 'Space', modifiers: { control: true } }}
      forceCollapsed={isHidden || output?.logs.length === 0}
      mainSection={() => {
        if (output?.status === 'pending') return <p>{output.pendingMessage}</p>;
        if (output?.status === 'success') return <p>{output.successMessage}</p>;
        if (output?.status === 'error') return <p>{output.errorMessage}</p>;
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
