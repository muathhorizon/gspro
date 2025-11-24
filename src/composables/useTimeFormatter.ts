export function useTimeFormatter() {
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0 && remainingSeconds > 0) {
      return `${minutes} دقيقة و${remainingSeconds} ثانية`;
    } else if (minutes > 0) {
      return `${minutes} دقيقة`;
    } else {
      return `${remainingSeconds} ثانية`;
    }
  }

  return { formatTime };
}
