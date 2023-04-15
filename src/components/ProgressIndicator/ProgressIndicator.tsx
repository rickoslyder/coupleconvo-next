// src/components/ProgressIndicator/ProgressIndicator.tsx
import React from 'react';
import { LinearProgress, Typography } from '@mui/material';
import { styled } from '@mui/system';

const ProgressWrapper = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
});

interface ProgressIndicatorProps {
    current: number;
    total: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    current,
    total,
}) => {
    const progressPercentage = (current / total) * 100;

    return (
        <ProgressWrapper>
            <Typography variant="body2">Question {current} of {total}</Typography>
            <LinearProgress variant="determinate" value={progressPercentage} />
        </ProgressWrapper>
    );
};

export default ProgressIndicator;
