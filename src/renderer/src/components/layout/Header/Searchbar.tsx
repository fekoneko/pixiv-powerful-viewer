import SearchContext from '@renderer/contexts/SearchContext';
import useWanakana from '@renderer/hooks/useWanakana';
import { useContext, useRef, useState } from 'react';

const Searchbar = () => {
  const { search, setSearch } = useContext(SearchContext);
  const [kanaConversion, setKanaConversion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useWanakana(inputRef, {}, kanaConversion);

  return (
    <div className="flex size-full overflow-hidden rounded-full border-2 border-text-header">
      <input
        ref={inputRef}
        placeholder="Search tags"
        className="grow bg-transparent px-3 py-1.5 placeholder:text-text-header/80 focus:outline-none"
        value={search?.request ?? ''}
        onInput={(e) =>
          setSearch((prev) => ({
            request: (e.target as HTMLInputElement).value,
            mode: prev?.mode ?? 'all',
          }))
        }
      />
      <button
        onClick={() =>
          setSearch((prev) => ({
            request: prev?.request ?? '',
            mode: prev?.mode === 'all' ? 'works' : prev?.mode === 'works' ? 'users' : 'all',
          }))
        }
        className="rounded-full px-3 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
      >
        {search?.mode ?? 'all'}
      </button>
      <button
        onClick={() => setKanaConversion((prev) => !prev)}
        className="rounded-full px-3 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
      >
        {kanaConversion ? 'カ' : 'A'}
      </button>
    </div>
  );
};

export default Searchbar;
