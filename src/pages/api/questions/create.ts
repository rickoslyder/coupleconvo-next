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
    const { text, categoryId, categoryName } = req.body;

    if (typeof text !== "string") {
      console.log("Invalid text - must be string", text);
      res.status(400).json({ error: "Invalid text - must be string", text });
      return;
    }

    if (categoryId && typeof categoryId !== "string") {
      res
        .status(400)
        .json({ error: "Invalid categoryId - must be string", categoryId });
      return;
    }

    if (categoryName && typeof categoryName !== "string") {
      res
        .status(400)
        .json({ error: "Invalid categoryName - must be string", categoryName });
      return;
    }

    if (!categoryId && !categoryName) {
      res
        .status(400)
        .json({ error: "Must provide either categoryId or categoryName" });
      return;
    }

    try {
      const newQuestion = createQuestion(text, categoryId, categoryName);
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
    const question = await Question.findOne({ id: questionId });
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
  categoryId?: string,
  categoryName?: string
): Promise<any> {
  if (!categoryId && !categoryName) {
    console.error("Must provide either categoryId or categoryName");
    return;
  }

  await connectDb();
  const Question = getQuestionModel();
  const Category = getCategoryModel();

  try {
    const category = categoryId
      ? await Category.findOne({ id: categoryId }).populate("questions")
      : await Category.findOne({ name: categoryName }).populate("questions");

    if (!category) {
      console.error("Category not found:", categoryId);
      return;
    }

    let highestId = 0;
    for (const question of category.questions) {
      if ((question.id as number) > highestId) {
        highestId = question.id as number;
      }
    }

    const newQuestion = new Question({
      id: (highestId as number) + 1,
      text,
    });

    console.log("Saving new question:", newQuestion);

    await newQuestion.save();
    category.questions.push(newQuestion);
    await category.save();
    console.log("New question saved:", category.questions.at(-1));
    return category.questions.at(-1);
  } catch (error) {
    console.error("Error creating question:", error);
  }
}

export default handler;
