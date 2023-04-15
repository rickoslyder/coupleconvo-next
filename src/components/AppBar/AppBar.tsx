// src/components/AppBar/AppBar.tsx
import * as React from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

const AppBar: React.FC = () => {
    const router = useRouter();

    return (
        <MuiAppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => router.push('/')}>
                    CoupleConvo
                </Typography>
                <Button color="inherit">Help</Button>
                \<Button color="inherit" onClick={() => router.push('/admin')}>Admin</Button>
            </Toolbar>
        </MuiAppBar>
    );
};

export default AppBar;
