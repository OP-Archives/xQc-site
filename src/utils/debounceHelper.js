import { useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';

export const useDebouncedCallback = (callback, delay) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useRef(
    debounce((...args) => {
      callbackRef.current(...args);
    }, delay)
  );

  useEffect(() => {
    return () => debouncedFn.current.cancel();
  }, []);

  return debouncedFn.current;
};

export const useDebouncedSetter = (setter, delay) => {
  const setterRef = useRef(setter);

  useEffect(() => {
    setterRef.current = setter;
  }, [setter]);

  const debouncedFn = useRef(
    debounce((value) => {
      if (value !== undefined && value !== '' && value !== null) {
        setterRef.current(value);
      }
    }, delay)
  );

  useEffect(() => {
    return () => debouncedFn.current.cancel();
  }, []);

  return debouncedFn.current;
};
