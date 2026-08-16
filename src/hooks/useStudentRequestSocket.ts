'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Socket.io attaches to the same HTTP server as the REST API, but is not
// mounted under the `/api` prefix — strip it to get the origin to connect to.
const SOCKET_URL = RAW_API_URL.replace(/\/api\/?$/, '');

export type StudentRequestSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Connects to Socket.io as the logged-in student. The backend auto-joins
 * every connected socket to a personal `user:<id>` room (see backend
 * src/socket.js), so no explicit join is needed here — this just listens for
 * `membership_request_updated`, pushed by tutorCommunityController when a
 * tutor accepts or declines one of this student's community join requests.
 */
export function useStudentRequestSocket(onRequestUpdated?: (update: any) => void) {
  const [status, setStatus] = useState<StudentRequestSocketStatus>('connecting');

  // Keep the latest callback in a ref so a parent re-render (new callback
  // identity every render) doesn't force the socket to reconnect.
  const onRequestUpdatedRef = useRef(onRequestUpdated);
  onRequestUpdatedRef.current = onRequestUpdated;

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setStatus('error');
      return;
    }

    setStatus('connecting');
    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on('connect', () => setStatus('connected'));
    socket.on('membership_request_updated', (update: any) => onRequestUpdatedRef.current?.(update));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', (err: Error) => {
      console.warn('[Student Request Socket] connect_error:', err.message);
      setStatus('error');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { status };
}
