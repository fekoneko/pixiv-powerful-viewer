import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export interface WorksListSkeletonProps {
  isAnimated?: boolean;
}

export const WorksListSkeleton: FC<WorksListSkeletonProps> = ({ isAnimated }) => {
  return (
    <div className="grid grid-flow-row gap-2 overflow-hidden">
      {Array(6)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={twMerge(
              'h-36 gap-2 rounded-md border border-border bg-paper shadow-md',
              isAnimated && 'animate-pulse',
            )}
            style={{ animationDuration: '2s', animationDelay: index * 0.5 + 's' }}
          />
        ))}
    </div>
  );
};
