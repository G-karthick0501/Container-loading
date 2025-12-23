import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket(jobId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected');
      setConnected(true);
      
      if (jobId) {
        socketRef.current.emit('join-job', jobId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnected(false);
    });

    socketRef.current.on('optimization-started', (data) => {
      console.log('⚙️ Optimization started:', data);
      setProgress({ status: 'started', ...data });
    });

    socketRef.current.on('optimization-progress', (data) => {
      console.log('📊 Progress:', data.progress + '%');
      setProgress({ status: 'running', ...data });
    });

    socketRef.current.on('optimization-complete', (data) => {
      console.log('✅ Optimization complete:', data);
      setProgress({ status: 'complete', ...data });
    });

    socketRef.current.on('optimization-error', (data) => {
      console.log('❌ Optimization error:', data);
      setProgress({ status: 'error', ...data });
    });

    return () => {
      if (socketRef.current) {
        if (jobId) {
          socketRef.current.emit('leave-job', jobId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [jobId]);

  // Join new job room when jobId changes
  useEffect(() => {
    if (socketRef.current && connected && jobId) {
      socketRef.current.emit('join-job', jobId);
    }
  }, [jobId, connected]);

  const resetProgress = () => setProgress(null);

  return { connected, progress, resetProgress };
}