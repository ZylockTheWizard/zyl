import React, { CSSProperties, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { loadScene } from './start'
import { electron_listen } from '../../app'

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

    const onSceneData = (_event: any, sceneId: string, data: string) => {
        const { current: canvas } = canvasRef
        window.zylSession.currentSceneId = sceneId
        loadScene(canvas, data)
    }
    electron_listen('scene-data', onSceneData)

    useEffect(() => {
        const sceneId = window.zylSession.currentSceneId
        if (sceneId) window.ipcRenderer.send('get-scene', sceneId)
    }, [])

    return (
        <Box sx={containerStyles}>
            <canvas style={canvasStyles} ref={canvasRef} onContextMenu={onCanvasContextMenu} />
        </Box>
    )
}
