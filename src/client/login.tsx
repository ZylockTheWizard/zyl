import React from 'react'
import { 
    Box, 
    Button, 
    Card, 
    FormControl, 
    FormLabel, 
    Stack, 
    TextField, 
    Typography 
} from '@mui/material'

export const Login = () => {
    const cardStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        padding: '32px',
        gap: 20
    }

    const stackStyles: React.CSSProperties = {
        padding: '16px',
        marginTop: '100px'
    }

    return (
        <Stack 
            direction="column" 
            justifyContent="space-between" 
            style={stackStyles}
        >
            <Card style={cardStyles} variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign in
                </Typography>
                <Box
                    component="form"
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 4,
                    }}
                >
                    <FormControl>
                        <FormLabel htmlFor="user">User</FormLabel>
                        <TextField
                            id="user"
                            name="user"
                            autoFocus
                            fullWidth
                            variant="outlined"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            name="password"
                            type="password"
                            id="password"
                            fullWidth
                            variant="outlined"
                        />
                    </FormControl>
                    <Button fullWidth variant="contained">
                        Sign in
                    </Button>
                </Box>
            </Card>
        </Stack>
    )
}