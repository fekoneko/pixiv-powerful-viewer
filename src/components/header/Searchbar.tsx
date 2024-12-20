import { FC, useRef, useState } from 'react';
import { useKeyboardEvent, useSearchQuery, useWanakana } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';
import { twMerge } from 'tailwind-merge';

export const Searchbar: FC = () => {
  const { searchQuery, setSearchQuery } = useSearchQuery();
  const [kanaConversionOn, setKanaConversionOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useWanakana(inputRef, {}, kanaConversionOn);

  const toggleKanaConversion = () => {
    setKanaConversionOn((prev) => !prev);
    inputRef.current?.focus();
  };

  useKeyboardEvent(
    'keydown',
    ['Slash', 'Backslash'],
    (e) => {
      if (checkTextfieldFocused()) return;
      e.preventDefault();
      inputRef.current?.focus();
    },
    [inputRef],
  );

  useKeyboardEvent('keydown', 'Escape', () => inputRef.current?.blur(), [inputRef]);

  useKeyboardEvent('keydown', 'Backquote', toggleKanaConversion, [], { alt: true });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
      }}
      className="flex min-w-40 grow basis-40 gap-1 rounded-full border border-text-header"
    >
      <input
        ref={inputRef}
        placeholder={isInputFocused ? 'Search here' : 'Press / to search'}
        className={twMerge(
          'min-w-0 grow bg-transparent py-1.5 pl-3 placeholder:text-text-header/80 focus:outline-none',
          !isInputFocused && 'text-overflow-mask',
        )}
        value={searchQuery}
        onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />

      <button
        onClick={toggleKanaConversion}
        type="button"
        className="w-10 rounded-3xl px-3 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
        title="Toggle romaji-to-kana conversion"
      >
        {kanaConversionOn ? 'カ' : 'A'}
      </button>
    </form>
  );
};
