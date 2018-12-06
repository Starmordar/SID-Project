const express = require('express');
const router = express.Router();
const path = require('path');
const Product = require('../models/product');
const User = require('../models/user');
const Check = require('../models/check');

let buffer;

router.get('/', function (req, res, next) {
    res.sendFile(path.resolve(__dirname + '/../views/main.html'));
});

router.get('/check', function (req, res, next) {
    res.sendFile(path.resolve(__dirname + '/../views/check.html'));
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
    User.findOne({ card_number: req.body.card_number }, function (error, user) {
        if (error) {
            return next(error);
        } else {
            if (user === null) {
                var err = new Error('user doesn\'t exist');
                res.status(400);
                res.send('User doesn\'t exist');
                return next(err);
            } else {
                let balance = user.balance - req.body.balance;
                if (balance < 0) {
                    res.status(400).send('Недостаточно средств');
                    return;
                }
                user.balance = balance;
                user.save();
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
                            res.send({ user: user, product: product });
                        }
                    }
                });
            }
        }
    });
});

router.post('/checkList', function (req, res, next) {
    console.log(req.body);
    try {
        Check.create(req.body, function () { });
    } catch (err) {
        console.error(err)
    }
    res.send('easy, my friend');
});

router.post('/getCheckList', function (req, res, next) {
    let checkList = [];
    Check.find({}, function (error, check) {
        if (error) {
            return next(error);
        } else if (!check) {
            return next(new Error("check not found"))
        }
        for (const prop in check) {
            let object = check[prop];
            let product = (({ date, product, price, customer }) => ({ date, product, price, customer }))(object);
            checkList.push(product)
        }
        res.send(checkList);
    });
});


module.exports = router;