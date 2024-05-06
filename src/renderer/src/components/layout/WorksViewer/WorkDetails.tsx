import CollectionContext from '@renderer/contexts/CollectionContext';
import useAnimateScroll from '@renderer/hooks/useAnimateScroll';
import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import { Work } from '@renderer/lib/Collection';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';

interface WorkDetailsContentsProps {
  work: Work;
  expanded: boolean;
}
const WorkDetailsContents = ({ work, expanded }: WorkDetailsContentsProps) => {
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
    [scrollContainerRef.current],
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

          {work.ai !== undefined && (
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

          {work.dateTime && (
            <tr>
              <td className="align-top">uploaded:　</td>
              <td>
                <p>{work.dateTime.toDateString()}</p>
              </td>
            </tr>
          )}

          {work.bookmarks !== undefined && (
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

          {work.pageUrl && (
            <tr>
              <td />
              <td>
                <a
                  href={work.pageUrl}
                  target="blank"
                  tabIndex={expanded ? 0 : -1}
                  className="text-blue-500 hover:underline"
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
                  window.api.showItemInFolder(work.path);
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
  toggleFullscreenMode: () => void;
}
const WorkDetails = ({ work, toggleFullscreenMode }: WorkDetailsProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { collection } = useContext(CollectionContext);

  useEffect(
    () => setIsFavorited(!!work && !!collection && collection.favorites.includes(work)),
    [collection, work],
  );

  useEffect(() => {
    if (!work) return;
    if (isFavorited) collection?.favorites.add(work);
    else collection?.favorites.remove(work);
  }, [isFavorited, work, collection]);

  useKeyboardEvent(
    'keyup',
    'Space',
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      if (!work) return;
      setExpanded((prev) => !prev);
    },
    [setExpanded, work],
  );

  useKeyboardEvent(
    'keyup',
    'Enter',
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      if (!work) return;
      setIsFavorited((prev) => !prev);
    },
    [collection, work],
    { control: false },
  );

  if (!work) return null;

  return (
    <div
      className={
        'flex min-h-10 flex-col overflow-y-hidden rounded-xl border-2 border-text/30 shadow-lg transition-[height] duration-1000' +
        (expanded ? ' h-1/2' : ' h-10')
      }
    >
      <div className={'flex h-10 gap-1 p-1' + (expanded ? ' shadow- z-10' : '')}>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-w-1 grow gap-1 focus:outline-none"
        >
          <div className="items-center rounded-md px-2 py-1 text-sm transition-colors [:focus>&]:text-text-accent [:hover>&]:text-text-accent">
            {expanded ? '▼' : '▲'}
          </div>
          <h2 className="grow overflow-hidden whitespace-nowrap text-left text-lg font-semibold">
            {expanded ? 'Details' : work.title}
          </h2>
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setIsFavorited((prev) => !prev)}
            className="rounded-md px-3 hover:bg-text/20 focus:bg-text/20 focus:outline-none"
          >
            {isFavorited ? 'Favorited⭐' : 'Favorite'}
          </button>
          <div className="my-2 w-[2px] rounded-full bg-text/40" />
          <button
            onClick={toggleFullscreenMode}
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
export default WorkDetails;
