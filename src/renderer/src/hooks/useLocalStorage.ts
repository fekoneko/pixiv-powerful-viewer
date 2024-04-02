import { useEffect, useState } from 'react';

const useUserData = <T = any>(
  key: string,
  onError?: (error: unknown) => any,
): [content: T | undefined, setContent: React.Dispatch<React.SetStateAction<T | undefined>>] => {
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
  }, [key, setContent, onError]);

  useEffect(() => {
    if (content === undefined) return;
    localStorage.setItem(key, JSON.stringify(content));
  }, [key, content]);

  return [content, setContent];
};
export default useUserData;
