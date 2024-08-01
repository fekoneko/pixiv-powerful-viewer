import { FC, Fragment } from 'react';
import { openExternal } from '@/utils/open';
import { Work } from '@/types/collection';

interface WorkDetailsProps {
  work: Work;
  isExpanded: boolean;
}

export const WorkDetails: FC<WorkDetailsProps> = ({ work, isExpanded }) => (
  <div className="flex flex-col gap-1.5">
    <h3 className="flex items-baseline justify-center gap-3 text-lg font-semibold text-text-accent">
      {work.title}
      <span className="whitespace-nowrap text-sm opacity-50" dir="ltr">
        (id: {work.id})
      </span>
    </h3>

    <p className="flex items-baseline justify-center gap-3 font-semibold">
      by {work.userName}
      {work.id !== null && (
        <span className="whitespace-nowrap text-sm opacity-50" dir="ltr">
          (id: {work.userId})
        </span>
      )}
    </p>
    <div className="mb-2 mt-1 h-px w-full self-center rounded-full bg-text/30" />

    {work.description && (
      <>
        <div>
          {work.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mb-2 mt-1 h-px w-full self-center rounded-full bg-text/30" />
      </>
    )}

    <div className="grid grid-cols-[auto_1fr] gap-2">
      {work.tags && <p>tags:　</p>}
      {work.tags && (
        <p className="whitespace-nowrap">
          {work.tags.map((tag, index) => (
            <Fragment key={index}>
              {index !== 0 && <span className="opacity-50">・</span>}
              <wbr />
              <span>{tag}</span>
            </Fragment>
          ))}
        </p>
      )}

      {work.ai !== null && <p />}
      {work.ai !== null && (
        <p>
          {work.ai ? (
            <strong className="text-red-600">AI-generated</strong>
          ) : (
            <>
              <strong>Not</strong> AI-generated
            </>
          )}
        </p>
      )}

      {work.uploadTime && <p>uploaded:　</p>}
      {work.uploadTime && <p>{new Date(work.uploadTime).toLocaleString()}</p>}

      {work.bookmarks !== null && <p>bookmarks:　</p>}
      {work.bookmarks !== null && (
        <p>
          {work.bookmarks.toString()} <span className="text-lg">♥️</span>
          {'　'}
          <span className="whitespace-nowrap text-sm opacity-50">(before downloaded)</span>
        </p>
      )}

      {work.url && <p />}
      {work.url && (
        <a
          href="#"
          target="blank"
          tabIndex={isExpanded ? 0 : -1}
          className="text-blue-500 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            openExternal(work.url!); // TODO: Handle error
          }}
        >
          Go to Pixiv page
        </a>
      )}

      <p />
      <a
        href="#"
        tabIndex={isExpanded ? 0 : -1}
        className="text-blue-500 hover:underline"
        onClick={(e) => {
          e.preventDefault();
          openExternal(work.path); // TODO: Handle error
        }}
      >
        Show in file explorer
      </a>
    </div>
  </div>
);
