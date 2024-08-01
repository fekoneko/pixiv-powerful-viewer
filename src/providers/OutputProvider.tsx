import { createContext, FC, PropsWithChildren, useCallback, useState } from 'react';

export interface Output {
  status: OutputStatus;
  logs: OutputLog[];
  infoCount: number;
  warningsCount: number;
  errorsCount: number;
}

export interface OutputLog {
  message: string;
  status: OutputLogStatus;
}

export type OutputStatus = 'pending' | 'settled';

export type OutputLogStatus = 'info' | 'warning' | 'error';

export interface OutputContextValue {
  output: Output | null;

  newOutput: () => void;
  settleOutput: () => void;
  logToOutput: (message: string, status?: OutputLogStatus) => void;
}

export const OutputContext = createContext<OutputContextValue | null>(null);

export const OutputProvider: FC<PropsWithChildren> = ({ children }) => {
  const [output, setOutput] = useState<Output | null>(null);

  const newOutput = useCallback(() => {
    setOutput({ status: 'pending', logs: [], infoCount: 0, warningsCount: 0, errorsCount: 0 });
  }, []);

  const settleOutput = useCallback(() => {
    setOutput((output) => (output ? { ...output, status: 'settled' } : null));
  }, []);

  const logToOutput = useCallback((message: string, status: OutputLogStatus = 'info') => {
    setOutput((output) => {
      if (!output) return null;

      const logs = [...output.logs, { message, status }];
      if (status === 'info') return { ...output, infoCount: output.infoCount + 1, logs };
      if (status === 'warning') return { ...output, warningsCount: output.infoCount + 1, logs };
      if (status === 'error') return { ...output, errorsCount: output.infoCount + 1, logs };
      return output;
    });
  }, []);

  return (
    <OutputContext.Provider
      value={{
        output,
        newOutput,
        settleOutput,
        logToOutput,
      }}
    >
      {children}
    </OutputContext.Provider>
  );
};
