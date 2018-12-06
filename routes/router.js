const express = require('express');
const router = express.Router();
const path = require('path');
const Product = require('../models/product');
const User = require('../models/user');

let buffer;

router.get('/', function (req, res, next) {
    res.sendFile(path.resolve(__dirname + '/../views/main.html'));
});

router.get('/product/:productid', function (req, res, next) {
    res.sendFile(path.resolve(__dirname + '/../views/product.html'));
});

router.post('/getProducts', function (req, res, next) {
    let bunchOfProducts = [];
    Product.find({}, function (error, products) {
        if (error) {
            return next(error);
        } else if (!products) {
            return next(new Error("Products not found"))
        }
        for (const prop in products) {
            let object = products[prop];
            let product = (({ id, name, price, quantity }) => ({ id, name, price, quantity }))(object);
            bunchOfProducts.push(product)
        }
        res.send(bunchOfProducts);
    });
});

router.post('/createProduct', function (req, res, next) {
    let productData = req.body;
    Product.create(productData, function (error) {
        if (error) {
            return next(error);
        }
        res.sendStatus(200);
    });
});

router.post('/saveName', function (req, res, next) {
    Product.findOne({ name: req.body.name }, function (error, product) {
        if (error) {
            return next(error);
        } else {
            if (product === null) {
                var err = new Error('Product doesn\'t exist');
                return next(err);
            } else {
                buffer = product;
                res.sendStatus(200);
            }
        }
    });
});

router.post('/getProductFromId', function (req, res, next) {
    let productId = req.body;
    console.log(productId);
    Product.findOne({ id: req.body.id }, function (error, product) {
        if (error) {
            return next(error);
        } else {
            if (product === null) {
                var err = new Error('Product doesn\'t exist');
                return next(err);
            } else {
                let object = product;
                product = (({ id, name, price, quantity }) => ({ id, name, price, quantity }))(object);
                res.send(product);
            }
        }
    });
});

router.post('/updateBalance', function (req, res, next) {
    User.findOne({ card_number: req.body.card_number }, function (error, product) {
        if (error) {
            return next(error);
        } else {
            if (product === null) {
                var err = new Error('Product doesn\'t exist');
                res.status(400);
                res.send('User doesn\'t exist');
                return next(err);
            } else {
                let balance = product.balance - req.body.balance;
                if (balance < 0) {
                    res.status(400).send('Недостаточно средств');
                    return;
                }
                product.balance = balance;
                product.save();
                res.status(200);
                
                Product.findOne({ name: req.body.name }, function (error, product) {
                    if (error) {
                        return next(error);
                    } else {
                        if (product === null) {
                            var err = new Error('Product doesn\'t exist');
                            return next(err);
                        } else {
                            let quantity = product.quantity - req.body.quantity;
                            product.quantity = quantity;
                            product.save();
                            res.send('easy');
                        }
                    }
                });
            }
        }
    });
});

module.exports = router;