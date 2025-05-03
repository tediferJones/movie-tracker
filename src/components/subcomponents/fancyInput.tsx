import { Search, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function FancyInput(
  {
    inputState,
    placeholder,
  }: {
    inputState: [string, Dispatch<SetStateAction<string>>]
    placeholder?: string
  }
) {
  const [inputData, setInputData] = inputState;
  const [showX, setShowX] = useState(false);
  const [localValue, setLocalValue] = useState(inputData);
  // let searchTimeout: NodeJS.Timeout;

  // timeout should be optional, sometimes we will want to set state instantly
  useEffect(() => {
    const timeout = setTimeout(() => setInputData(localValue), 250);
    return () => clearTimeout(timeout);
  }, [localValue]);

  return (
    <div className='showOutline p-2 flex gap-2 ring-offset-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring transition duration-500'>
      <Search className='text-muted-foreground' />
      <input className='outline-none'
        value={localValue}
        onChange={(e) => setLocalValue(e.currentTarget.value)}
        // onChange={(e) => {
        //   const value = e.currentTarget.value;
        //   if (searchTimeout) clearTimeout(searchTimeout);
        //   searchTimeout = setTimeout(() => setInputData(value), 250);
        // }}
        type='text'
        placeholder={placeholder}
        onFocus={() => setShowX(true)}
        onBlur={() => setShowX(false)}
      />
      <X className={`text-muted-foreground cursor-pointer hover:ring-2 rounded-lg transition-opacity duration-500 ${showX ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setInputData('')}
      />
    </div>
  )
}
