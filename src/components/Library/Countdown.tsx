import { type FC, useState, useEffect } from "react";

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
}

const Countdown: FC<CountdownProps> = ({ seconds, onComplete }) => {
  const [countdown, setCountdown] = useState(seconds);
  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    return () => clearInterval(interval); // Cleanup to avoid memory leaks
  }, [countdown, onComplete]);

  return (
    <>
      <p className="text-base text-[#AAABAD]">Redirecting in {countdown}s</p>
    </>
  );
};

export default Countdown;
