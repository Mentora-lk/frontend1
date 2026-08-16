'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Socket.io attaches to the same HTTP server as the REST API, but is not
// mounted under the `/api` prefix — strip it to get the origin to connect to.
const SOCKET_URL = RAW_API_URL.replace(/\/api\/?$/, '');

export type CommunitySocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Joins the `community:<communityId>` Socket.io room (see backend src/socket.js)
 * so tutor + student community pages receive `new_community_post` /
 * `new_deadline` events pushed by tutorCommunityController in real time,
 * instead of only ever seeing new content after a manual refetch.
 *
 * Pass `communityId` as `undefined`/`null` to stay disconnected (e.g. while no
 * community is selected yet) — the hook connects/reconnects whenever it changes.
 */
export function useCommunitySocket(
  communityId: string | number | undefined | null,
  onNewPost?: (post: any) => void,
  onNewDeadline?: (deadline: any) => void
) {
  const [status, setStatus] = useState<CommunitySocketStatus>('disconnected');

  // Keep the latest callbacks in refs so a parent re-render (new callback
  // identity every render, as is typical with inline arrow functions) doesn't
  // force the socket to tear down and rejoin the room.
  const onNewPostRef = useRef(onNewPost);
  const onNewDeadlineRef = useRef(onNewDeadline);
  onNewPostRef.current = onNewPost;
  onNewDeadlineRef.current = onNewDeadline;

  useEffect(() => {
    if (!communityId) {
      setStatus('disconnected');
      return;
    }

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

    socket.on('connect', () => {
      setStatus('connected');
      socket.emit('join_community', { communityId });
    });

    socket.on('new_community_post', (post: any) => onNewPostRef.current?.(post));
    socket.on('new_deadline', (deadline: any) => onNewDeadlineRef.current?.(deadline));

    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', (err: Error) => {
      console.warn('[Community Socket] connect_error:', err.message);
      setStatus('error');
    });

    return () => {
      socket.emit('leave_community', { communityId });
      socket.disconnect();
    };
  }, [communityId]);

  return { status };
}
