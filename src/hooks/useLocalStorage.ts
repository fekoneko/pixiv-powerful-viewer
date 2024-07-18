import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useLocalStorage = <T = any>(
  key: string,
  onError?: (error: unknown) => void,
): [content: T | undefined, setContent: Dispatch<SetStateAction<T | undefined>>] => {
  const [content, setContent] = useState<T>();

  useEffect(() => {
    if (content !== undefined) return;

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
    if (content === undefined) return;
    localStorage.setItem(key, JSON.stringify(content));
  }, [key, content]);

  return [content, setContent];
};
