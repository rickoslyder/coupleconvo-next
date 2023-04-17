// // src/components/CategoryCard/CategoryCard.tsx
// import React from 'react';
// import { Category } from '@/types';
// import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
// import { styled } from '@mui/system';

// interface CategoryCardProps {
//     category: Category;
//     onClick: (category: Category) => void;
// }

// const StyledCard = styled(Card)(({ theme }) => ({
//     cursor: 'pointer',
//     transition: '0.3s',
//     '&:hover': {
//         transform: 'translateY(-4px)',
//         boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.15)',
//     },
// }));

// const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
//     return (
//         <StyledCard onClick={() => onClick(category)}>
//             <CardActionArea>
//                 <CardContent>
//                     <Typography variant="h5">{category.name}</Typography>
//                     <Typography variant="body1">{category.description}</Typography>
//                 </CardContent>
//             </CardActionArea>
//         </StyledCard>
//     );
// };

// export default CategoryCard;

// src/components/CategoryCard/CategoryCard.tsx
import React from 'react';
import { Category } from '@/types';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';

interface CategoryCardProps {
    category: Category;
    onClick: (category: Category) => void;
    centred?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, centred = false }) => {

    if (centred) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Card>
                    <CardActionArea onClick={() => onClick(category)}>
                        <CardContent>
                            <center>
                                <Typography variant="h5" component="div">
                                    {category.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {category.description}
                                </Typography>
                            </center>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        );
    }

    return (
        <Card>
            <CardActionArea onClick={() => onClick(category)}>
                <CardContent>
                    <Typography variant="h5" component="div">
                        {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {category.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default CategoryCard;
