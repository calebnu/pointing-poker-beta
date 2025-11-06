import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3001';

  constructor() {}

  connect(): void {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response: any) => {
        if (response?.success === false) {
          reject(new Error(response.error || 'Unknown error'));
        } else {
          resolve(response);
        }
      });
    });
  }

  on<T>(event: string): Observable<T> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error(new Error('Socket not connected'));
        return;
      }

      const handler = (data: T) => {
        observer.next(data);
      };

      this.socket.on(event, handler);

      return () => {
        if (this.socket) {
          this.socket.off(event, handler);
        }
      };
    });
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

