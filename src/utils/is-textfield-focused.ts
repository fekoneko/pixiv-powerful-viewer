export const isTextfieldFocused = () => {
  const activeElement = document.activeElement?.tagName;
  return activeElement === 'INPUT' || activeElement === 'TEXTAREA';
};
