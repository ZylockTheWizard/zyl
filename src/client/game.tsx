import React, { CSSProperties, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { start } from './game/start'

export const Game = () => {
    const containerStyles: CSSProperties = {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
    }

    const canvasStyles: CSSProperties = {
        width: '100%',
        height: '100%',
        outline: 'none',
        touchAction: 'none',
    }

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const onCanvasContextMenu: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
        event.preventDefault()
        event.stopPropagation()
    }

    useEffect(() => {
        const { current: canvas } = canvasRef
        if (canvas) start(canvas)
    })

    return (
        <Box sx={containerStyles}>
            <canvas style={canvasStyles} ref={canvasRef} onContextMenu={onCanvasContextMenu} />
        </Box>
    )
}
