import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useSearch } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';

export const FavoriteButton: FC = () => {
  const { search, setSearch } = useSearch();
  const [prevSearchRequest, setPrevSearchRequest] = useState('');

  const toggleFavorites = useCallback(
    () => setSearch((prev) => (prev === '#favorites' ? prevSearchRequest : '#favorites')),
    [setSearch, prevSearchRequest],
  );

  useEffect(() => {
    if (search === '#favorites') return;
    setPrevSearchRequest(search);
  }, [search]);

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
      className="hover:bg-paper/80 focus:bg-paper/80 absolute bottom-2 left-2 rounded-full px-[0.58rem] py-2 text-lg focus:outline-none"
    >
      {search === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
