export const formatTime = (ms: number) => {
  if (ms > 3600000) return `${Math.round(ms / 360000) / 10} h`;
  if (ms > 60000) return `${Math.round(ms / 6000) / 10} min`;
  if (ms > 1000) return `${Math.round(ms / 100) / 10} s`;
  return `${ms} ms`;
};
