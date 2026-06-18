import { useEffect, useState } from 'react';

interface Props {
  totalSeconds: number;
  onExpire: () => void;
}

export default function Timer({ totalSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const id = setInterval(() => setRemaining(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  const urgent = remaining < 300;

  return (
    <span className={`font-mono text-lg font-bold ${urgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
      {m}:{s}
    </span>
  );
}
