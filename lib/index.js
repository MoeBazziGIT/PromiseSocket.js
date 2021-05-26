import { v4 as uuid } from 'uuid';

export default class PromiseSocket{

  constructor(webSocket){
    this.webSocket = webSocket;
  }

  // instance method for sending message
  sendMessage(message, timeout){

    return PromiseSocket.sendMessage(this.webSocket, message, timeout);

  }

  // class object static method for sending message
  static sendMessage(webSocket, message, timeout){

    let promiseSocketId = uuid();
    message.promiseSocketId = promiseSocketId;

    if(typeof message !== 'string'){
      message = JSON.stringify(message);
    }

    return new Promise((resolve, reject) => {

      function onWebSocketMessageReceived(event){

        const message = JSON.parse(event.data);

        if(message.promiseSocketId === promiseSocketId){
          clearTimeout(timeoutHandler);
          webSocket.removeEventListener("message", onWebSocketMessageReceived);
          resolve(message);
        }

      }

      // listen for websocket messages
      webSocket.addEventListener("message", onWebSocketMessageReceived);

      var timeoutHandler = null;
      if(timeout){
        timeoutHandler = setTimeout(() => {
          webSocket.removeEventListener("message", onWebSocketMessageReceived);
          reject();
        }, timeout);
      }

      webSocket.send(message);
    });
  }


  listen(onMessageCallback){
    PromiseSocket.listen(this.websocket, onMessageCallback);
  }

  static listen(webSocket, callback){

      webSocket.addEventListener("message", onWebSocketMessageReceived);

      function onWebSocketMessageReceived(event){

        console.log("RCVD", event.data);

        const isTargetMessage = callback(event);
        if(isTargetMessage){
          webSocket.removeEventListener("message", onWebSocketMessageReceived);
        }
      }
  }
}
