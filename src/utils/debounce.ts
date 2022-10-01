function debounce(
  func: (...args: []) => any,
  delay: number
): (...args: []) => void {
  let timer: NodeJS.Timeout;

  return (...args: []) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default debounce;
