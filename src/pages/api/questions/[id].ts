import { NextApiRequest, NextApiResponse } from "next";
import { getQuestionModel, connectDb, closeDbConnection } from "@/mongoDb";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const questionModel = getQuestionModel();

  await connectDb();

  const { id } = req.query;

  if (req.method === "GET") {
    // Retrieve question by ID
    const question = await questionModel.findById(req.query.id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.status(200).json(question);
  }

  if (req.method === "PUT") {
    // Update question by ID
    const { text, category } = req.body;

    console.log("PUT request received");
    console.log("Updating question", id);
    console.log("New text:", text);

    if (!text || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const question = await questionModel.findByIdAndUpdate(
      req.query.id,
      {
        text,
        category,
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    console.log("Updated question:", question);

    return res.status(200).json(question);
  }

  if (req.method === "DELETE") {
    // Delete question by ID
    console.log("DELETE request received");
    console.log("Deleting question", id);
    const question = await questionModel.findByIdAndDelete(req.query.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.status(204).end();
  }
  return res.status(405).json({ error: "Method not allowed" });
};
export default handler;
