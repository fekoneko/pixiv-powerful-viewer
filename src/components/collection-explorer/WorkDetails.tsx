import { FC, Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { useAnimateScroll, useCollection, useKeyboardEvent } from '@/hooks';
import { isTextfieldFocused } from '@/utils/is-textfield-focused';
import { openExternal } from '@/utils/open';
import { Work } from '@/types/collection';
import { twMerge } from 'tailwind-merge';

interface WorkDetailsContentsProps {
  work: Work;
  expanded: boolean;
}

const WorkDetailsContents: FC<WorkDetailsContentsProps> = ({ work, expanded }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  useKeyboardEvent(
    'keydown',
    ['ArrowUp', 'KeyW'],
    (e) => {
      e.preventDefault();

      const scrollContainerElement = scrollContainerRef.current;
      if (!scrollContainerElement) return;

      const currentScrollTop = scrollContainerElement.scrollTop;
      animateScroll.start({
        from: { y: scrollContainerRef.current?.scrollTop },
        y: currentScrollTop - 150,
        reset: true,
      });
    },
    [scrollContainerRef],
    { control: true },
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowDown', 'KeyS'],
    (e) => {
      e.preventDefault();

      const scrollContainerElement = scrollContainerRef.current;
      if (!scrollContainerElement) return;

      const currentScrollTop = scrollContainerElement.scrollTop;
      animateScroll.start({
        from: { y: scrollContainerRef.current?.scrollTop },
        y: currentScrollTop + 150,
        reset: true,
      });
    },
    [scrollContainerRef],
    { control: true },
  );

  if (!work) return null;

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col gap-1.5 overflow-x-hidden overflow-y-scroll px-3 pb-5"
    >
      <h3 className="text-center text-lg font-semibold text-text-accent">
        {work.title}
        {'　'}
        <span className="whitespace-nowrap text-sm opacity-50" dir="ltr">
          (id: {work.id})
        </span>
      </h3>
      <p className="text-center font-semibold">
        by {work.userName}
        {'　'}
        <span className="whitespace-nowrap text-sm opacity-50" dir="ltr">
          (id: {work.userId})
        </span>
      </p>
      <div className="mb-2 mt-1 h-[2px] min-h-[2px] w-full self-center rounded-full bg-text/30" />

      {work.description && (
        <>
          <div>
            {work.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mb-2 mt-1 h-[2px] min-h-[2px] w-full self-center rounded-full bg-text/30" />
        </>
      )}

      <table>
        <tbody>
          {work.tags && (
            <tr>
              <td className="align-top">tags:　</td>
              <td className="whitespace-nowrap">
                {work.tags.map((tag, index) => (
                  <Fragment key={index}>
                    {index !== 0 && <span className="opacity-50">・</span>}
                    <wbr />
                    <span>{tag}</span>
                  </Fragment>
                ))}
              </td>
            </tr>
          )}

          {work.ai !== null && (
            <tr>
              <td />
              <td className="align-top">
                {work.ai ? (
                  <strong className="text-red-600">AI-generated</strong>
                ) : (
                  <>
                    <strong>Not</strong> AI-generated
                  </>
                )}
              </td>
            </tr>
          )}

          {work.uploadTime && (
            <tr>
              <td className="align-top">uploaded:　</td>
              <td>
                <p>{work.uploadTime}</p>
              </td>
            </tr>
          )}

          {work.bookmarks !== null && (
            <tr>
              <td className="align-top">bookmarks:　</td>
              <td>
                <p>
                  {work.bookmarks.toString()} <span className="text-lg">♥️</span>
                  {'　'}
                  <span className="whitespace-nowrap text-sm opacity-50">(before downloaded)</span>
                </p>
              </td>
            </tr>
          )}

          {work.url && (
            <tr>
              <td />
              <td>
                <a
                  href="#"
                  target="blank"
                  tabIndex={expanded ? 0 : -1}
                  className="text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    openExternal(work.url!); // TODO: Handle error
                  }}
                >
                  Go to Pixiv page
                </a>
              </td>
            </tr>
          )}

          <tr>
            <td />
            <td>
              <a
                href="#"
                tabIndex={expanded ? 0 : -1}
                className="text-blue-500 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  openExternal(work.path); // TODO: Handle error
                }}
              >
                Show in file explorer
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

interface WorkDetailsProps {
  work: Work | undefined;
  onToggleFullscreen: () => void;
}

export const WorkDetails: FC<WorkDetailsProps> = ({ work, onToggleFullscreen }) => {
  const [expanded, setExpanded] = useState(false);
  const { addToFavorites, removeFromFavorites, checkFavorited } = useCollection();
  const isFavorited = useMemo(
    () => work !== undefined && checkFavorited(work),
    [work, checkFavorited],
  );

  const toggleFavorite = useCallback(() => {
    if (!work) return;

    if (isFavorited) removeFromFavorites(work);
    else addToFavorites(work);
  }, [work, isFavorited, addToFavorites, removeFromFavorites]);

  const toggleExpanded = useCallback(() => {
    if (!work) return;
    setExpanded((prev) => !prev);
  }, [work]);

  useKeyboardEvent(
    'keyup',
    'Space',
    (e) => {
      if (isTextfieldFocused()) return;
      e.preventDefault();

      toggleExpanded();
    },
    [toggleExpanded],
  );

  useKeyboardEvent(
    'keyup',
    'Enter',
    (e) => {
      if (isTextfieldFocused()) return;
      e.preventDefault();

      toggleFavorite();
    },
    [toggleFavorite],
    { control: false },
  );

  if (!work) return null;

  return (
    <div
      className={twMerge(
        'flex min-h-10 flex-col overflow-y-hidden rounded-xl border-2 border-text/30 shadow-lg transition-[height] duration-1000',
        expanded ? 'h-1/2' : 'h-10',
      )}
    >
      <div className={twMerge('flex h-10 gap-1 p-1', expanded && 'shadow- z-10')}>
        <button onClick={toggleExpanded} className="flex min-w-1 grow gap-1 focus:outline-none">
          <div className="items-center rounded-md px-2 py-1 text-sm transition-colors [:focus>&]:text-text-accent [:hover>&]:text-text-accent">
            {expanded ? '▼' : '▲'}
          </div>
          <h2 className="grow overflow-hidden whitespace-nowrap text-left text-lg font-semibold">
            {expanded ? 'Details' : work.title}
          </h2>
        </button>
        <div className="flex gap-1">
          <button
            onClick={toggleFavorite}
            className="rounded-md px-3 hover:bg-text/20 focus:bg-text/20 focus:outline-none"
          >
            {isFavorited ? 'Favorited⭐' : 'Favorite'}
          </button>
          <div className="my-2 w-[2px] rounded-full bg-text/40" />
          <button
            onClick={onToggleFullscreen}
            className="rounded-md px-3 hover:bg-text/20 focus:bg-text/20 focus:outline-none"
          >
            Fullscreen
          </button>
        </div>
      </div>

      <WorkDetailsContents work={work} expanded={expanded} />
    </div>
  );
};
