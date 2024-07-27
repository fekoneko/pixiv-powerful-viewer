import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useSearch } from '@/hooks';

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
    'keyup',
    'Enter',
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      toggleFavorites();
    },
    [toggleFavorites],
    { control: true },
  );

  return (
    <button
      role="button"
      onClick={toggleFavorites}
      className="absolute bottom-2 left-2 rounded-full px-[0.58rem] py-2 text-lg hover:bg-text/10 focus:bg-text/10 focus:outline-none"
    >
      {search === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
