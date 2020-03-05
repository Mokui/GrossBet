const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const router = express.Router();
const app = express();

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

router.post('/login',(req,res) => {
    client.set('username', req.body.username);
    sess = client.get('username');
    console.log(sess);
    res.end('done');
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

app.listen(process.env.PORT || 3000,() => {
    console.log(`App Started on PORT ${process.env.PORT || 3000}`);
});