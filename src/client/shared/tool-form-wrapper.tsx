import React from 'react'
import { Card, Typography } from '@mui/material'

export type ToolFormProps = {
    children: React.ReactNode
    pageTitle: string
}

export const ToolFormWrapper: React.FC<ToolFormProps> = (props) => {
    const cardStyles: React.CSSProperties = {
        margin: '16px',
        display: 'flex',
        padding: '8px',
        alignSelf: 'center',
        flexDirection: 'column',
    }
    return (
        <Card style={cardStyles} variant="outlined">
            <Typography component="h1" variant="h5" sx={{ width: '100%', marginBottom: '16px' }}>
                {props.pageTitle}
            </Typography>
            {props.children}
        </Card>
    )
}
