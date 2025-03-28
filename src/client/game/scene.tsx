import React, { CSSProperties, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { loadScene } from './start'

export const Scene = () => {
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

    const renderSceneInCanvas = (data: string) => {
        const { current: canvas } = canvasRef
        if (canvas) loadScene(canvas, data)
    }

    useEffect(() => {
        if (window.zylSession.currentSceneData) {
            renderSceneInCanvas(window.zylSession.currentSceneData)
        }
    }, [])

    window.register('scene-data', (_event: any, val: any) => renderSceneInCanvas(val))

    return (
        <Box sx={containerStyles}>
            <canvas style={canvasStyles} ref={canvasRef} onContextMenu={onCanvasContextMenu} />
        </Box>
    )
}
