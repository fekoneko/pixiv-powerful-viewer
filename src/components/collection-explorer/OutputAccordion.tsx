import { FC } from 'react';
import { useOutput } from '@/hooks';

import { Accordion } from './Accordion';
import { OutputLog } from '@/providers/OutputProvider';

const LogMessage: FC<{ log: OutputLog }> = ({ log }) => {
  if (log.status === 'info')
    return (
      <p className="text-sm text-text">
        <span className="rounded border border-text px-1.5">INFO</span> {log.message}
      </p>
    );

  if (log.status === 'warning')
    return (
      <p className="text-text-warning text-sm">
        <span className="border-text-warning rounded border px-1.5">WARNING</span> {log.message}
      </p>
    );

  return (
    <p className="text-text-error text-sm">
      <span className="border-text-error rounded border px-1.5">ERROR</span> {log.message}
    </p>
  );
};

// TODO: Make it automatically hide after some time after completion
// (e.g. make a progress-timer somewhere to indicate how much time is left)
// Also make a loading spinner here and near CollectionButton
export const OutputAccordion: FC = () => {
  const { output, clearOutput } = useOutput();

  if (!output) return null;

  return (
    <Accordion
      hotkey={{ key: 'Space', modifiers: { control: true } }}
      mainSection={() => {
        if (output.status === 'pending') return <p>{output.pendingMessage}</p>;
        if (output.status === 'success') return <p>{output.successMessage}</p>;
        if (output.status === 'error') return <p>{output.errorMessage}</p>;
      }}
      rightSection={() => (
        <button
          onClick={clearOutput}
          className="flex items-baseline rounded-md px-3 pb-2 pt-0.5 text-2xl leading-none hover:bg-text/20 focus:bg-text/20 focus:outline-none"
        >
          ×
        </button>
      )}
      contents={() => (
        <div className="flex flex-col gap-2">
          {output.logs.map((log, index) => (
            <LogMessage key={index} log={log} />
          ))}
        </div>
      )}
    />
  );
};
