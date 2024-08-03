import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useSearchQuery } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';

export const FavoriteButton: FC = () => {
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
      className="absolute bottom-2 left-2 rounded-full px-[0.58rem] py-2 text-lg hover:bg-paper/80 focus:bg-paper/80 focus:outline-none"
    >
      {searchQuery === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
