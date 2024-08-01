import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useLocalStorage = <T = any>(
  key: string,
  onError?: (error: unknown) => void,
): [content: T | null, setContent: Dispatch<SetStateAction<T | null>>] => {
  const [content, setContent] = useState<T | null>(null);

  useEffect(() => {
    if (content !== null) return;

    const readJson = localStorage.getItem(key);
    if (readJson === null) return;

    try {
      const newContent = JSON.parse(readJson);
      setContent(newContent);
    } catch (error) {
      onError && onError(error);
    }
  }, [key, content, onError]);

  useEffect(() => {
    if (content === null) return;
    localStorage.setItem(key, JSON.stringify(content));
  }, [key, content]);

  return [content, setContent];
};
