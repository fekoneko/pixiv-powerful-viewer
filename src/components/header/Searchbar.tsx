import { FC, useRef, useState } from 'react';
import { useKeyboardEvent, useSearch, useWanakana } from '@/hooks';

export const Searchbar: FC = () => {
  const { search, setSearch } = useSearch();
  const [kanaConversion, setKanaConversion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputInFocus, setIsInputInFocus] = useState(false);

  useWanakana(inputRef, {}, kanaConversion);

  const toggleKanaConversion = () => {
    setKanaConversion((prev) => !prev);
    inputRef.current?.focus();
  };

  useKeyboardEvent('keydown', ['Slash', 'Backslash'], () => inputRef.current?.focus(), [inputRef]);

  useKeyboardEvent('keydown', 'Escape', () => inputRef.current?.blur(), [inputRef]);

  useKeyboardEvent('keydown', 'Backquote', toggleKanaConversion, [], { control: true });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
      }}
      className="flex min-w-0 grow basis-40 gap-1 rounded-full border-2 border-text-header"
    >
      <input
        ref={inputRef}
        placeholder={isInputInFocus ? 'Search here' : 'Press / to search'}
        className="min-w-0 grow bg-transparent py-1.5 pl-3 placeholder:text-text-header/80 focus:outline-none"
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        onFocus={() => setIsInputInFocus(true)}
        onBlur={() => setIsInputInFocus(false)}
      />

      <button
        onClick={toggleKanaConversion}
        type="button"
        className="aspect-square rounded-3xl px-3 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
        title="Toggle romaji-to-kana conversion"
      >
        {kanaConversion ? 'カ' : 'A'}
      </button>
    </form>
  );
};
