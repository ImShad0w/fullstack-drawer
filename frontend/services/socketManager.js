import { io } from "socket.io-client";

//To see if it's with development mode or not
const socketURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "http://backend:3000";

export default class SocketManager {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  connect() {
    this.socket = io(socketURL);

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
