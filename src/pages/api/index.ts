//src/pages/api/index.ts
import axios from "axios";
// const Category = require("@/models/category");
// const Question = require("@/models/question");
// import { generateAndSaveQuestions } from "@/generateQuestions";
// import {
//   connectDb,
//   closeDbConnection,
//   getQuestionModel,
//   getCategoryModel,
// } from "@/mongoDb";

const API_URL = "/api"; // Replace with the actual API URL

interface NewCategoryFormData {
  name: string;
  description: string;
}

export async function getCategories(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function createCategory(data: NewCategoryFormData): Promise<void> {
  try {
    const response = await axios.post(`${API_URL}/categories`, {
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getQuestionsByCategory(
  categoryName: string
): Promise<any[]> {
  try {
    const response = await axios.post(`${API_URL}/categories/questions`, {
      categoryName,
    });
    return response.data.questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}

export async function createQuestion(data: {
  text: string;
  categoryId?: string;
  categoryName?: string;
}): Promise<void> {
  const { text, categoryId, categoryName } = data;

  try {
    if (!categoryId && !categoryName) {
      throw new Error("Category ID or name not provided");
    }

    if (categoryId) {
      const response = await axios.post(`${API_URL}/questions/create`, {
        text,
        categoryId,
      });
      return response.data;
    } else if (categoryName) {
      const response = await axios.post(`${API_URL}/questions/create`, {
        text,
        categoryName,
      });
      return response.data;
    }
  } catch (error) {
    console.error("Error creating questions:", error);
  }
}

export async function generateQuestions(
  categoryId: string,
  numOfNewQuestions: number
): Promise<void> {
  try {
    await axios.get(`${API_URL}/questions/generate`, {
      params: {
        category: categoryId,
        numOfNewQuestions: numOfNewQuestions,
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);
  }
}

export async function deleteCategory(_id: string): Promise<any> {
  // TODO: Create /categories/:categoryId endpoint
  try {
    const response = await axios.delete(`${API_URL}/categories`, {
      data: {
        _id,
      },
    });
    return response;
  } catch (error) {
    console.error("Error deleting questions:", error);
  }
}

export async function deleteQuestion(questionId: string): Promise<any[]> {
  console.log("Deleting question:", questionId);
  if (!questionId) {
    console.error("Question ID not provided");
    return [];
  }
  try {
    const response = await axios.delete(`${API_URL}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting questions:", error);
    return [];
  }
}

export const updateCategory = async (data: {
  _id: string;
  id: string | number;
  name: string;
  description: string;
}) => {
  const { _id, id, name, description } = data;

  try {
    const response = await axios.put(`${API_URL}/categories`, {
      _id,
      id,
      name,
      description,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
  }
};

export async function sanitizeCategory(categoryName: string): Promise<any[]> {
  try {
    const response = await axios.post(`${API_URL}/categories/sanitize`, {
      categoryName,
    });
    return response.data.sanitizedQuestions;
  } catch (error) {
    console.error(`Error sanitizing category ${categoryName}:`, error);
  }
}
