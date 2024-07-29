import { createContext, FC, PropsWithChildren, useCallback, useState } from 'react';

export interface Output {
  pendingMessage: string;
  successMessage: string;
  errorMessage: string;
  logs: OutputLog[];
  status: OutputStatus;
}

export interface OutputLog {
  message: string;
  status: OutputLogStatus;
}

export type OutputStatus = 'pending' | 'success' | 'error';

export type OutputLogStatus = 'info' | 'warning' | 'error';

export interface OutputContextValue {
  output: Output | null;
  newOutput: (output: Omit<Output, 'logs' | 'status'>) => void;
  updateOutputStatus: (status: OutputStatus) => void;
  logToOutput: (message: string, status?: OutputLogStatus) => void;
  clearOutput: () => void;
}

export const OutputContext = createContext<OutputContextValue | null>(null);

export const OutputProvider: FC<PropsWithChildren> = ({ children }) => {
  const [output, setOutput] = useState<Output | null>(null);

  const newOutput = useCallback((output: Omit<Output, 'logs' | 'status'>) => {
    setOutput({ ...output, logs: [], status: 'pending' });
  }, []);

  const updateOutputStatus = useCallback((status: OutputStatus) => {
    setOutput((output) => (output ? { ...output, status } : null));
  }, []);

  const logToOutput = useCallback((message: string, status: OutputLogStatus = 'info') => {
    setOutput((output) =>
      output ? { ...output, logs: [...output.logs, { message, status }] } : null,
    );
  }, []);

  const clearOutput = useCallback(() => {
    setOutput(null);
  }, []);

  return (
    <OutputContext.Provider
      value={{
        output,
        newOutput,
        updateOutputStatus,
        logToOutput,
        clearOutput,
      }}
    >
      {children}
    </OutputContext.Provider>
  );
};
