import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { RoomService } from '../services/room.service';

export const roomGuard: CanActivateFn = async (route, state) => {
  const roomService = inject(RoomService);
  const router = inject(Router);
  
  // If already connected to a room, allow access
  if (roomService.isConnected() && roomService.getCurrentRoom()) {
    return true;
  }

  // Check if there's a room ID in the URL
  const roomId = route.params['id'];
  
  if (roomId && roomId.length === 6) {
    // Store the room ID for the home page to use
    sessionStorage.setItem('pendingRoomId', roomId);
    console.log('Room ID in URL, redirecting to home to join:', roomId);
    router.navigate(['/'], { queryParams: { room: roomId } });
    return false;
  }

  console.warn('Access denied: Not connected to a room');
  router.navigate(['/']);
  return false;
};

