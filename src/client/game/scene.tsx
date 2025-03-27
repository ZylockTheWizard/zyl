import React, { CSSProperties, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { buildDefaultScene, loadScene } from './start'

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

    const defaultScene = buildDefaultScene()

    useEffect(() => {
        const { current: canvas } = canvasRef
        if (canvas) loadScene(canvas, defaultScene)
    })

    window.register('scene-data', (_event: any, val: any) => {
        console.log({ val })
        const { current: canvas } = canvasRef
        if (canvas) loadScene(canvas, val.data)
    })

    return (
        <Box sx={containerStyles}>
            <canvas style={canvasStyles} ref={canvasRef} onContextMenu={onCanvasContextMenu} />
        </Box>
    )
}
