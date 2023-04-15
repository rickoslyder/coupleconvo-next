// src/pages/api/categories/questions.ts
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

      const allCategories = await Category.find().select("id name description");
      // console.log("All categories:", allCategories);

      const category = await Category.findOne({ name: categoryName });

      if (!category) {
        res.status(404).json({ errorMsg: "Category not found", categoryName });
        return;
      } else {
        console.log(`Successfully found category: ${categoryName}`);
        // console.log(category);
      }

      const questions = await Question.find({
        _id: { $in: category.questions },
      });
      res.status(200).json({ category, questions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({
        errorMsg: "Error fetching questions",
        error: error.message ?? error,
      });
    }
  } else if (req.method === "PUT") {
    const { questionId, updatedText } = req.body;

    try {
      await updateQuestion(questionId, updatedText);
      res.status(200).json({ questionId, updatedText });
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({
        errorMsg: "Error updating question",
        error: error.message ?? error,
      });
    }
  } else if (req.method === "DELETE") {
    const { questionId } = req.body;
    await deleteQuestion(questionId);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await connectDb();
  const Question = getQuestionModel();
  const Category = getCategoryModel();

  try {
    console.log("Deleting question:", questionId);
    console.log(Question);
    const question = await Question.findOne({ id: questionId });
    if (question) {
      await question.deleteOne();
    }
    if (!question) {
      console.error("Question not found:", questionId);
      return;
    }
    // Remove the reference to the deleted question from its category
    await Category.updateOne(
      { questions: { $in: [question._id] } },
      { $pull: { questions: question._id } }
    );

    await closeDbConnection();
  } catch (error) {
    console.error("Error deleting question:", error);
  }
}

export async function updateQuestion(
  questionId: string,
  updatedText: string
): Promise<void> {
  await connectDb();
  const Question = getQuestionModel();

  try {
    await Question.updateOne({ id: questionId }, { text: updatedText });
    await closeDbConnection();
  } catch (error) {
    console.error("Error updating question:", error);
  }
}

export default handler;
