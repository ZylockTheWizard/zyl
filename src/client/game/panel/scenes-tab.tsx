import React from 'react'
import { IconButton, List, ListItem, ListItemText } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { ElectronCallback, electron_listen, electron_send } from '../../../app'

export const ScenesTab = () => {
    let sceneEditWindow: Window
    const [scenes, setScenes] = React.useState(window.zylSession.currentScenes)
    const [currentSceneId, setCurrentSceneId] = React.useState(window.zylSession.currentSceneId)

    const onCurrentScenes = (data: any) => {
        setScenes(data.scenes)
        window.zylSession.currentScenes = data.scenes
        setCurrentSceneId(data.sceneId)
        window.zylSession.currentSceneId = data.sceneId
    }

    const setMySceneCallback: ElectronCallback = (_, data) => {
        onCurrentScenes(data)
    }

    electron_listen('set-my-scene-callback', setMySceneCallback)

    const onSceneClick = (sceneId: string) => {
        electron_send('set-my-scene', sceneId, window.zylSession.userData.id)
    }

    const onSceneEdit = (id?: string) => {
        if (sceneEditWindow && !sceneEditWindow.closed) {
            sceneEditWindow.close()
        }
        sceneEditWindow = window.open(`#/scene-edit?id=${id ?? 'new'}`, '', 'width=400,height=300')
    }

    return (
        <List style={{ padding: 0 }}>
            <ListItem disablePadding style={{ textAlign: 'right' }}>
                <ListItemText>
                    <IconButton
                        title="Edit Current Scene"
                        onClick={() => onSceneEdit(window.zylSession.currentSceneId)}
                        disabled={!window.zylSession.currentSceneId}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton title="Add Scene" onClick={() => onSceneEdit()}>
                        <AddIcon />
                    </IconButton>
                </ListItemText>
            </ListItem>
            {scenes.map((scene, index) => (
                <ListItem
                    key={scene.id}
                    disablePadding
                    divider={index !== scenes.length - 1}
                    onClick={() => onSceneClick(scene.id)}
                >
                    <ListItemText
                        primary={scene.name}
                        style={{
                            cursor: 'pointer',
                            color: currentSceneId !== scene.id ? 'gray' : '',
                        }}
                    />
                </ListItem>
            ))}
        </List>
    )
}
