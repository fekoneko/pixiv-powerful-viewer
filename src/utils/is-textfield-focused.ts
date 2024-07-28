export const checkTextfieldFocused = () => {
  const activeElement = document.activeElement?.tagName;
  return activeElement === 'INPUT' || activeElement === 'TEXTAREA';
};
