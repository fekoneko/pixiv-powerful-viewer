import { FC, HTMLAttributes, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useAnimateScroll, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';
import { twMerge } from 'tailwind-merge';
import { Modifiers } from '@/hooks/use-keyboard-event';

export interface Hotkey {
  key: string | string[];
  modifiers?: Modifiers;
}

interface WithHotkeyProps {
  hotkey: Hotkey;
  toggleExpanded: () => void;
}

const WithHotkey: FC<WithHotkeyProps> = ({ hotkey, toggleExpanded }) => {
  useKeyboardEvent(
    'keydown',
    hotkey.key,
    (e) => {
      if (checkTextfieldFocused()) return;
      e.preventDefault();
      toggleExpanded();
    },
    [toggleExpanded],
    hotkey.modifiers,
  );

  return null;
};

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  mainSection: (isExpanded: boolean) => ReactNode;
  contents: (isExpanded: boolean) => ReactNode;
  rightSection?: (isExpanded: boolean) => ReactNode;
  hotkey?: Hotkey;
  forceCollapsed?: boolean;
}

export const Accordion: FC<AccordionProps> = ({
  mainSection,
  contents,
  rightSection,
  hotkey,
  forceCollapsed,
  ...divProps
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);

  const scrollUp = useCallback(() => {
    const scrollContainerElement = scrollContainerRef.current;
    if (!scrollContainerElement) return;

    const currentScrollTop = scrollContainerElement.scrollTop;
    animateScroll.start({
      from: { y: scrollContainerRef.current?.scrollTop },
      y: currentScrollTop - 150,
      reset: true,
    });
  }, [scrollContainerRef, animateScroll]);

  const scrollDown = useCallback(() => {
    const scrollContainerElement = scrollContainerRef.current;
    if (!scrollContainerElement) return;

    const currentScrollTop = scrollContainerElement.scrollTop;
    animateScroll.start({
      from: { y: scrollContainerRef.current?.scrollTop },
      y: currentScrollTop + 150,
      reset: true,
    });
  }, [scrollContainerRef, animateScroll]);

  useKeyboardEvent(
    'keydown',
    ['ArrowUp', 'KeyW'],
    (e) => {
      if (checkTextfieldFocused() || !isExpanded) return;
      e.preventDefault();
      scrollUp();
    },
    [scrollUp],
    { control: true },
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowDown', 'KeyS'],
    (e) => {
      if (checkTextfieldFocused() || !isExpanded) return;
      e.preventDefault();
      scrollDown();
    },
    [scrollDown],
    { control: true },
  );

  useEffect(() => {
    if (forceCollapsed) setIsExpanded(false);
  }, [forceCollapsed]);

  return (
    <div
      {...divProps}
      className={twMerge(
        'flex h-10 flex-col gap-1 overflow-y-hidden rounded-lg bg-paper shadow-lg transition-[min-height] duration-500',
        isExpanded ? 'min-h-[50%]' : 'min-h-10',
        divProps.className,
      )}
    >
      <div className="flex min-h-10 gap-1 p-1">
        <button
          onClick={toggleExpanded}
          className="flex min-w-10 grow items-stretch gap-1 focus:outline-none"
        >
          <div className="flex w-7 items-center rounded-md px-2 py-1 text-sm transition-colors [:focus>&]:text-text-accent [:hover>&]:text-text-accent">
            {forceCollapsed ? '' : isExpanded ? '▼' : '▲'}
          </div>
          <div className="flex grow items-center overflow-hidden whitespace-nowrap text-left text-lg font-semibold">
            {mainSection(isExpanded)}
          </div>
        </button>

        <div className="flex gap-1">{rightSection?.(isExpanded)}</div>
      </div>

      <div ref={scrollContainerRef} className="overflow-x-hidden overflow-y-scroll px-3 pb-5">
        {contents(isExpanded)}
      </div>

      {hotkey && !forceCollapsed && <WithHotkey hotkey={hotkey} toggleExpanded={toggleExpanded} />}
    </div>
  );
};
