import React from 'react';
import { Variable, VariableType } from '../types';

interface VariableInputProps {
  variable: Variable;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
}

const VariableInput: React.FC<VariableInputProps> = ({ variable, value, onChange, error }) => {
  const { name, label, type, options, description } = variable;

  const baseClasses = "w-full bg-gray-700 border rounded-md p-2 text-white transition";
  const focusClasses = "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-gray-600";
  
  const finalClasses = `${baseClasses} ${error ? errorClasses : `${normalClasses} ${focusClasses}`}`;

  const renderInput = () => {
    switch (type) {
      case VariableType.TEXTAREA:
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            rows={4}
            className={finalClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        );
      case VariableType.SELECT:
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={finalClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          >
            {options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case VariableType.RADIO:
        return (
          <div className={`mt-2 p-2 rounded-md ${error ? 'border border-red-500' : ''}`}>
            <div className="flex flex-wrap gap-4">
                {options?.map(option => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                    type="radio"
                    name={name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(name, e.target.value)}
                    className="form-radio h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-300">{option}</span>
                </label>
                ))}
            </div>
          </div>
        );
      case VariableType.TEXT:
      default:
        return (
          <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className={finalClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        );
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-md font-medium text-gray-200 mb-1">{label}</label>
      {renderInput()}
      <p className="text-gray-400 text-sm mt-2">{description}</p>
      {error && <p id={`${name}-error`} className="text-red-400 text-sm mt-1" role="alert">{error}</p>}
    </div>
  );
};

export default VariableInput;