import { useEffect, useState } from "react";

export default function useCountUp(value, duration = 700) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const step = Math.max(1, Math.round(duration / 30));
    const increment = value / step;

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return count;
}