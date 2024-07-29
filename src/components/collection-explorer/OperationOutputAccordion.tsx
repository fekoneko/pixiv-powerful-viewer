import { Accordion } from '@/components/collection-explorer/Accordion';
import { FC } from 'react';

export const OperationOutputAccordion: FC = () => (
  <Accordion
    hotkey={{ key: 'Space', modifiers: { control: true } }}
    mainSection={(isExpanded) => (isExpanded ? 'Operation Output' : 'Operation Output')}
    contents={() => <div>TODO</div>} // TODO: implement operation output (use context)
  />
);
