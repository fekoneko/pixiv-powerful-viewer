import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useSearchQuery } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';

export const FavoritesActionButton: FC = () => {
  const { searchQuery, setSearchQuery } = useSearchQuery();
  const [prevSearchRequest, setPrevSearchRequest] = useState('');

  const toggleFavorites = useCallback(
    () => setSearchQuery((prev) => (prev === '#favorites' ? prevSearchRequest : '#favorites')),
    [setSearchQuery, prevSearchRequest],
  );

  useEffect(() => {
    if (searchQuery === '#favorites') return;
    setPrevSearchRequest(searchQuery);
  }, [searchQuery]);

  useKeyboardEvent(
    'keydown',
    'Enter',
    (e) => {
      if (checkTextfieldFocused()) return;
      e.preventDefault();
      toggleFavorites();
    },
    [toggleFavorites],
    { control: true, shift: false },
  );

  return (
    <button
      role="button"
      onClick={toggleFavorites}
      tabIndex={3}
      className="order-3 flex size-10 items-center justify-center rounded-md border border-border bg-paper px-[0.58rem] py-2 text-lg shadow-md hover:bg-paper-hover focus:bg-paper-hover focus:outline-none"
    >
      {searchQuery === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
