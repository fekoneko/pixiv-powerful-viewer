import { SearchContext } from '@/contexts/SearchContext';
import { useKeyboardEvent } from '@/hooks/use-keyboard-event';
import { FC, useCallback, useContext, useEffect, useState } from 'react';

export const FavoriteButton: FC = () => {
  const { search, setSearch } = useContext(SearchContext);
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
      className="rounded-full px-[0.58rem] py-2 text-lg hover:bg-text/10 focus:bg-text/10 focus:outline-none"
    >
      {search === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
