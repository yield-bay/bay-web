import { useCallback, useEffect, useRef } from "react";

const useKeyPress = (
  keys: any,
  callback: (value: any) => void,
  node = null
) => {
  // implement the callback ref pattern
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, callbackRef]);

  // handle keypress down event
  const handleKeyPress = useCallback(
    (event: any) => {
      if (keys.some((key: string) => event.key === key)) {
        callbackRef.current(event);
      }
    },
    [keys]
  );

  useEffect(() => {
    // target is either the provided node or the document
    const targetNode = node ?? document;
    targetNode && targetNode.addEventListener("keydown", handleKeyPress);

    return () => {
      targetNode && targetNode.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, node]);
};

export default useKeyPress;
