// src/pages/api/categories/sanitize.ts
import { NextApiRequest, NextApiResponse } from "next";
import {
  connectDb,
  closeDbConnection,
  getQuestionModel,
  getCategoryModel,
} from "@/mongoDb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { categoryName } = req.body;

    if (typeof categoryName !== "string") {
      res.status(400).json({ error: "Invalid category name", categoryName });
      return;
    }

    try {
      await connectDb();
      const Question = getQuestionModel();
      const Category = getCategoryModel();

      const category = await Category.findOne({ name: categoryName });

      if (!category) {
        res.status(404).json({ errorMsg: "Category not found", categoryName });
        return;
      } else {
        console.log(`Successfully found category: ${categoryName}`);
      }

      console.log("Sanitizing questions...");

      await sanitizeQuestions(Question, category);

      const questions = await Question.find({
        _id: { $in: category.questions },
      });

      console.log("Sanitization complete.");
      res.status(200).json({ sanitizedQuestions: questions });
    } catch (error) {
      console.error("Error sanitizing questions:", error);
      res.status(500).json({
        errorMsg: "Error sanitizing questions",
        error: error.message ?? error,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

async function sanitizeQuestions(model, category) {
  const Question = model;
  const questions = await Question.find({
    _id: { $in: category.questions },
  });

  console.log("Found questions:", questions.length);

  const sanitizeTasks = questions.map(async (question) => {
    if (!question.text) {
      console.log("Question text is empty:", question._id);
      console.log("Deleting question...");
      await Question.findByIdAndDelete(question._id).then((deletedQuestion) => {
        console.log("Deleted question:", deletedQuestion);
        return deletedQuestion;
      });
      return;
    }
    if (question.text.startsWith("- ")) {
      question.text = question.text.substring(2); // Remove the "- " prefix
      console.log("Sanitized question:", question.text);
      question.validateSync(); // Validate the sanitized question
      return await question.save().then((savedQuestion) => {
        savedQuestion === question; // true
      }); // Save the sanitized question back to the database
    }

    if (question.text.startsWith("Question")) {
      const regex = /^Question \d+(?::|=) /;
      // Remove the "Question" prefix
      question.text = question.text.replace(regex, "");
      console.log("Sanitized question:", question.text);
      question.validateSync(); // Validate the sanitized question
      return await question.save().then((savedQuestion) => {
        savedQuestion === question; // true
      }); // Save the sanitized question back to the database
    }
  });

  await Promise.all(sanitizeTasks);
}

export default handler;
