//src/components/QuestionList/QuestionList.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { getQuestionsByCategory } from "../../pages/api";
import { useForm } from "react-hook-form";
import { createQuestion, deleteQuestion, sanitizeCategory } from "../../pages/api";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormGroup,
    InputLabel,
    Input,
    List,
    ListItem,
    Typography,
} from "@mui/material";

interface NewQuestionFormData {
    text: string;
}

interface Question {
    _id: string;
    text: string;
}

interface QuestionListProps {
    categoryName: string | null;
    fetchQuestions?: () => void;
    handleUpdateQuestionText: (questionId: string, questionText: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ categoryName, handleUpdateQuestionText }) => {
    const [questions, setQuestions] = useState<Question[]>([]);

    const questionInputRef = useRef<HTMLInputElement>(null);

    const fetchQuestions = useCallback(async () => {
        if (categoryName) {
            const fetchedQuestions = await getQuestionsByCategory(categoryName);
            console.log(fetchedQuestions);
            setQuestions(fetchedQuestions);
        } else {
            setQuestions([]);
        }
    }, [categoryName, setQuestions]);

    useEffect(() => {
        fetchQuestions();
    }, [categoryName, fetchQuestions]);

    const { register, handleSubmit, reset } = useForm<NewQuestionFormData>();

    const handleNewQuestionSubmit = async (data: NewQuestionFormData) => {
        if (categoryName) {
            await createQuestion({ text: data.text, categoryName: categoryName });
            fetchQuestions();
            reset();
        }
    };

    const handleSanitize = async (categoryName: string | null) => {
        if (categoryName) {
            try {
                console.log("Sanitizing questions in category: " + categoryName)
                const sanitizedQuestions = await sanitizeCategory(categoryName);
                console.log('Sanitized questions: ', sanitizedQuestions);
                setQuestions(sanitizedQuestions);
                alert("Category sanitized");
            } catch (error) {
                console.log(error);
            }
        }

        reset();

    };

    return (
        <Container>
            <Typography variant="h2">Questions</Typography>
            <Box component="form" onSubmit={handleSubmit(handleNewQuestionSubmit)}>
                <FormGroup>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="text">Question Text:</InputLabel>
                        <Input fullWidth id="text" {...register("text", { required: true })} />
                    </FormControl>
                    <Button type="submit" variant="contained">Create Question</Button>
                </FormGroup>
            </Box>
            <br />
            {questions && questions.length === 0 && <Typography variant="h3">No questions yet</Typography>}
            {questions && questions.length > 0 && <Typography variant="h4">{categoryName}:</Typography>}
            <br />
            {questions && questions.length > 0 && <Button variant="contained" color="warning" fullWidth onClick={() => handleSanitize(categoryName)}>Sanitize Category</Button>}
            <List>
                {questions.map((question) => (
                    <Question key={question._id} question={question} handleUpdateQuestionText={handleUpdateQuestionText} fetchQuestions={fetchQuestions} />
                ))}
            </List>
        </Container>
    );
};

export const Question = ({ question, handleUpdateQuestionText, fetchQuestions }) => {
    const questionInputRef = useRef<HTMLInputElement>(null);
    const [questionText, setQuestionText] = useState<string>(question.text);

    const handleDeleteQuestion = async (questionId: any) => {
        const confirmDelete = confirm("Are you sure you want to delete this question?");
        console.log("Deleting question: " + questionId)

        if (!questionId) {
            console.log("No question id provided");
            return;
        }
        if (!confirmDelete) {
            console.log("Delete cancelled");
            return;
        }

        await deleteQuestion(questionId);
        fetchQuestions();
        alert("Question deleted");
    };

    return (
        <ListItem key={question._id}>
            <FormControl>
                <Input
                    type="text"
                    defaultValue={question.text}
                    ref={questionInputRef}
                    sx={{ width: "50vw" }}
                    onChange={(e) => setQuestionText(e.target.value)}
                    multiline
                />
            </FormControl>
            <Button onClick={() => handleUpdateQuestionText(question._id, questionText)} variant="contained">
                Save
            </Button>
            <Button onClick={() => handleDeleteQuestion(question._id)} variant="contained" color="error">
                Delete
            </Button>
        </ListItem>
    );
};

export default QuestionList;
