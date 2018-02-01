const {saveAnswers, noAnswer} = require('./../controller/userController');

module.exports = (io) => {
  let testsLive = {};
  let connected = 0;
//Countdown from server

const CD = (sId, uTestId, sockConnected) => {
  return setInterval(() => {
      testsLive[uTestId].timeLeft -= 1;
      if (sockConnected) {
        io.to(sId).emit('countdown', {timeLeft: testsLive[uTestId].timeLeft});
      } else if (!sockConnected && !testsLive[uTestId].timeLeft) {
        clearInterval(testsLive[uTestId].SI);
        saveAnswers(testsLive[uTestId].answers, uTestId, testsLive[uTestId].uEmailId)
          .then(user => {
            console.log('saved');
          })
          .catch(error => {
            console.log('error');
          }) 
        delete testsLive[uTestId];
      }
    }, 1000);
}


  io.on('connection', (socket) => { 

    socket.on('monitor_test', (data) => {
      if (data.uTestId in testsLive) {
        //resume with the time
        socket.emit('go_live', { timeLeft: testsLive[data.uTestId].timeLeft,
                                  answers: testsLive[data.uTestId].answers});
        clearInterval(testsLive[data.uTestId].SI);
        testsLive[data.uTestId].sId = socket.id;
        socket.uTestId = data.uTestId;
        testsLive[data.uTestId].SI = null;
      } else {
        testsLive[data.uTestId] = {};
        testsLive[data.uTestId].uEmailId = data.uEmailId;
        testsLive[data.uTestId].sId = socket.id;
        socket.uTestId = data.uTestId; 
        socket.emit('go_live', {timeLeft: undefined, answers: []});
      }       
    })

    socket.on('pop_Live', (data) => {
      if (data.uTestId in testsLive) {
        delete testsLive[data.uTestId];
        socket.disconnect();
      }
    })

    socket.on('start_countdown', (data) => {
      testsLive[data.uTestId].timeLeft = data.timeLeft;
      testsLive[data.uTestId].answers = data.answers;
      testsLive[data.uTestId].SI = CD(testsLive[data.uTestId].sId, data.uTestId, true);
    })

    socket.on('save_answer', (data) => {
      testsLive[data.uTestId].answers = data.answers;      
    })


    socket.on('stopCD', (data) => {
      clearInterval(testsLive[data.uTestId].SI);
      delete testsLive[data.uTestId];
    })

    socket.on('sub_answers', (data) => {
      saveAnswers(data.answers, data.uTestId, data.uEmailId)
        .then(user => {
          socket.emit('see_result');
          socket.disconnect(true);  
        })
        .catch(error => {
          console.log(error);
          socket.emit('go_home');
        })
    })


    socket.on('disconnect', () => {
      if (socket.uTestId in testsLive) {
        clearInterval(testsLive[socket.uTestId].SI);
        testsLive[socket.uTestId].SI = CD(null , socket.uTestId, false);
      }
    })
 
  })
}

