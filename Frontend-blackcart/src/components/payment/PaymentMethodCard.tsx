import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '../../types/payment.types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  amount: number;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected,
  onSelect,
  amount
}) => {
  const isValid = amount >= method.minAmount && amount <= method.maxAmount;
  const isBelowMin = amount < method.minAmount;
  const isAboveMax = amount > method.maxAmount;

  const getStatusMessage = () => {
    if (isBelowMin) {
      return `Min amount: PKR ${method.minAmount.toLocaleString()}`;
    }
    if (isAboveMax) {
      return `Max amount: PKR ${method.maxAmount.toLocaleString()}`;
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div
      onClick={() => isValid && onSelect()}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        !isValid ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
      } ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${
            selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="text-2xl">{method.icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 flex items-center">
              {method.name}
              {method.processingTime === 'Instant' && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Instant
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{method.description}</p>
            {method.charges && method.charges > 0 && (
              <p className="text-xs text-red-600 mt-1">
                + PKR {method.charges.toLocaleString()} charges apply
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {!isValid && statusMessage && (
            <div className="mr-3 text-xs text-gray-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {statusMessage}
            </div>
          )}
          {selected ? (
            <CheckCircle className="h-5 w-5 text-blue-600" />
          ) : (
            <div className={`h-5 w-5 rounded-full border-2 ${
              isValid ? 'border-gray-300' : 'border-gray-200'
            }`}></div>
          )}
        </div>
      </div>

      {/* Method-specific details */}
      {selected && method.instructions && (
        <div className="mt-4 pl-11">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              Instructions
            </h4>
            <ul className="space-y-1">
              {method.instructions.map((instruction, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;