const {getOrigin} = require("./util");

const {convertVideoContent, outputConfigurations, inputConfigurations} = require('./converter');
var express = require('express');
var multer = require('multer');
var fs = require('fs');
const rateLimit = require("express-rate-limit");
const uuidv4 = require('uuid/v4');
var validate = require('uuid-validate');

var router = require('express').Router();
var config = require('./config')

var path = require('path');


/**
 * Route that generates the meta tags for open graph interoperability.
 * Note: The :id is the base filename of the uploaded gif.
 */
router.get('/share/:id/:format?', (req, res) => {



    const origin = getOrigin(req) //req.protocol + '://' + req.headers.host
    //check for valid uuid
    const url = origin + req.originalUrl;

    const result = validate.version(req.params.id)
    const available = ["gif", "m4v","mp4"]
    let format = req.params.format ? req.params.format.replace(/[^a-z0-9]/gi, '') : "gif";


    if (result != 4 || available.indexOf(format) < 0) {

        res.status(404)        // HTTP status 404: NotFound
            .send('Not found');

        return
    }


    if (format == "gif")
        res.render('template', {
            image: origin + "/images/" + req.params.id + ".gif",
            title: config.title,
            description: config.description,
            origin,
            url
        })
    else if (format == "m4v")
        res.render('template-video', {
            image: origin + "/images/" + req.params.id + ".jpg",
            video: origin + "/images/" + req.params.id + ".m4v",
            title: config.title,
            description: config.description,
            origin,
            url
        });


});

/**
 * Limit file uploads to 5 per hour and ip.
 * @type {rateLimit}
 */
const createGIFLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // start blocking after 5 requests
    message: {error: "Too many GIFs created from this IP, please try again after an hour"}
});

/**
 * Describe storage location for uploaded files.
 * Note: Uploaded files will be renamed with random uuid-v4
 * @type {*|DiskStorage}
 */
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = config.storageLocation; //'./uploads';


        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {


        const newFileName = uuidv4() + ".gif";


        callback(null, newFileName);
    }
});

//
var upload = multer({storage: storage}).single('files'); //.array('files', 12);

/**
 * Handle file upload and return JSON containing information how to access stored content
 */

router.post('/upload', createGIFLimiter, function (req, res, next) {

    upload(req, res, function (err) {
        if (err) {
            return res.send({error: "Something went wrong while uploading GIF"});
        }

        const format = "gif"

        const id = req.file.filename.split(".")[0]

        console.log("---- saved to ----")
        console.log(config.storageLocation + "/" + id + "." + format)


        res.send({
            //path: req.file.path,
            id,
            format
        })
    });
})


/**
 * Describe storage location for uploaded files.
 * Note: Uploaded files will be renamed with random uuid-v4
 * @type {*|DiskStorage}
 */
var tarStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = config.storageLocation; //'./uploads';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {


        const newFileName = uuidv4() + ".tar";


        callback(null, newFileName);
    }
});

//
var uploadTar = multer({storage: tarStorage}).single('files'); //.array('files', 12);

router.post('/uploadTar', createGIFLimiter, function (req, res, next) {

    uploadTar(req, res, function (err) {
        if (err) {
            return res.send({error: "Something went wrong while uploading TAR"});
        }

        const id = req.file.filename.split(".")[0]

        let tarFilename = path.resolve(__dirname, config.storageLocation + "/" + id + ".tar")

        console.log("---- saved to ----")
        console.log(tarFilename)

        // preemptively return to client
        res.send({
            //path: req.file.path,
            id, format: "mp4"// mConfig.format
        })
//TODO find a better way to return the data for the sharing url early but still be flexible with file formats

        convertTarToTargetFormats(tarFilename, function progressCallback(data) {

            req.app.io.emit('convert-progress', data);

        })

    });
})


async function convertTarToTargetFormats(tarFilename, progressCallback) {


    var targetFilename = path.dirname(tarFilename) + "/" + path.basename(tarFilename,".tar") //+ "." + format;

    console.log("targetFilename",targetFilename)

    await convertVideoContent(tarFilename, inputConfigurations.tarArchiveInput30FPSConfig, targetFilename, outputConfigurations.mp4HighQualityConfig, progressCallback)


    //FIXME pipe progress does not finish fore jpg ... but only with 120 frames settings ..
    // if only 2 frames are inside the tar it will return a finish event
    setTimeout(()=>{
        progressCallback({format: outputConfigurations.jpgConfig.format,percentage:100})
    },1000)

    await convertVideoContent(tarFilename, inputConfigurations.tarArchiveInput30FPSConfig, targetFilename, outputConfigurations.jpgConfig,progressCallback)



}


/**
 * - to be able a file a token is needed that has to be sent when  uploading it
 * - alternativly it might be easier to only allow deleting a file for a small amount of time
 *   in which case 2 minutes after uploading it should be sufficient
 */

router.get('/delete/:id', (req, res) => {



    //TODO use either node-cache or store for IPs

    //check for valid uuid
    const result = validate.version(req.params.id)
    if (result == 4) {
        const filename = config.storageLocation + "/" + id + ".gif"
        fs.stat(filename, function (err, stats) {


            console.log(stats);//here we got all information of file in stats variable

            //FIXME if file age > 2minutes ago => error no longer allowed

            if (err) {
                return console.error(err);
            }

            fs.unlink(filename, function (err) {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            });
        });

    }
    else
        res.status(404)
            .send('Not found');


})


module.exports = router;