const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const router = express.Router();

var http = require('http');
var app = express();

// part socket.io
var server = http.createServer(app);
var io = require('socket.io')(server);
//

app.use(session({
    secret: 'secret',
    // create new redis store.
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/views'));

router.get('/',(req,res) => {
    if(client.get('username')) {
        return res.redirect('/play');
    }
    res.sendFile('index.html');
});

router.post("/login",(req,res) => {
    client.set('username', req.body.username);
    sess = client.get('username');
    console.log(sess);
    res.end('done');
});

router.post("/stream",(req,res) => {
  client.set('action', req.body.key);
  sess = client.get('action');
  setTimeout(() => {}, 200);
  console.log(req.body.key);
  res.end('done');
});

router.get('/streaming', (req,res) => {
    res.sendFile('streaming.html', { root: __dirname + '/views' });
});

router.get('/play',(req,res) => {
    if(client.get('username')) {
        res.sendFile('play.html', { root: __dirname + '/views' });
    }
    else {
        res.write('<h1>Please login first.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
    }
});

router.get('/logout',(req,res) => {
    client.flushdb((err, succeeded) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

app.use('/', router);

/*app.listen(process.env.PORT || 3000,() => {
    console.log(`App Started on PORT ${process.env.PORT || 3000}`);
});*/
server.listen(3000);

// aki empieza la mierda

var numUsers = 0;

io.on('connection', (socket) => {
    var addedUser = false;
  
    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });
  
    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
      if (addedUser) return;
  
      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });
  
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    socket.on('action', (data) => {
      io.emit('action-receiver', data);
    });

    socket.on('player1XY', (data) => {
      io.emit('movePlayer1',data);
    });

    socket.on('player2XY', (data) => {
      io.emit('movePlayer2',data);
    });
  
    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });
  
    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
      if (addedUser) {
        --numUsers;
  
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  });