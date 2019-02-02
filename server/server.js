console.log("test message");
var express = require('express');
var fs = require('fs');
const rateLimit = require("express-rate-limit");
var apiRouter = require('./router');

var app = express();
var bodyParser = require('body-parser');
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 50000
}));

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.io = io;

// -----------------------------------
io.on('connection', function (socket) {
    io.emit('this', { will: 'be received by everyone'});

  /*  socket.on('private message', function (from, msg) {
        console.log('I received a private message by ', from, ' saying ', msg);
    });*/

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});

// -----------------------------------

var ithours = require('ithours');
var config = {
    codes : 'codes.json',
    environment:'environment.json'
}
var itHoursModule =  ithours.initilaize(app,config);
var mongoose = require('mongoose');

function connectToDB() {
  
    mongoose.connect(itHoursModule.core.getEnvironmentVariable('database'), { useNewUrlParser: true }, function (err) {
        if (err) {
            console.log("Error connecting in database");
            try { console.log(JSON.stringify(err)); }
            catch (dberr) { console.log(dberr); }
            setTimeout(function () {
                connectToDB();
            }, 1000);
        }
        else {
      console.log(itHoursModule.core.getEnvironmentVariable('database'))
        }
    });
}
connectToDB();



const port=3000

server.listen(port);
// WARNING: app.listen(80) will NOT work here!

app.set('view engine', 'ejs');

app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)


var config = require('./config')

/**
 * Add cors headers.
 */

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * Serve static images folder.
 */
console.log("---- server config ----")
console.log(config)

app.use("/images",express.static( config.storageLocation));
app.use("/",express.static('../dist/gun-customizer'));


/**
 * Limit API calls to 100 per hour and ip
 * @type {rateLimit}
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {error: "Too many API calls from this IP, please try again after an hour"}
});


app.use("/api",apiLimiter, apiRouter);



/**************************************************/


//TODO forward the location in a better way
var config = {
    storageLocation: "../../uploads"

}


var twitterRouter = require("./twitterRouter")(config)
app.use('/twitter',apiLimiter,twitterRouter)





console.log("---- server started ----")
console.log("listening on port:",port);
//app.listen(port);




