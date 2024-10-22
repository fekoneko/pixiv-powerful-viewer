import { FC, useMemo } from 'react';
import { useCollection, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';
import { Work } from '@/types/collection';
import { WorkDetailsAccordionContent } from './WorkDetailsAccordionContent';
import { Accordion } from '@/components/common/Accordion';

interface WorkDetailsAccordionProps {
  work: Work | null;
  onToggleFullscreen: () => void;
}

export const WorkDetailsAccordion: FC<WorkDetailsAccordionProps> = ({
  work,
  onToggleFullscreen,
}) => {
  const { toggleFavorite, checkFavorited } = useCollection();
  const isFavorited = useMemo(() => work && checkFavorited(work), [work, checkFavorited]);

  useKeyboardEvent(
    'keydown',
    'Enter',
    (e) => {
      if (checkTextfieldFocused() || !work) return;
      e.preventDefault();
      toggleFavorite(work);
    },
    [toggleFavorite],
    { shift: true, control: false },
  );

  if (!work) return null;

  return (
    <Accordion
      className="mb-2"
      hotkey={{ key: 'Space', modifiers: { control: false } }}
      mainSection={(isExpanded) => <h2>{isExpanded ? 'Details' : work.title}</h2>}
      rightSection={() => (
        <>
          <button
            onClick={() => toggleFavorite(work)}
            className="rounded-md px-2.5 hover:bg-paper-hover focus:bg-paper-hover focus:outline-none"
          >
            {isFavorited ? 'Favorited⭐' : 'Favorite'}
          </button>
          <div className="my-2 h-1/2 w-px rounded-full bg-border pt-px" />
          <button
            onClick={onToggleFullscreen}
            className="rounded-md px-2.5 hover:bg-paper-hover focus:bg-paper-hover focus:outline-none"
          >
            Fullscreen
          </button>
        </>
      )}
    >
      {(isExpanded) => <WorkDetailsAccordionContent work={work} isExpanded={isExpanded} />}
    </Accordion>
  );
};
