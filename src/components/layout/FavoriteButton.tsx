import { SearchContext } from '@/contexts/SearchContext';
import { useKeyboardEvent } from '@/hooks/useKeyboardEvent';
import { FC, useCallback, useContext, useEffect, useState } from 'react';

export const FavoriteButton: FC = () => {
  const { search, setSearch } = useContext(SearchContext);
  const [prevSearchRequest, setPrevSearchRequest] = useState('');

  const toggleFavorites = useCallback(
    () =>
      setSearch((prev) => ({
        request: prev?.request === '#favorites' ? prevSearchRequest : '#favorites',
        mode: prev?.mode ?? 'all',
      })),
    [setSearch, prevSearchRequest],
  );

  useEffect(() => {
    if (!search || search.request === '#favorites') return;
    setPrevSearchRequest(search.request);
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
      className="hover:bg-text/10 focus:bg-text/10 rounded-full px-[0.58rem] py-2 text-lg focus:outline-none"
    >
      {search?.request === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
