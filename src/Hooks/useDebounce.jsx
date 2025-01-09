import { useEffect, useState } from 'react';
/**
 * 
 * @param {*} value - value that needs to be debounced 
 * @param {*} delay - delay added for debouncing
 * @returns debounced value
 */
function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => { clearTimeout(timer); };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
