import React from 'react'
import { Box, Card, Stack, Typography } from '@mui/material'

export type PageFormProps = {
    children: React.ReactNode
    pageTitle: string
    onSubmit: React.FormEventHandler<HTMLFormElement>
}

export const PageForm: React.FC<PageFormProps> = (props) => {
    const cardStyles: React.CSSProperties = {
        gap: 20,
        width: '390px',
        display: 'flex',
        padding: '32px',
        alignSelf: 'center',
        flexDirection: 'column',
    }

    const stackStyles: React.CSSProperties = {
        height: '80%',
        padding: '16px',
        justifyContent: 'center',
    }

    return (
        <Stack direction="column" justifyContent="space-between" style={stackStyles}>
            <Card style={cardStyles} variant="outlined">
                <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: '34px' }}>
                    {props.pageTitle}
                </Typography>
                <Box
                    component="form"
                    onSubmit={props.onSubmit}
                    noValidate
                    sx={{
                        gap: 4,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {props.children}
                </Box>
            </Card>
        </Stack>
    )
}
