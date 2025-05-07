import { Search, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function FancyInput(
  {
    inputState,
    delay,
    className,
    inputProps,
  }: {
    inputState: [string, Dispatch<SetStateAction<string>>],
    delay?: number,
    className?: string,
    inputProps: React.InputHTMLAttributes<HTMLInputElement>,
  }
) {
  const [inputData, setInputData] = inputState;
  const [showX, setShowX] = useState(false);
  const [localValue, setLocalValue] = useState(inputData);

  useEffect(() => {
    if (delay) {
      const timeout = setTimeout(() => setInputData(localValue), delay);
      return () => clearTimeout(timeout);
    } else {
      setInputData(localValue);
    }
  }, [localValue]);

  const {
    onFocus,
    onBlur,
    className: inputClassName,
    ...otherProps
  } = inputProps;

  return (
    <div className={`${className || ''} showOutline flex items-stretch px-2 gap-2 ring-offset-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring transition duration-500`}>
      <Search className='text-muted-foreground shrink-0 m-auto' />
      <input className={`${inputClassName || ''} outline-none flex-1 min-w-24 w-full bg-transparent`}
        value={localValue}
        onChange={(e) => setLocalValue(e.currentTarget.value)}
        onFocus={(e) => {
          setShowX(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setShowX(false);
          onBlur?.(e);
        }}
        {...otherProps}
      />
      <X className={`text-muted-foreground cursor-pointer hover:ring-2 rounded-lg shrink-0 m-auto transition-opacity duration-500 ${showX ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setInputData('')}
      />
    </div>
  )
}
