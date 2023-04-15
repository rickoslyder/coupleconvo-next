//src/components/CategoryList/CategoryList.tsx
import React, { useState, useRef } from "react";
import QuestionList from "../QuestionList/QuestionList";
import { useForm } from "react-hook-form";
import { createCategory } from "../../pages/api";
import { generateQuestions } from "../../pages/api";
import { deleteCategory } from "../../pages/api";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormGroup,
    InputLabel,
    Input,
    InputAdornment,
    List,
    ListItem,
    Typography,
} from "@mui/material";

interface NewCategoryFormData {
    name: string;
    description: string;
}

interface CategoryListProps {
    categories: Array<{
        _id: string;
        name: string;
        id: string;
    }>;
    fetchCategories: () => void;
    updateQuestionText: (questionId: string, updatedText: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, fetchCategories, updateQuestionText }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [numOfNewQuestions, setNumOfNewQuestions] = useState<number>(0);
    const [showNewQuestionInput, setShowNewQuestionInput] = useState<boolean>(false);

    const { register, handleSubmit, reset } = useForm<NewCategoryFormData>();

    const questionInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateQuestionText = (questionId: string, updatedText: any) => {
        if (questionId && updatedText) {
            console.log(updatedText);
            updateQuestionText(questionId, updatedText, selectedCategory);
        } else {
            console.log("No question id or updated text provided");
        }

    };

    const handleNewCategorySubmit = async (data: NewCategoryFormData) => {
        await createCategory(data);
        fetchCategories();
        reset();
    };

    const handleDeleteCategory = async (categoryId: string) => {
        await deleteCategory(categoryId);
        fetchCategories();
    };

    const handleGenerateQuestions = async (categoryId: string) => {
        if (showNewQuestionInput) {
            await generateQuestions(categoryId, numOfNewQuestions);
            setShowNewQuestionInput(false);
            setNumOfNewQuestions(0);
        } else {
            setShowNewQuestionInput(true);
        }
    };

    return (
        <Container>
            <Typography variant="h2">Categories</Typography>
            <Box component="form" onSubmit={handleSubmit(handleNewCategorySubmit)}>
                <FormGroup>
                    <FormControl>
                        <InputLabel htmlFor="name">Category Name:</InputLabel>
                        <Input id="name" {...register("name", { required: true })} />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="description">Category Description:</InputLabel>
                        <Input id="description" {...register("description", { required: true })} />
                    </FormControl>
                    <Button type="submit" variant="contained">Create Category</Button>
                </FormGroup>
            </Box>
            <br />
            <br />
            <List>
                {categories.map((category) => (
                    <ListItem key={category._id}>
                        <Typography onClick={() => setSelectedCategory(category.name)}>{`${category.name} (${category.questions.length}) `}</Typography>
                        <Button onClick={() => handleGenerateQuestions(category.id)} variant="contained">
                            {showNewQuestionInput ? `Generate ${numOfNewQuestions} questions` : 'Click to generate questions'}
                        </Button>
                        {showNewQuestionInput && (
                            <FormControl>
                                <Input
                                    type="number"
                                    onChange={(e) => setNumOfNewQuestions(Number(e.target.value))}
                                    startAdornment={<InputAdornment position="start">#</InputAdornment>}
                                />
                            </FormControl>
                        )}
                    </ListItem>
                ))}
            </List>
            <QuestionList categoryName={selectedCategory} handleUpdateQuestionText={handleUpdateQuestionText} />
        </Container>
    );
};

export default CategoryList;