import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager';

const roomManager = RoomManager.getInstance();

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Store current room for this socket
    let currentRoomId: string | null = null;

    /**
     * Create a new room
     */
    socket.on('create-room', (data: { userName: string }, callback) => {
      try {
        const roomId = roomManager.createRoom();
        const userId = socket.id;
        
        // Join the user to the room
        roomManager.joinRoom(roomId, userId, data.userName);
        
        // Join the socket.io room
        socket.join(roomId);
        currentRoomId = roomId;
        
        // Send response
        callback({ 
          success: true, 
          roomId, 
          userId,
          roomState: roomManager.getRoomState(roomId)
        });
        
        console.log(`Room ${roomId} created by ${data.userName}`);
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create room' 
        });
      }
    });

    /**
     * Join an existing room or create it if it doesn't exist
     */
    socket.on('join-room', (data: { roomId: string; userName: string }, callback) => {
      try {
        const { roomId, userName } = data;
        const userId = socket.id;

        // Create the room if it doesn't exist
        if (!roomManager.roomExists(roomId)) {
          roomManager.createRoomWithId(roomId);
          console.log(`Room ${roomId} created automatically on join request`);
        }

        // Join the user to the room
        roomManager.joinRoom(roomId, userId, userName);
        
        // Join the socket.io room
        socket.join(roomId);
        currentRoomId = roomId;
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId,
          userName,
          roomState: roomManager.getRoomState(roomId)
        });
        
        // Send response with current room state
        callback({ 
          success: true, 
          roomId,
          userId,
          roomState: roomManager.getRoomState(roomId)
        });
        
        console.log(`${userName} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to join room' 
        });
      }
    });

    /**
     * Submit a vote
     */
    socket.on('submit-vote', (data: { roomId: string; vote: string }, callback) => {
      try {
        const { roomId, vote } = data;
        const userId = socket.id;

        console.log(`Vote submitted by ${userId} in room ${roomId}: ${vote}`);
        roomManager.submitVote(roomId, userId, vote);
        
        const roomState = roomManager.getRoomState(roomId);
        console.log('Broadcasting room-updated to room:', roomId, 'with state:', JSON.stringify(roomState, null, 2));
        
        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('room-updated', roomState);
        
        if (callback) {
          callback({ success: true });
        }
      } catch (error) {
        console.error('Error submitting vote:', error);
        if (callback) {
          callback({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to submit vote' 
          });
        }
      }
    });

    /**
     * Set task description
     */
    socket.on('set-description', (data: { roomId: string; description: string }, callback) => {
      try {
        const { roomId, description } = data;

        roomManager.setDescription(roomId, description);
        
        // Broadcast to everyone in the room
        io.to(roomId).emit('room-updated', roomManager.getRoomState(roomId));
        
        if (callback) {
          callback({ success: true });
        }
      } catch (error) {
        console.error('Error setting description:', error);
        if (callback) {
          callback({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to set description' 
          });
        }
      }
    });

    /**
     * Reveal votes
     */
    socket.on('reveal-votes', (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;

        roomManager.revealVotes(roomId);
        
        // Broadcast to everyone in the room
        io.to(roomId).emit('room-updated', roomManager.getRoomState(roomId));
        
        if (callback) {
          callback({ success: true });
        }
      } catch (error) {
        console.error('Error revealing votes:', error);
        if (callback) {
          callback({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to reveal votes' 
          });
        }
      }
    });

    /**
     * Clear votes
     */
    socket.on('clear-votes', (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;

        roomManager.clearVotes(roomId);
        
        // Broadcast to everyone in the room
        io.to(roomId).emit('room-updated', roomManager.getRoomState(roomId));
        
        if (callback) {
          callback({ success: true });
        }
      } catch (error) {
        console.error('Error clearing votes:', error);
        if (callback) {
          callback({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to clear votes' 
          });
        }
      }
    });

    /**
     * Leave room
     */
    socket.on('leave-room', (data: { roomId: string }) => {
      try {
        const { roomId } = data;
        const userId = socket.id;

        console.log(`User ${userId} leaving room ${roomId}`);
        socket.leave(roomId);
        roomManager.leaveRoom(roomId, userId);
        
        // Notify others if room still exists
        if (roomManager.roomExists(roomId)) {
          const roomState = roomManager.getRoomState(roomId);
          console.log('Broadcasting user-left to room:', roomId, 'with state:', JSON.stringify(roomState, null, 2));
          socket.to(roomId).emit('user-left', {
            userId,
            roomState
          });
        } else {
          console.log(`Room ${roomId} no longer exists after user left`);
        }
        
        currentRoomId = null;
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (currentRoomId) {
        try {
          const userId = socket.id;
          console.log(`Disconnected user ${userId} was in room ${currentRoomId}`);
          roomManager.leaveRoom(currentRoomId, userId);
          
          // Notify others if room still exists
          if (roomManager.roomExists(currentRoomId)) {
            const roomState = roomManager.getRoomState(currentRoomId);
            console.log('Broadcasting user-left (disconnect) to room:', currentRoomId, 'with state:', JSON.stringify(roomState, null, 2));
            socket.to(currentRoomId).emit('user-left', {
              userId,
              roomState
            });
          } else {
            console.log(`Room ${currentRoomId} no longer exists after disconnect`);
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });
  });
}

