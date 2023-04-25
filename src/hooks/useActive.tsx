import { useDocumentVisibility } from 'ahooks';

export function useActive() {
  const visible = useDocumentVisibility();
  const isActive = visible === 'visible';

  return isActive;
}
