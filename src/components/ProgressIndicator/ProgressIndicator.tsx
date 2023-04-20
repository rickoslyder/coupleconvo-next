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
    loading: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    current,
    total,
    loading,
}) => {
    const progressPercentage = (current / total) * 100;

    return (
        <ProgressWrapper>
            <Typography variant="body2">{!loading ? `Question ${current} of ${total}` : 'Loading...'}</Typography>
            <LinearProgress variant="determinate" value={progressPercentage} />
        </ProgressWrapper>
    );
};

export default ProgressIndicator;
