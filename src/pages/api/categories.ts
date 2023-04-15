//src/pages/api/categories.ts
import { NextApiRequest, NextApiResponse } from "next";
// import { getCategories } from "../../utils/categories";
// import Category from "../../models/category";
import dotenv from "dotenv";
import {
  connectDb,
  closeDbConnection,
  getCategoryModel,
  getQuestionModel,
} from "@/mongoDb";

interface NewCategoryFormData {
  name: string;
  description: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await fetchCategories(req, res);
  } else if (req.method === "POST") {
    const { categoryId } = req.body;
    await createCategory(categoryId);
  } else if (req.method === "DELETE") {
    const { data } = req.body;
    await deleteCategory(data);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export async function fetchCategories(req, res): Promise<void> {
  try {
    await connectDb();
    const Category = getCategoryModel();
    const Question = getQuestionModel(); // Get the "Question" model
    const categories = await Category.find().populate("questions");

    // Close the database connection
    await closeDbConnection();
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching categories", errorMessages: error });
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await connectDb();
  const Question = getQuestionModel();
  const Category = getCategoryModel();

  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      console.error("Category not found:", categoryId);
      return;
    }
    // Remove references to the deleted category from the questions
    await Question.updateMany(
      { category: categoryId },
      { $unset: { category: "" } }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
  }
}

export async function createCategory(data: NewCategoryFormData): Promise<void> {
  await connectDb();
  const Question = getQuestionModel();
  const Category = getCategoryModel();

  try {
    const newCategory = new Category({ ...data });
    await newCategory.save();
  } catch (error) {
    console.error("Error creating category:", error);
  }
}
