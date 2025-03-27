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
import { BuildFormComponents } from '../../shared/base-form'
import { PRIMARY_VALIDATIONS } from '../../shared/validations'
import { BaseModal } from '../../shared/base-modal'
import { buildDefaultScene } from '../start'

type SceneModalProps = {
    id?: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    setScenes: React.Dispatch<React.SetStateAction<any[]>>
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

        window.register('scene-save-callback', (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else {
                props.setScenes(val.result.scenes)
                props.setOpen(false)
            }

            setErrorMessage(error)
        })

        window.ipcRenderer.send('scene-save', data.name, buildDefaultScene())
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

    const openSceneModal = () => {
        setOpen(true)
    }

    return (
        <List style={{ padding: 0 }}>
            <SceneModal {...{ open, setOpen, setScenes }} />
            <ListItem disablePadding style={{ textAlign: 'right' }}>
                <ListItemText>
                    <IconButton title="Add Scene" onClick={() => openSceneModal()}>
                        <AddIcon />
                    </IconButton>
                </ListItemText>
            </ListItem>
            {scenes.map((scene, index) => (
                <ListItem key={scene.id} disablePadding divider={index !== scene.length - 1}>
                    <ListItemText primary={scene.name} style={{ cursor: 'pointer' }} />
                </ListItem>
            ))}
        </List>
    )
}
