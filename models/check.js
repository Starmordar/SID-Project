const mongoose = require('mongoose');

const CheckSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    customer: {
        type: String,
        required: true,
    }
});

const Check = mongoose.model('Check', CheckSchema);
module.exports = Check;