// src/api/mongoDb.ts
import * as dotenv from "dotenv";
dotenv.config();
import mongoose, { Document, Schema } from "mongoose";
import { Category as CategoryType, Question as QuestionType } from "@/types";

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");

    console.log("Connected to the MongoDB database.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export const closeDbConnection = async () => {
  await mongoose.connection.close();
};

export const CategorySchema = new Schema<CategoryType & Document>({
  id: String,
  name: String,
  description: String,
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
});

export const QuestionSchema = new Schema<QuestionType & Document>({
  id: String,
  text: String,
  category: { type: String, ref: "Category" },
});

// const Question = mongoose.model("Question", QuestionSchema);

export const getCategoryModel = () => {
  if (mongoose.models.Category) {
    return mongoose.model<CategoryType & Document>("Category");
  } else {
    return mongoose.model<CategoryType & Document>("Category", CategorySchema);
  }
};

export const getQuestionModel = () => {
  if (mongoose.models.Question) {
    return mongoose.model<QuestionType & Document>("Question");
  } else {
    return mongoose.model<QuestionType & Document>("Question", QuestionSchema);
  }
};
