// models/Question.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    id: Number,
    text: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

let Question;

try {
  Question = mongoose.model("Question");
} catch (error) {
  Question = mongoose.model("Question", questionSchema);
}

module.exports = Question;
