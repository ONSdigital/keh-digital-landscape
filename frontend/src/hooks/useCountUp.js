import { useState, useEffect } from 'react';

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    let start = null;
    let requestAnimationFrameId;

    const step = timestamp => {
      if (!start) {
        start = timestamp;
      }
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(progress * target);
      if (progress < 1) {
        requestAnimationFrameId = requestAnimationFrame(step);
      }
    };

    requestAnimationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(requestAnimationFrameId);
  }, [target, duration]);

  return value;
}

export default useCountUp;
