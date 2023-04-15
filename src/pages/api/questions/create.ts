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
    const { text, categoryId } = req.body.data;

    if (typeof text !== "string") {
      res.status(400).json({ error: "Invalid text - must be string", text });
      return;
    }

    if (typeof categoryId !== "string") {
      res
        .status(400)
        .json({ error: "Invalid text - must be string", categoryId });
      return;
    }

    try {
      const newQuestion = createQuestion(text, categoryId);
      res.status(200).json({ categoryId, newQuestion });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({
        errorMsg: "Error fetching questions",
        error: error.message ?? error,
      });
    }
  } else if (req.method === "DELETE") {
    console.log("DELETE request received");
    console.log(req);
    const { questionId } = req.body;
    console.log("DELETE questionId:", questionId);
    await deleteQuestion(questionId);
    res.status(204).end();
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  console.log("deleteQuestion() called with questionId:", questionId);

  await connectDb();
  const Question = getQuestionModel();
  const Category = getCategoryModel();

  try {
    console.log("Deleting question:", questionId);
    console.log(Question);
    const question = await Question.find({ id: questionId });
    if (question) {
      await Question.deleteOne({ id: questionId });
      console.log("Question deleted:", questionId);
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

export async function createQuestion(
  text: string,
  categoryId: string
): Promise<void> {
  await connectDb();
  const Question = getQuestionModel();
  const Category = getCategoryModel();

  try {
    const category = await Category.findById(categoryId).populate("questions");

    if (!category) {
      console.error("Category not found:", categoryId);
      return;
    }

    let highestId = 0;
    for (const question of category.questions) {
      if (question.id > highestId) {
        highestId = question.id;
      }
    }

    const newQuestion = new Question({
      id: highestId + 1,
      text,
      category: categoryId,
    });

    await newQuestion.save();
    category.questions.push(newQuestion);
    await category.save();
    return newQuestion;
  } catch (error) {
    console.error("Error creating question:", error);
  }
}

export default handler;
