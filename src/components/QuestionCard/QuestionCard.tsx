// src/components/QuestionCard/QuestionCard.tsx
import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const RootCard = styled(Card)({
    minWidth: 275,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
});

const TitleTypography = styled(Typography)({
    fontSize: 18,
    fontWeight: 'bold',
});

interface QuestionCardProps {
    question: string | null;
    loading: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, loading }) => {
    return (
        <RootCard>
            <CardContent>
                {loading ? 'Loading...' : question ? (
                    <TitleTypography color="textSecondary" gutterBottom>
                        {question}
                    </TitleTypography>
                ) : (
                    <TitleTypography color="textSecondary" gutterBottom>
                        No more questions available.
                    </TitleTypography>
                )}
            </CardContent>
        </RootCard>
    );
};
