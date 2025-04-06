import React from 'react'
import { SubmitHandler } from 'react-hook-form'
import {
    Button,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { BuildFormComponents } from '../../shared/base-form'
import { PRIMARY_VALIDATIONS } from '../../shared/validations'
import { BaseModal } from '../../shared/base-modal'
import { buildDefaultScene } from '../start'
import { ElectronCallback, send_recieve } from '../../../app'

type SceneModalProps = {
    id?: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onCurrentScenes: (data: any) => void
}

type SceneModalFieldValues = {
    name: string
}

const SceneForm = BuildFormComponents<SceneModalFieldValues>()

const SceneModal = (props: SceneModalProps) => {
    const [loading, setLoading] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')

    const onSubmit: SubmitHandler<SceneModalFieldValues> = (data: SceneModalFieldValues) => {
        setLoading(true)

        const sceneCreateCallback = (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else {
                props.onCurrentScenes(val.result)
                props.setOpen(false)
            }

            setErrorMessage(error)
        }

        send_recieve('scene-create', sceneCreateCallback, data.name, buildDefaultScene())
    }

    return (
        <BaseModal open={props.open} setOpen={props.setOpen}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                New Scene
            </Typography>
            <SceneForm.Form onSubmit={onSubmit} loading={loading} errorMessage={errorMessage}>
                <SceneForm.TextField field="name" validations={PRIMARY_VALIDATIONS} />
                <Button type="submit" fullWidth variant="contained">
                    {loading ? <CircularProgress color="secondary" size={25} /> : 'Save'}
                </Button>
            </SceneForm.Form>
        </BaseModal>
    )
}

export const ScenesTab = () => {
    const [open, setOpen] = React.useState(false)
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

    const onSceneClick = (sceneId: string) => {
        send_recieve('set-my-scene', setMySceneCallback, sceneId, window.zylSession.userData.id)
    }

    return (
        <List style={{ padding: 0 }}>
            <SceneModal {...{ open, setOpen, onCurrentScenes }} />
            <ListItem disablePadding style={{ textAlign: 'right' }}>
                <ListItemText>
                    <IconButton
                        title="Edit Current Scene"
                        onClick={() => window.open('#/scene-edit', '', 'width=400,height=300')}
                        disabled={!window.zylSession.currentSceneId}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton title="Add Scene" onClick={() => setOpen(true)}>
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
