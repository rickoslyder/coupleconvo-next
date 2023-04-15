// importData.js
const db = require("./db");
const Category = require("./models/Category");
const Question = require("./models/Question");
const { categories } = require("./utils/categories.js");

(async () => {
  for (const category of categories) {
    const newCategory = new Category({
      id: category.id,
      name: category.name,
      description: category.description,
    });

    await newCategory.save();

    for (const question of category.questions) {
      const newQuestion = new Question({
        id: question.id,
        text: question.text,
        category: newCategory._id,
      });

      await newQuestion.save();
      newCategory.questions.push(newQuestion);
    }

    await newCategory.save();
  }

  console.log("Data imported successfully.");
  db.close();
})();
