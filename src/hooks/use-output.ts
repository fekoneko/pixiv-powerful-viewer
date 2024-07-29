import { useContext } from 'react';
import { OutputContext, OutputContextValue } from '@/providers/OutputProvider';

export const useOutput = (): OutputContextValue => {
  const context = useContext(OutputContext);
  if (!context) throw new Error('useOutput must be used within a OutputProvider');

  return context;
};
