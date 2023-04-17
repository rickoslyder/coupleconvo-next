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
    try {
      await fetchCategories(req, res);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        errorMsg: "Error fetching categories",
        error: error.message ?? error,
      });
    }
  } else if (req.method === "POST") {
    const { name, description } = req.body;

    try {
      const newCategory = await createCategory(name, description);
      res.status(200).json({ newCategory });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({
        errorMsg: "Error creating category",
        error: error.message ?? error,
      });
    }
  } else if (req.method === "PUT") {
    if (!req.body) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    try {
      const updatedCategory = await updateCategory(req.body);
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({
        errorMsg: "Error updating category",
        error: error.message ?? error,
      });
    }
  } else if (req.method === "DELETE") {
    const { _id } = req.body;

    try {
      await deleteCategory(_id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        errorMsg: "Error deleting category",
        error: error.message ?? error,
      });
    }
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

export async function createCategory(
  name: string,
  description: string
): Promise<any> {
  await connectDb();
  const Category = getCategoryModel();
  const categories = await Category.find().populate("questions");

  try {
    let highestId = 0;
    for (const category of categories) {
      if ((category?.id as number) > highestId) {
        highestId = category.id as number;
      }
    }

    const newCategory = new Category({
      id: ((highestId as number) + 1) as number,
      name,
      description,
    });
    await newCategory.save();
    return newCategory;
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function updateCategory(data: {
  _id: string;
  id: string | number;
  name: string;
  description: string;
}): Promise<any> {
  const { _id, id, name, description } = data;
  if (!id) {
    console.error("No id provided for category");
    return;
  }

  if (!name) {
    console.error("No name provided for category");
    return;
  }

  if (!description) {
    console.error("No description provided for category");
    return;
  }

  if (typeof name !== "string") {
    console.error("Name is not a string");
    return;
  }

  if (typeof description !== "string") {
    console.error("Description is not a string");
    return;
  }

  await connectDb();
  const Category = getCategoryModel();

  if (_id) {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(_id, {
        id,
        name,
        description,
      });
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
    }
  } else {
    try {
      const updatedCategory = await Category.findByIdAndUpdate(id, {
        name,
        description,
      });
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
    }
  }
}
