import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface PaymentTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

const PaymentTimer: React.FC<PaymentTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        onExpire?.();
        return 'Expired';
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (isExpired) {
    return (
      <div className="text-red-600 font-medium">
        Payment session expired
      </div>
    );
  }

  const getColorClass = () => {
    const [minutes] = timeLeft.split(':').map(Number);
    if (minutes < 2) return 'text-red-600';
    if (minutes < 5) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center">
      <Clock className={`h-4 w-4 mr-1 ${getColorClass()}`} />
      <span className={`font-mono font-medium ${getColorClass()}`}>
        {timeLeft}
      </span>
      <span className="text-xs text-gray-500 ml-1">remaining</span>
    </div>
  );
};

export default PaymentTimer;