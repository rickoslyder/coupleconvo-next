// src/utils/categories.ts
import mongoose from "mongoose";
import Category from "@/models/category";

export async function getCategories() {
  // Connect to the database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  // Query the Category collection, populating the questions field
  const categories = await Category.find().populate("questions");

  // Close the database connection
  await mongoose.connection.close();

  return categories;
}
