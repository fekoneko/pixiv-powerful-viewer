import { SearchContext } from '@/contexts/SearchContext';
import { useKeyboardEvent } from '@/hooks/useKeyboardEvent';
import { useWanakana } from '@/hooks/useWanakana';
import { FC, useContext, useRef, useState } from 'react';

export const Searchbar: FC = () => {
  const { search, setSearch } = useContext(SearchContext);
  const [kanaConversion, setKanaConversion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputInFocus, setIsInputInFocus] = useState(false);

  useWanakana(inputRef, {}, kanaConversion);

  const toggleSearchMode = () => {
    setSearch((prev) => ({
      request: prev?.request ?? '',
      mode: prev?.mode === 'all' ? 'works' : prev?.mode === 'works' ? 'users' : 'all',
    }));
    inputRef.current?.focus();
  };

  const toggleKanaConversion = () => {
    setKanaConversion((prev) => !prev);
    inputRef.current?.focus();
  };

  useKeyboardEvent('keyup', ['Slash', 'Backslash'], () => inputRef.current?.focus(), [
    inputRef.current,
  ]);

  useKeyboardEvent('keydown', 'Escape', () => inputRef.current?.blur(), [inputRef.current]);

  useKeyboardEvent('keyup', 'Backquote', toggleSearchMode, [], { alt: true });

  useKeyboardEvent('keyup', 'Backquote', toggleKanaConversion, [], { control: true });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
      }}
      className="border-text-header flex min-w-0 grow basis-40 gap-1 rounded-full border-2"
    >
      <input
        ref={inputRef}
        placeholder={isInputInFocus ? 'Search here' : 'Press / to search'}
        className="placeholder:text-text-header/80 min-w-0 grow bg-transparent py-1.5 pl-3 focus:outline-none"
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

      <button
        onClick={toggleSearchMode}
        type="button"
        className="hover:bg-text-header/20 focus:bg-text-header/20 rounded-l-3xl rounded-r-md pl-3 pr-2 focus:outline-none"
        title="Toggle search mode"
      >
        {search?.mode === 'works' ? 'Works' : search?.mode === 'users' ? 'Users' : 'All'}
      </button>
      <div className="bg-text-header/40 my-2 w-[3px] rounded-full" />
      <button
        onClick={toggleKanaConversion}
        type="button"
        className="hover:bg-text-header/20 focus:bg-text-header/20 rounded-l-md rounded-r-3xl pl-2 pr-3 focus:outline-none"
        title="Toggle romaji-to-kana conversion"
      >
        {kanaConversion ? 'カ' : 'A'}
      </button>
    </form>
  );
};
