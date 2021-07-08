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
      PromiseSocket.listen(webSocket, timeout, { promiseSocketId })
        .then(messageEvent => resolve(JSON.parse(messageEvent.data)))
        .catch(() => reject());

      webSocket.send(message);
    });
  }


  listen(timeout, filterParams){
    return PromiseSocket.listen(this.websocket, timeout, filterParams);
  }

  static listen(webSocket, timeout, filterParam){

    return new Promise((resolve, reject) => {
      webSocket.addEventListener("message", onWebSocketMessageReceived);

      let timeoutHandler = null;
      if(timeout){
        timeoutHandler = setTimeout(() => {
          webSocket.removeEventListener("message", onWebSocketMessageReceived);
          reject();
        }, timeout);
      }

      function onWebSocketMessageReceived(event){

        if(filterParam){
          const message = JSON.parse(event.data);
          const filterKey = Object.keys(filterParam)[0];

          if(message[filterKey] === filterParam[filterKey]){
            clearTimeout(timeoutHandler);
            webSocket.removeEventListener("message", onWebSocketMessageReceived);
            resolve(event);
          }
        }
      }
    });
  }

}
