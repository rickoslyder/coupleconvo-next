//src/components/QuestionList/QuestionList.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { getQuestionsByCategory } from "../../pages/api";
import { useForm } from "react-hook-form";
import { createQuestion, deleteQuestion, sanitizeCategory } from "../../pages/api";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    FormControl,
    FormGroup,
    Grid,
    IconButton,
    InputLabel,
    Input,
    List,
    ListItem,
    Typography,
    TextField,
} from "@mui/material";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";


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
            <Typography variant="h4" gutterBottom>Questions</Typography>
            <Box component="form" onSubmit={handleSubmit(handleNewQuestionSubmit)} noValidate>
                <FormGroup>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="text">Question Text:</InputLabel>
                        <Input fullWidth id="text" {...register("text", { required: true })} />
                    </FormControl>
                    <Box mt={2}>
                        <Button type="submit" variant="contained">Create Question</Button>
                    </Box>
                </FormGroup>
            </Box>
            <Box my={4}>
                {questions && questions.length === 0 && <Typography variant="h5">No questions yet</Typography>}
                {questions && questions.length > 0 && <Typography variant="h5">{categoryName}:</Typography>}
            </Box>
            {questions && questions.length > 0 && (
                <Box mb={2}>
                    <Button variant="contained" color="warning" fullWidth onClick={() => handleSanitize(categoryName)}>
                        Sanitize Category
                    </Button>
                </Box>
            )}
            <Grid container spacing={2}>
                {questions.map((question) => (
                    <Grid item xs={12} key={question._id}>
                        <Card>
                            <CardContent>
                                <Question
                                    question={question}
                                    handleUpdateQuestionText={handleUpdateQuestionText}
                                    fetchQuestions={fetchQuestions}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
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
        <Box>
            <FormControl fullWidth>
                <TextField
                    defaultValue={question.text}
                    onChange={(e) => setQuestionText(e.target.value)}
                    multiline
                    fullWidth
                />
            </FormControl>
            <CardActions>
                <IconButton onClick={() => handleUpdateQuestionText(question._id, questionText)}>
                    <SaveIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteQuestion(question._id)} color="error">
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Box>
    );
};

export default QuestionList;
