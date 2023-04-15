// src/pages/admin/index.tsx
import React, { useEffect, useState, useRef } from "react";
import CategoryList from "../../components/CategoryList/CategoryList";
import { getCategories } from "../../pages/api";
import { Box, Button, Container, Typography } from "@mui/material";
import styles from "./AdminPage.module.css";
import axios from 'axios';

const AdminPage: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories(forceUpdate = false) {
        const cachedData = localStorage.getItem("categories");

        if (cachedData && !forceUpdate) {
            const { expiry, data } = JSON.parse(cachedData);

            if (Date.now() < expiry) {
                setCategories(data);
                return;
            }
        }

        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

        const expiryDate = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(
            "categories",
            JSON.stringify({ expiry: expiryDate, data: fetchedCategories })
        );
    }

    const updateQuestionText = async (
        questionId: string,
        updatedText: string,
        category: string
    ) => {
        console.log(questionId, updatedText, category);
        await axios.put(`/api/questions/${questionId}`, { text: updatedText, category });
        fetchCategories(true);
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Typography variant="h1">Admin Page</Typography>
                <Button
                    className={styles["fetch-button"]}
                    onClick={() => fetchCategories(true)}
                    variant="contained"
                >
                    Fetch Latest Categories
                </Button>
                <CategoryList
                    categories={categories}
                    fetchCategories={fetchCategories}
                    updateQuestionText={updateQuestionText}
                />
            </Box>
        </Container>
    );
};

export default AdminPage;