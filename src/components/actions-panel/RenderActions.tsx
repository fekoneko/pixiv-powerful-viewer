import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const RenderActions: FC<PropsWithChildren> = ({ children }) => {
  const [panelRootElement, setPanelRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const newPanelRoot = document.getElementById('actions-panel-root');
    if (!newPanelRoot) return;

    setPanelRootElement(newPanelRoot);
  }, []);

  if (!panelRootElement) return null;

  return createPortal(children, panelRootElement);
};
