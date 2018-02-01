const express = require('express');
const app = express();
//
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);
const liveTest = require('./server/socket/liveTest');
//
const db = require('./server/mongo/mongoConnect');
//
const passport = require('passport');
app.use(passport.initialize());
const authenticationRouter = require('./server/routes/authRouter');
const userRouter = require('./server/routes/userRouter');
const adminRouter = require('./server/routes/adminRouter');
//
const bodyParser = require('body-parser');
const path = require('path');
//
liveTest(io);

app.use(express.static('./client'));
app.use(bodyParser.json());
//
app.use('/auth', authenticationRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);


app.get('*',(req, res) => {
	res.sendFile(path.join(__dirname + '/client/index.html'));
})

db.on('connected',function() {
	console.log('Connected to Mongo');
	server.listen(8080, () => {
		console.log('Listening on port 8080');
	})
});

db.on('error',function(err) {
	console.log(`MongoDB default connection error ${err}`);
})