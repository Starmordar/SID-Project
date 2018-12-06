const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs')
const app = express();

const Product = require('./models/product');
const User = require('./models/user');

const fileContents = fs.readFileSync('jsonData/product.json', 'utf8');
const userContents = fs.readFileSync('jsonData/user.json', 'utf8');

try {
    const data = JSON.parse(fileContents);
    for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        Product.create(data[i], function () { });
    }
} catch (err) {
    console.error(err)
}

try {
    const data = JSON.parse(userContents);
    for (let i = 0; i < data.length; i++) {
        User.create(data[i], function () { });
    }
} catch (err) {
    console.error(err)
}

mongoose.connect('mongodb://localhost:27017/Shop-1', { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());


const routes = require('./routes/router');

app.use('/', routes);

app.use(function (req, res, next) {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

app.listen(3000, function () {
    console.log('Express app listening on port 3000');
});