/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastArgsRef = useRef<Parameters<T> | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const throttledFunction = useCallback((...args: Parameters<T>) => {
        lastArgsRef.current = args;
        if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
                if (lastArgsRef.current) {
                    callbackRef.current(...lastArgsRef.current);
                    lastArgsRef.current = null;
                }
                timeoutRef.current = null;
            }, delay);
        }
    }, [delay]);

    return throttledFunction;
}