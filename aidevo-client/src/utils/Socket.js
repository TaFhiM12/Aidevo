import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Add polling as fallback
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server');
        this.isConnected = true;
        this.connectionAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        this.connectionAttempts++;
        console.error('Connection error:', error.message);
        this.isConnected = false;
        
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          console.warn('Max connection attempts reached. Stopping retries.');
          this.socket.disconnect();
        }
      });

      this.socket.on('reconnect_attempt', (attempt) => {
        console.log(`Reconnection attempt ${attempt}`);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionAttempts = 0;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Fix: This was conflicting with the property
  getIsConnected() {
    return this.isConnected;
  }
}

export default new SocketService();