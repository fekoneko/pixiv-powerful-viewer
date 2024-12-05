import { FC, Fragment } from 'react';
import { openExternal } from '@/lib/application/open-external';
import { Work } from '@/types/collection';

interface WorkDetailsAccordionContentProps {
  work: Work;
  isExpanded: boolean;
}

export const WorkDetailsAccordionContent: FC<WorkDetailsAccordionContentProps> = ({
  work,
  isExpanded,
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex flex-wrap items-baseline justify-center gap-x-3 text-lg font-semibold text-text-accent">
      <h3 className="text-center">{work.title}</h3>
      <p className="whitespace-nowrap text-sm opacity-50" dir="ltr">
        (id: {work.id})
      </p>
    </div>

    <div className="flex flex-wrap items-baseline justify-center gap-x-3 font-semibold">
      <p className="text-center">by {work.userName}</p>
      {work.id !== null && (
        <p className="whitespace-nowrap text-sm opacity-50" dir="ltr">
          (id: {work.userId})
        </p>
      )}
    </div>
    <div className="mb-2 mt-1 h-px w-full self-center rounded-full bg-border" />

    {work.description && (
      <>
        <div>
          {work.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mb-2 mt-1 h-px w-full self-center rounded-full bg-border" />
      </>
    )}

    <div className="grid grid-cols-[auto_1fr] gap-x-[5%] gap-y-2">
      {work.tags && <p>tags:</p>}
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

      {(work.ai !== null || work.ageRestriction) && <p />}
      {(work.ai !== null || work.ageRestriction) && (
        <div className="flex flex-wrap gap-x-1">
          {work.ageRestriction &&
            (() => {
              switch (work.ageRestriction) {
                case 'all-ages':
                  return <p>All ages</p>;
                case 'r-18':
                  return <p className="font-semibold text-red-500">R-18</p>;
                case 'r-18g':
                  return <p className="font-semibold text-red-500">R-18G</p>;
              }
            })()}

          {work.ai !== null && work.ageRestriction && <span className="opacity-50">・</span>}

          {work.ai !== null &&
            (() => {
              if (work.ai) return <p className="font-semibold text-red-500">AI-generated</p>;
              return (
                <p>
                  <strong>Not</strong> AI-generated
                </p>
              );
            })()}
        </div>
      )}

      {work.uploadTime && <p>uploaded:</p>}
      {work.uploadTime && <p>{new Date(work.uploadTime).toLocaleString()}</p>}

      {work.bookmarks !== null && <p>bookmarks:</p>}
      {work.bookmarks !== null && (
        <div className="flex flex-wrap items-center gap-x-3">
          <p>
            {work.bookmarks.toString()} <span className="text-lg">♥️</span>
          </p>
          <span className="whitespace-nowrap text-sm opacity-50">(before downloaded)</span>
        </div>
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
