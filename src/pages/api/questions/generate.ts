//src/pages/api/questions/generate.ts
import * as dotenv from "dotenv";
dotenv.config();
import {
  connectDb,
  closeDbConnection,
  getCategoryModel,
  getQuestionModel,
} from "@/mongoDb";
import { NextApiRequest, NextApiResponse } from "next";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { category, numOfNewQuestions } = req.query;
    console.log("category:", category);
    console.log("numOfNewQuestions:", numOfNewQuestions);
    if (typeof category !== "string") {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    let num = Number(numOfNewQuestions);

    if (typeof num !== "number" && Number(num) < 1) {
      res
        .status(400)
        .json({ error: "Invalid number of new questions to be generated" });
      return;
    }

    await connectDb();
    const CategoryModel = getCategoryModel();
    const QuestionModel = getQuestionModel();

    try {
      const categoryObj = await CategoryModel.findOne({
        id: category,
      }).populate("questions");

      if (!categoryObj) {
        res.status(404).json({ errorMsg: "Category not found", category });
        return;
      } else {
        console.log("Successfully found category");
        // console.log(category);
      }

      let prompt = `Generate new questions for the category "${categoryObj.name}" based on these existing questions:\n\n`;

      const randomQuestions = getRandomElements(categoryObj.questions, 5); // Use the getRandomElements function
      for (const question of randomQuestions) {
        prompt += `- ${question.text}\n`;
      }

      console.log("Prompt:", prompt);

      const newQuestionsText = await generateQuestion(prompt, num, 2048);

      for (const newQuestionText of newQuestionsText) {
        // Find the highest id value in the category
        let highestId = 0;
        for (const question of categoryObj.questions) {
          if (question.id > highestId) {
            highestId = question.id;
          }
        }

        console.log(newQuestionText);
        const newQuestion = new QuestionModel({
          id: Number(highestId) + 1, // Increment the highest id value by 1
          text: newQuestionText,
          category: categoryObj._id,
        });

        console.log("New question:", newQuestion);

        await newQuestion.save();
        categoryObj.questions.push(newQuestion);
        await categoryObj.save();

        console.log("Successfully saved new question");
      }
      res.status(200).json({ success: true, text: newQuestionsText });
    } catch (error) {
      res.status(500).json({ errorMsg: "Error fetching questions", error });
    } finally {
      await closeDbConnection();
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

async function generateQuestion(
  prompt: string,
  numQuestions = 1,
  max_tokens = 2048
) {
  console.log("Generating questions...");
  try {
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
      stop: undefined,
    });

    return response.data.choices[0].message.content
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => line.trim().substring(2));
  } catch (error) {
    console.error("Error generating questions:", error);
  }
}

async function generateAndSaveQuestions(numQuestionsPerCategory = 50) {
  await connectDb();
  const CategoryModel = getCategoryModel();
  const QuestionModel = getQuestionModel();

  const categories = await CategoryModel.find().populate("questions");

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

    if (!newQuestionsText) {
      continue;
    }
    for (const newQuestionText of newQuestionsText) {
      // Find the highest id value in the category
      let highestId = 0;
      for (const question of category.questions) {
        if (question.id > highestId) {
          highestId = question.id;
        }
      }

      console.log(newQuestionText);
      const newQuestion = new QuestionModel({
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

async function runMultipleTimes(times: string | number) {
  for (let i = 0; i < Number(times); i++) {
    console.log(`Run ${i + 1} of ${times}`);
    await generateAndSaveQuestions();
  }
  //   db.close();
}

// Add these helper functions to your generate.ts file

// async function eliminateSimilarQuestions(categories) {
//     await connectDb();
//     // const CategoryModel = getCategoryModel();
//     const QuestionModel = getQuestionModel();
//   let eliminatedCount = 0;

//   for (const category of categories) {
//     if (category.questions.length === 0) {
//       continue;
//     }

//     console.log(
//       'Getting similar questions for category "' + category.name + '"'
//     );
//     const similarPairs = await getSimilarQuestions(category.questions);
//     const questionsToDelete = new Set();

//     for (const pair of similarPairs) {
//       questionsToDelete.add(pair.pair[1] - 1);
//     }

//     const newQuestions = category.questions.filter(
//       (_, index) => !questionsToDelete.has(index)
//     );

//     for (const index of questionsToDelete) {
//       const question = category.questions[index];
//       await QuestionModel.deleteOne({ _id: question._id });
//       eliminatedCount++;
//     }

//     console.log("Deleted " + questionsToDelete.size + " questions.");

//     category.questions = newQuestions;
//     await category.save();
//   }

//   return eliminatedCount;
// }

function getRandomElements(arr: string | any[], n: number) {
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

// async function getSimilarQuestions(questions: string | any[]) {
//   const chunkSize = 50;
//   const questionChunks = [];

//   for (let i = 0; i < questions.length; i += chunkSize) {
//     questionChunks.push(questions.slice(i, i + chunkSize));
//   }

//   const similarPairs = [];
//   console.log(
//     `Creating ${questionChunks.length} requests to OpenAI for ${questions.length} questions`
//   );
//   for (const chunk of questionChunks) {
//     const questionTexts = chunk.map((q, idx) => `${idx + 1}. ${q.text}`);
//     const prompt = `Here is a list of questions in a category:\n\n${questionTexts.join(
//       "\n"
//     )}\n\nPlease analyze the questions and return a JSON-like response with pairs of semantically similar questions (use question numbers). If a similarity score is 9 or above out of 10, consider them similar. Example response format: [{"pair": [1, 2]}, {"pair": [3, 4]}] - it is imperative that you follow this exact format, with no deviations and complete syntax.`;

//     const response = await generateQuestion(prompt, 500);
//     console.log("parsing response - ", response, " - end of response");
//     const parsedResponse = JSON.parse(response);
//     similarPairs.push(...parsedResponse);
//   }

//   if (questionChunks.length > 1) {
//     const prompt = `Here are the lists of semantically similar questions from each chunk:\n\n${similarPairs
//       .map(
//         (pair, idx) =>
//           `${idx + 1}. ${pair.pair
//             .map((num) => questions[num - 1].text)
//             .join(" and ")}\n`
//       )
//       .join(
//         "\n"
//       )}\n\nPlease analyze these pairs and return a JSON-like response with any additional pairs of semantically similar questions (use pair numbers). If a similarity score is 9 or above out of 10, consider them similar. Example response format: [{"pair": [1, 2]}, {"pair": [3, 4]}] - it is imperative that you follow this exact format, with no deviations and complete syntax.`;

//     try {
//       const response = await generateQuestion(prompt, 500);
//       const parsedResponse = JSON.parse(response);
//       similarPairs.push(...parsedResponse);
//     } catch (e) {
//       console.log("Error in getSimilarQuestions - ", e);
//       console.log("Trying again with a larger prompt token limit");
//       const response = await generateQuestion(prompt, 1000);
//       const parsedResponse = JSON.parse(response);
//       similarPairs.push(...parsedResponse);
//     }
//   }

//   return similarPairs;
// }

// async function generateAndSaveNewQuestions(categories, newQuestionsCount) {
//   for (const category of categories) {
//     for (let i = 0; i < newQuestionsCount; i++) {
//       let prompt = `Generate new questions for the category "${category.name}" based on these existing questions - the new questions must not be semantically similar to these questions, please be inventive:\n\n`;

//       const randomQuestions = getRandomElements(category.questions, 5);
//       for (const question of randomQuestions) {
//         prompt += `- ${question.text}\n`;
//       }

//       const newQuestionsText = await generateQuestion(
//         prompt,
//         newQuestionsCount,
//         1024
//       );

//       for (const newQuestionText of newQuestionsText) {
//         // Find the highest id value in the category
//         let highestId = 0;
//         for (const question of category.questions) {
//           if (question.id > highestId) {
//             highestId = question.id;
//           }
//         }

//         const newQuestion = new Question({
//           id: highestId + 1, // Increment the highest id value by 1
//           text: newQuestionText,
//           category: category._id,
//         });

//         await newQuestion.save();
//         category.questions.push(newQuestion);
//         await category.save();
//       }
//     }
//   }
// }
