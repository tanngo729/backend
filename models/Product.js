const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    description: String,
    image: String,
    position: Number,
    stock: Number,
    discountPercentage: Number,
    slug: {
      type: String,
      slug: "name",
      unique: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    status: String,
    deletedAt: Date
  }, {
  timestamps: true
}
)

const Product = mongoose.model("Product", productSchema, 'products');

module.exports = Product;