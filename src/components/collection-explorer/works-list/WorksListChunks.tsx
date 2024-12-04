import { FC, memo, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyboardEvent, useTimeout } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';
import { AnimateScroll } from '@/hooks/use-animate-scroll';
import { Work } from '@/types/collection';
import { WorksListCard } from './WorksListCard';
import { RenderInViewport } from '@/components/common/RenderInViewport';

const CHUNK_SIZE = 20;
const KEYBOARD_DELAY = 150;

interface WorksListChunksProps {
  works: Work[];
  onSelectWork: (selectedWork: Work | null) => void;
  allowDeselect?: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
}

export const WorksListChunks: FC<WorksListChunksProps> = memo(
  ({ works, onSelectWork, allowDeselect, scrollContainerRef, animateScroll }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const previousWorksRef = useRef<Work[]>(works);
    const keyboardAllowedRef = useRef(true);
    const [, updateKeyboardTimeout] = useTimeout();

    const workCardsChunks = useMemo(() => {
      const result: Work[][] = [];
      for (let i = 0; i < works.length; i += CHUNK_SIZE) {
        result.push(works.slice(i, i + CHUNK_SIZE));
      }
      return result;
    }, [works]);

    const checkAndUpdateKeyboardTimeout = useCallback(() => {
      if (!keyboardAllowedRef.current) return false;

      keyboardAllowedRef.current = false;
      updateKeyboardTimeout(() => (keyboardAllowedRef.current = true), KEYBOARD_DELAY);
      return true;
    }, [updateKeyboardTimeout, keyboardAllowedRef]);

    const selectPrevious = useCallback(() => {
      setSelectedIndex((prev) => {
        if (works.length === 0) return null;
        if (prev === null) return 0;
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, [works.length]);

    const selectNext = useCallback(() => {
      setSelectedIndex((prev) => {
        if (works.length === 0) return null;
        if (prev === null) return 0;
        if (prev + 1 >= works.length - 1) return works.length - 1;
        return prev + 1;
      });
    }, [works.length]);

    useKeyboardEvent(
      'keydown',
      ['ArrowUp', 'KeyW'],
      (e) => {
        if (checkTextfieldFocused() || !checkAndUpdateKeyboardTimeout()) return;
        e.preventDefault();
        selectPrevious();
      },
      [checkAndUpdateKeyboardTimeout, selectPrevious],
      { control: false },
    );

    useKeyboardEvent(
      'keydown',
      ['ArrowDown', 'KeyS'],
      (e) => {
        if (checkTextfieldFocused() || !checkAndUpdateKeyboardTimeout()) return;
        e.preventDefault();
        selectNext();
      },
      [checkAndUpdateKeyboardTimeout, selectNext],
      { control: false },
    );

    useKeyboardEvent(
      'keydown',
      'Escape',
      () => {
        if (checkTextfieldFocused() || !allowDeselect) return;
        setSelectedIndex(null);
      },
      [allowDeselect],
    );

    useEffect(() => {
      const previousWorks = previousWorksRef.current;
      previousWorksRef.current = works;

      setSelectedIndex((selectedIndex) => {
        if (selectedIndex === null || works.length === 0) return null;

        const prevSelectedWork = previousWorks[selectedIndex] ?? null;
        const newSelectedWork = works[selectedIndex] ?? null;

        if (prevSelectedWork && prevSelectedWork.key !== newSelectedWork?.key) {
          const newSelectedIndex = works.findIndex((work) => work.key === prevSelectedWork.key);
          if (newSelectedIndex !== -1) return newSelectedIndex;
        }

        if (selectedIndex > works.length - 1) return works.length - 1;
        if (selectedIndex < 0) return 0;
        return selectedIndex;
      });
    }, [works]);

    useEffect(() => {
      onSelectWork(selectedIndex !== null ? (works[selectedIndex] ?? null) : null);
    }, [selectedIndex, onSelectWork, works]);

    useEffect(() => {
      if (selectedIndex === null) animateScroll.start({ y: 0, immediate: true });
    }, [selectedIndex, animateScroll]);

    return workCardsChunks.map((chunk, chunkIndex) => (
      <RenderInViewport
        key={chunkIndex}
        fallbackHeight={chunk.length * 8 + 'rem'}
        forceRender={
          selectedIndex !== null &&
          selectedIndex >= (chunkIndex - 1) * CHUNK_SIZE &&
          selectedIndex <= (chunkIndex + 1) * CHUNK_SIZE
        }
        className="flex flex-col gap-2"
      >
        {chunk.map((work, workIndexInChunk) => {
          const workIndex = chunkIndex * CHUNK_SIZE + workIndexInChunk;

          return (
            <WorksListCard
              key={work.key}
              work={work}
              index={workIndex}
              onSelect={setSelectedIndex}
              scrollContainerRef={scrollContainerRef}
              animateScroll={animateScroll}
              active={workIndex === selectedIndex}
            />
          );
        })}
      </RenderInViewport>
    ));
  },
);
