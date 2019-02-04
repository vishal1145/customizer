var serveStatic = require('serve-static');
const express = require('express')
const app = express();

app.use('/', serveStatic(__dirname + '/')); // serve static files
app.use('/public', serveStatic(__dirname + '/public')); // serve static files
app.use('/vendors', serveStatic(__dirname + '/vendors')); // serve static files
app.use('/dist', serveStatic(__dirname + '/dist')); // serve static files
app.use('/wp-content', serveStatic(__dirname + '/wp-content')); // serve static files
app.use('/wp-includes', serveStatic(__dirname + '/wp-includes'));

const port = 9111;


app.get('*', (req, res) => res.sendfile('./index.html'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))