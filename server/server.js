console.log("test message");
var express = require('express');
var fs = require('fs');
const rateLimit = require("express-rate-limit");
var apiRouter = require('./router');
var serveStatic = require('serve-static');
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
    io.emit('this', { will: 'be received by everyone' });

    /*  socket.on('private message', function (from, msg) {
          console.log('I received a private message by ', from, ' saying ', msg);
      });*/

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});
//TODO forward the location in a better way
var config = {
    storageLocation: "../../uploads"

}
app.use("/images", express.static(config.storageLocation));
app.use('/uploads', serveStatic(__dirname + '/uploads'));
app.use("/", express.static('../dist/gun-customizer'));
// -----------------------------------

var ithours = require('ithours');
var config = {
    codes: 'codes.json',
    environment: 'environment.json'
}
var itHoursModule = ithours.initilaize(app, config);
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



const port = 9502;

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



/**
 * Limit API calls to 100 per hour and ip
 * @type {rateLimit}
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: "Too many API calls from this IP, please try again after an hour" }
});


app.use("/api", apiLimiter, apiRouter);



/**************************************************/





var twitterRouter = require("./twitterRouter")(config)
app.use('/twitter', apiLimiter, twitterRouter)


var multer = require('multer');
//var upload = multer({ dest: 'uploads/' })
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  var upload = multer({storage: storage}).single('avatar');

app.post('/profile', function (req, res) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    upload(req, res, function(err, result){
        console.log(req)
            //var apipath = environment.apipath;
          var apipath  = itHoursModule.core.getEnvironmentVariable('apipath');
          return res.send({path : apipath + "uploads/" + req.file.originalname})
      })
})


console.log("---- server started ----")
console.log("listening on port:", port);
//app.listen(port);




