// generateQuestions.js
require("dotenv").config();
const db = require("./db");
const Category = require("@/models/category");
const Question = require("@/models/question");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function generateQuestion(prompt, numQuestions = 1, max_tokens = 2048) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant, creating questions for a game called CoupleConvo. CoupleConvo is the ultimate conversation starter game for couples looking to deepen their connection.\n\nOur game covers a wide range of categories and prompts, ensuring that you and your partner never run out of things to talk about. Whether you're looking to rekindle the flame or just want to have some fun, CoupleConvo has got you covered. Try it out today and watch your relationship grow stronger than ever before!\n\nThis game will be written in React, but as a Next.js PWA to make it playable on both mobile and web. \n\nBelow are a list of categories and question prompts that users will be able to choose from:\n- Would you rather\n- Most likely to\n- Never have I ever\n- Complete the sentence\n- Fun questions\n- Deep questions\n- Controversial questions\n\nFeatures/Modes:\n- timed mode vs unlimited mode\n- preset number of questions vs infinite mode\n- Both users either answer same question or answer different questions\n- offline access = paid\n- analytics & user classification (e.g. user chooses the riskier options, enjoys intimate conversations, etc.)\n- tailor questions based on various factors - age, marital status, sexuality, length of relationship, etc\n- Uses OpenAI’s gpt-4 model to generate more questions and to analyze the users’ responses\n- ",
      },
      {
        role: "user",
        content: `${prompt} Please generate ${numQuestions} new questions for this category, following this format:\n\n- Question 1\n- Question 2\n- Question 3\n\nIt is imperative that you follow this format at all costs.`,
      },
    ],
    max_tokens: max_tokens,
    temperature: 0.8,
    n: 1,
    stop: null,
  });

  return response.data.choices[0].message.content
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.trim().substring(2));
}

async function generateAndSaveQuestions(numQuestionsPerCategory = 50) {
  const categories = await Category.find().populate("questions");

  for (const category of categories) {
    let prompt = `Generate new questions for the category "${category.name}" based on these existing questions:\n\n`;

    const randomQuestions = getRandomElements(category.questions, 5); // Use the getRandomElements function
    for (const question of randomQuestions) {
      prompt += `- ${question.text}\n`;
    }

    const newQuestionsText = await generateQuestion(
      prompt,
      numQuestionsPerCategory,
      2048
    );

    for (const newQuestionText of newQuestionsText) {
      // Find the highest id value in the category
      let highestId = 0;
      for (const question of category.questions) {
        if (question.id > highestId) {
          highestId = question.id;
        }
      }

      console.log(newQuestionText);
      const newQuestion = new Question({
        id: highestId + 1, // Increment the highest id value by 1
        text: newQuestionText,
        category: category._id,
      });

      await newQuestion.save();
      category.questions.push(newQuestion);
      await category.save();
    }
  }

  console.log("New questions generated and saved to the database.");
}

async function runMultipleTimes(times) {
  for (let i = 0; i < times; i++) {
    console.log(`Run ${i + 1} of ${times}`);
    await generateAndSaveQuestions();
  }
  //   db.close();
}

// Add these helper functions to your generateQuestions.js file

async function eliminateSimilarQuestions(categories) {
  let eliminatedCount = 0;

  for (const category of categories) {
    if (category.questions.length === 0) {
      continue;
    }

    console.log(
      'Getting similar questions for category "' + category.name + '"'
    );
    const similarPairs = await getSimilarQuestions(category.questions);
    const questionsToDelete = new Set();

    for (const pair of similarPairs) {
      questionsToDelete.add(pair.pair[1] - 1);
    }

    const newQuestions = category.questions.filter(
      (_, index) => !questionsToDelete.has(index)
    );

    for (const index of questionsToDelete) {
      const question = category.questions[index];
      await Question.deleteOne({ _id: question._id });
      eliminatedCount++;
    }

    console.log("Deleted " + questionsToDelete.size + " questions.");

    category.questions = newQuestions;
    await category.save();
  }

  return eliminatedCount;
}

function getRandomElements(arr, n) {
  if (arr.length <= n) {
    return arr;
  }

  const randomElements = [];
  const usedIndices = new Set();

  while (randomElements.length < n) {
    const index = Math.floor(Math.random() * arr.length);
    if (!usedIndices.has(index)) {
      randomElements.push(arr[index]);
      usedIndices.add(index);
    }
  }

  return randomElements;
}

async function getSimilarQuestions(questions) {
  const chunkSize = 50;
  const questionChunks = [];

  for (let i = 0; i < questions.length; i += chunkSize) {
    questionChunks.push(questions.slice(i, i + chunkSize));
  }

  const similarPairs = [];
  console.log(
    `Creating ${questionChunks.length} requests to OpenAI for ${questions.length} questions`
  );
  for (const chunk of questionChunks) {
    const questionTexts = chunk.map((q, idx) => `${idx + 1}. ${q.text}`);
    const prompt = `Here is a list of questions in a category:\n\n${questionTexts.join(
      "\n"
    )}\n\nPlease analyze the questions and return a JSON-like response with pairs of semantically similar questions (use question numbers). If a similarity score is 9 or above out of 10, consider them similar. Example response format: [{"pair": [1, 2]}, {"pair": [3, 4]}] - it is imperative that you follow this exact format, with no deviations and complete syntax.`;

    const response = await generateQuestion(prompt, 500);
    console.log("parsing response - ", response, " - end of response");
    const parsedResponse = JSON.parse(response);
    similarPairs.push(...parsedResponse);
  }

  if (questionChunks.length > 1) {
    const prompt = `Here are the lists of semantically similar questions from each chunk:\n\n${similarPairs
      .map(
        (pair, idx) =>
          `${idx + 1}. ${pair.pair
            .map((num) => questions[num - 1].text)
            .join(" and ")}\n`
      )
      .join(
        "\n"
      )}\n\nPlease analyze these pairs and return a JSON-like response with any additional pairs of semantically similar questions (use pair numbers). If a similarity score is 9 or above out of 10, consider them similar. Example response format: [{"pair": [1, 2]}, {"pair": [3, 4]}] - it is imperative that you follow this exact format, with no deviations and complete syntax.`;

    try {
      const response = await generateQuestion(prompt, 500);
      const parsedResponse = JSON.parse(response);
      similarPairs.push(...parsedResponse);
    } catch (e) {
      console.log("Error in getSimilarQuestions - ", e);
      console.log("Trying again with a larger prompt token limit");
      const response = await generateQuestion(prompt, 1000);
      const parsedResponse = JSON.parse(response);
      similarPairs.push(...parsedResponse);
    }
  }

  return similarPairs;
}

async function generateAndSaveNewQuestions(categories, newQuestionsCount) {
  for (const category of categories) {
    for (let i = 0; i < newQuestionsCount; i++) {
      let prompt = `Generate new questions for the category "${category.name}" based on these existing questions - the new questions must not be semantically similar to these questions, please be inventive:\n\n`;

      const randomQuestions = getRandomElements(category.questions, 5);
      for (const question of randomQuestions) {
        prompt += `- ${question.text}\n`;
      }

      const newQuestionsText = await generateQuestion(
        prompt,
        newQuestionsCount,
        1024
      );

      for (const newQuestionText of newQuestionsText) {
        // Find the highest id value in the category
        let highestId = 0;
        for (const question of category.questions) {
          if (question.id > highestId) {
            highestId = question.id;
          }
        }

        const newQuestion = new Question({
          id: highestId + 1, // Increment the highest id value by 1
          text: newQuestionText,
          category: category._id,
        });

        await newQuestion.save();
        category.questions.push(newQuestion);
        await category.save();
      }
    }
  }
}

async function main() {
  try {
    await runMultipleTimes(1);
    console.log("initial question generation run done");

    const categories = await Category.find().populate("questions");
    const eliminatedCount = await eliminateSimilarQuestions(categories);
    console.log(`Eliminated ${eliminatedCount} similar questions.`);
    await generateAndSaveNewQuestions(categories, eliminatedCount);
    console.log(
      `${eliminatedCount} new questions generated and saved to the database.`
    );
    db.close();
  } catch (error) {
    console.error("An error occurred during execution:", error);
    db.close();
  }
}

main();
