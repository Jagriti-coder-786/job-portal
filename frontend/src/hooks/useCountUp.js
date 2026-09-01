import { useEffect, useState } from 'react';

export default function useCountUp(end, duration = 2000, start = 0, isActive = true) {
  const [count, setCount] = useState(start);
  useEffect(() => {
    if (!isActive) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start, isActive]);
  return count;
}

