// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    description: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

let Category;

try {
  Category = mongoose.model("Category");
} catch (error) {
  Category = mongoose.model("Category", categorySchema);
}

module.exports = Category;
