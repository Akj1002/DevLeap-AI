import { useState, useEffect, useRef } from 'react';

export const useWebRTC = (initialState = true) => {
  const [cameraActive, setCameraActive] = useState(initialState);
  const [mediaError, setMediaError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setMediaError(null);
      } catch (err) {
        setMediaError("Hardware access denied.");
        setCameraActive(false);
      }
    };
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
    cameraActive ? startCamera() : stopCamera();
    return () => stopCamera();
  }, [cameraActive]);

  return { cameraActive, setCameraActive, videoRef, mediaError };
};