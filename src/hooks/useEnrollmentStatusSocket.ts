'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Socket.io attaches to the same HTTP server as the REST API, but is not
// mounted under the `/api` prefix — strip it to get the origin to connect to.
const SOCKET_URL = RAW_API_URL.replace(/\/api\/?$/, '');

export type EnrollmentStatusSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Connects to Socket.io as the logged-in student. The backend auto-joins
 * every connected socket to a personal `user:<id>` room (see backend
 * src/socket.js), so no explicit join is needed here — this just listens for
 * `enrollment_status_updated`, pushed by enrollmentController.updateEnrollmentStatus
 * whenever a tutor approves/rejects one of this student's enrollments.
 */
export function useEnrollmentStatusSocket(onStatusUpdated?: (update: any) => void) {
  const [status, setStatus] = useState<EnrollmentStatusSocketStatus>('connecting');

  // Keep the latest callback in a ref so a parent re-render (new callback
  // identity every render) doesn't force the socket to reconnect.
  const onStatusUpdatedRef = useRef(onStatusUpdated);
  onStatusUpdatedRef.current = onStatusUpdated;

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setStatus('error');
      return;
    }

    setStatus('connecting');
    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => setStatus('connected'));
    socket.on('enrollment_status_updated', (update: any) => onStatusUpdatedRef.current?.(update));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', (err: Error) => {
      console.warn('[Enrollment Status Socket] connect_error:', err.message);
      setStatus('error');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { status };
}
