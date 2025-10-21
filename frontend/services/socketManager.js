import { io } from "socket.io-client";

export default class SocketManager {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  connect() {
    this.socket = io("http://localhost:3000");

    this.socket.on("connect", () => {
      console.log("Connected to server!");
    });

    this.socket.onAny((event, data) => {
      if (this.callbacks[event]) {
        this.callbacks[event](data);
      }
    });
  }

  on(eventName, callback) {
    this.callbacks[eventName] = callback;
  }
  //Sending the server data
  emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }
}
