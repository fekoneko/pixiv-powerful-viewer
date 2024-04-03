import SearchContext from '@renderer/contexts/SearchContext';
import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import useWanakana from '@renderer/hooks/useWanakana';
import { useContext, useRef, useState } from 'react';

const Searchbar = () => {
  const { search, setSearch } = useContext(SearchContext);
  const [kanaConversion, setKanaConversion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputInFocus, setIsInputInFocus] = useState(false);

  useWanakana(inputRef, {}, kanaConversion);

  const toggleSearchMode = () =>
    setSearch((prev) => ({
      request: prev?.request ?? '',
      mode: prev?.mode === 'all' ? 'works' : prev?.mode === 'works' ? 'users' : 'all',
    }));

  const toggleKanaConversion = () => setKanaConversion((prev) => !prev);

  useKeyboardEvent('keyup', ['Slash', 'Backslash', 'Space'], () => inputRef.current?.focus(), [
    inputRef.current,
  ]);

  useKeyboardEvent('keyup', 'Backquote', toggleSearchMode, [], { alt: true });

  useKeyboardEvent('keyup', 'Backquote', toggleKanaConversion, [], { control: true });

  return (
    <div className="flex size-full overflow-hidden rounded-full border-2 border-text-header">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <input
          ref={inputRef}
          placeholder={isInputInFocus ? 'Search here' : 'Press / to search'}
          className="grow bg-transparent px-3 py-1.5 placeholder:text-text-header/80 focus:outline-none"
          value={search?.request ?? ''}
          onInput={(e) =>
            setSearch((prev) => ({
              request: (e.target as HTMLInputElement).value,
              mode: prev?.mode ?? 'all',
            }))
          }
          onFocus={() => setIsInputInFocus(true)}
          onBlur={() => setIsInputInFocus(false)}
        />
      </form>

      <button
        onClick={toggleSearchMode}
        className="rounded-full px-3 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
        tabIndex={-1}
        title="Toggle search mode"
      >
        {search?.mode ?? 'all'}
      </button>

      <button
        onClick={toggleKanaConversion}
        className="rounded-full px-3 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
        tabIndex={-1}
        title="Toggle romaji-to-kana conversion"
      >
        {kanaConversion ? 'カ' : 'A'}
      </button>
    </div>
  );
};

export default Searchbar;
