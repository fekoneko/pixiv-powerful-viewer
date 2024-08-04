import { FC } from 'react';

export const WorksListSkeleton: FC = () => {
  return (
    <div className="grid grow grid-cols-1 grid-rows-4 gap-2">
      {Array(4)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className="animate-pulse gap-2 rounded-md bg-paper shadow-md"
            style={{ animationDuration: '2s', animationDelay: index * 0.5 + 's' }}
          />
        ))}
    </div>
  );
};
