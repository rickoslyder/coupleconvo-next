// src/pages/admin/index.tsx
import React, { useEffect, useState } from "react";
import CategoryList from "../../components/CategoryList/CategoryList";
import { getCategories } from "../../pages/api";
import { Box, Button, Container, Typography, TextField } from "@mui/material";
import styles from "./AdminPage.module.css";
import axios from 'axios';
import { useRouter } from 'next/router';

const AdminPage: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const ADMIN_PASSWORD = "test123";

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

    const handlePasswordSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            router.push("/");
        }
    };


    return (
        <Container>
            {isAuthenticated ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                    <Typography variant="h3" gutterBottom>Admin Page</Typography>
                    <Box mt={2} mb={4}>
                        <Button
                            className={styles["fetch-button"]}
                            onClick={() => fetchCategories(true)}
                            variant="contained"
                        >
                            Fetch Latest Categories
                        </Button>
                    </Box>
                    <CategoryList
                        categories={categories}
                        fetchCategories={fetchCategories}
                        updateQuestionText={updateQuestionText}
                    />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                    <Typography variant="h4" gutterBottom>Admin Login</Typography>
                    <form onSubmit={handlePasswordSubmit}>
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained">Login</Button>
                    </form>
                </Box>
            )}
        </Container>
    );
};

export default AdminPage;