//src/components/CategoryList/CategoryList.tsx
import React, { useState, useRef } from "react";
import QuestionList from "../QuestionList/QuestionList";
import { useForm } from "react-hook-form";
import { createCategory, updateCategory } from "../../pages/api";
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
    ListItemText,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface NewCategoryFormData {
    name: string;
    description: string;
}

interface CategoryListProps {
    categories: Array<{
        _id: string;
        name: string;
        id: string;
        questions: []
    }>;
    fetchCategories: () => void;
    updateQuestionText: (questionId: string, updatedText: string, categoryName: string | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, fetchCategories, updateQuestionText }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [numOfNewQuestions, setNumOfNewQuestions] = useState<number>(0);
    const [showNewQuestionInput, setShowNewQuestionInput] = useState<boolean>(false);

    const { register, handleSubmit, reset } = useForm<NewCategoryFormData>();

    const handleUpdateQuestionText = (questionId: string, updatedText: any) => {
        if (questionId && updatedText) {
            console.log(updatedText);
            updateQuestionText(questionId, updatedText, selectedCategory);
            alert("Question updated successfully")
        } else {
            console.log("No question id or updated text provided");
        }

    };

    const handleNewCategorySubmit = async (data: NewCategoryFormData) => {
        await createCategory(data);
        fetchCategories();
        alert("Category created successfully")
        reset();
    };

    const handleDeleteCategory = async (_id: string) => {
        let answer = window.confirm("Are you sure you want to delete this category?");
        if (!answer) {
            return;
        }

        let res = await deleteCategory(_id);
        if (res.status === 204) {
            alert("Category deleted successfully")
        } else {
            alert("Error deleting category")
        }
        fetchCategories();
    };

    const handleGenerateQuestions = async (categoryId: string) => {
        if (showNewQuestionInput) {
            await generateQuestions(categoryId, numOfNewQuestions);
            setShowNewQuestionInput(false);
            setNumOfNewQuestions(0);
            fetchCategories();
        } else {
            setShowNewQuestionInput(true);
        }
    };

    const handleSaveChanges = async (category: any) => {
        console.log("Saving changes...")
        console.log(category)
        await updateCategory(category);
        fetchCategories();
        alert("Category updated successfully")
    };

    const renderCategoryAccordion = (category: any) => {
        const { _id, id, name, description } = category;
        let updatedCategory = category;

        return (
            <Accordion key={_id}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                >
                    <ListItemText primary={`${name} (${category.questions.length})`} />
                </AccordionSummary>
                <AccordionDetails>
                    <Box width="100%" display="flex" flexDirection="column" gap={2}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor={`_id_${_id}`}>_id:</InputLabel>
                            <Input id={`_id_${_id}`} defaultValue={_id} disabled />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor={`id_${_id}`}>ID:</InputLabel>
                            <Input id={`id_${_id}`} defaultValue={id} onChange={(e) => updatedCategory.id = e.target.value} />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor={`name_${_id}`}>Name:</InputLabel>
                            <Input id={`name_${_id}`} defaultValue={name} onChange={(e) => updatedCategory.name = e.target.value} />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor={`description_${_id}`}>Description:</InputLabel>
                            <Input id={`description_${_id}`} defaultValue={description} onChange={(e) => updatedCategory.description = e.target.value} />
                        </FormControl>
                        <Box mt={2}>
                            <Button onClick={() => handleSaveChanges(updatedCategory)} variant="contained">Save Changes</Button>
                        </Box>
                        <Box mt={2}>
                            <Button onClick={() => handleGenerateQuestions(_id)} variant="contained">
                                {showNewQuestionInput ? `Generate ${numOfNewQuestions} questions` : 'Generate questions'}
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
                            <Button onClick={() => handleDeleteCategory(_id)} variant="contained" color="error">
                                Delete Category
                            </Button>
                        </Box>
                        <Box mt={2}>
                            <Button onClick={() => setSelectedCategory(category.name)} variant="contained" color="primary">
                                Load Questions
                            </Button>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>
        );
    };

    return (
        <Container>
            <Box mt={2}>
                <Typography variant="h4">Categories</Typography>
            </Box>
            <Box my={2}>
                <FormGroup>
                    <FormControl>
                        <InputLabel htmlFor="name">Category Name:</InputLabel>
                        <Input id="name" {...register("name", { required: true })} />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="description">Category Description:</InputLabel>
                        <Input id="description" {...register("description", { required: true })} />
                    </FormControl>
                    <Button type="submit" onClick={handleSubmit(handleNewCategorySubmit)} variant="contained">
                        Add New Category
                    </Button>
                </FormGroup>
            </Box>
            <List sx={{ mb: 3 }}>
                {categories.map((category) => renderCategoryAccordion(category))}
            </List>
            <QuestionList
                categoryName={selectedCategory}
                handleUpdateQuestionText={handleUpdateQuestionText}
            />
        </Container>
    );
};

export default CategoryList;