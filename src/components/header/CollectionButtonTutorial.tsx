import { FC } from 'react';

export const CollectionButtonTutorial: FC = () => (
  <div className="absolute -left-6 top-14 z-[100] w-[calc(100%+3rem)] overflow-hidden text-wrap rounded-md bg-paper-accent p-2.5 text-center text-base text-text-accent shadow-xl">
    <p className="mb-2.5 mr-1.5 text-3xl">👋</p>
    <p className="font-bold">Welcome!</p>
    <p className="font-normal">Choose the collection with the button above to get started</p>
  </div>
);
