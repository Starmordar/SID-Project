const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  price: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  }
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;