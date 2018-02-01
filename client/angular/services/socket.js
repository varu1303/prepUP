angular.module('quizApp')
  .service('socket', socket);
  
function socket($rootScope) {
  let socket = io({
    autoConnect: false,
    reconnection: false
  }); 

  this.one = () => socket;

  this.on = (eventName, callback) => {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
  }

  this.one = () => socket;

  this.emit = (eventName, data, callback) => {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
}