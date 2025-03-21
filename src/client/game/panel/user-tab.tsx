import React from 'react'
import { SubmitHandler } from 'react-hook-form'
import { BuildFormComponents } from '../../shared/base-form'
import { Validations } from '../../shared/validations'
import { areEqual, isMaster } from '../../shared/common-functions'
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Modal,
    Typography,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

type UserModalProps = {
    id?: string
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type UserModalFieldValues = {
    id: string
}

const UserForm = BuildFormComponents<UserModalFieldValues>()

const UserModal = (props: UserModalProps) => {
    const style = {
        p: 4,
        top: '50%',
        width: 400,
        left: '50%',
        boxShadow: 24,
        outline: 'none',
        position: 'absolute',
        border: '2px solid #000',
        bgcolor: 'background.paper',
        transform: 'translate(-50%, -50%)',
    }

    const [loading, setLoading] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')

    const onSubmit: SubmitHandler<UserModalFieldValues> = (data: UserModalFieldValues) => {
        setLoading(true)
        window.register('user-save-callback', (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else props.setOpen(false)

            setErrorMessage(error)
        })
        window.ipcRenderer.send('user-save', data.id)
    }

    const user = props.id
        ? window.zylSession.currentUsers.find((u) => areEqual(u.id, props.id))
        : undefined

    const idValidations: Validations = {
        required: true,
        maxLength: true,
        pattern: {
            value: /^[a-zA-Z0-9]*$/gm,
            message: ' must contain alphanumeric characters only',
        },
    }

    return (
        <Modal open={props.open} onClose={() => props.setOpen(false)}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    {user?.id ? 'Edit' : 'New'} Player
                </Typography>
                <UserForm.Form onSubmit={onSubmit} loading={loading} errorMessage={errorMessage}>
                    <UserForm.TextField
                        field="id"
                        label="ID"
                        disabled={!!user?.id}
                        defaultValue={user?.id}
                        validations={idValidations}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || user?.id}
                    >
                        {loading ? <CircularProgress size={25} /> : 'Save'}
                    </Button>
                </UserForm.Form>
            </Box>
        </Modal>
    )
}

export const UserTab = () => {
    const [open, setOpen] = React.useState(false)
    const [userModalId, setUserModalId] = React.useState<string>()

    const [users, setUsers] = React.useState(window.zylSession.currentUsers)

    window.register('current-users', (_event: any, val: any) => {
        window.zylSession.currentUsers = val.users
        setUsers(val.users)
    })

    const openUserModal = (id?: string) => {
        setUserModalId(id)
        setOpen(true)
    }

    const master = isMaster()

    return (
        <List>
            <UserModal {...{ open, setOpen, id: userModalId }} />
            {master && (
                <ListItem disablePadding style={{ textAlign: 'right' }}>
                    <ListItemText>
                        <IconButton title="Add Player" onClick={() => openUserModal()}>
                            <PersonAddIcon />
                        </IconButton>
                    </ListItemText>
                </ListItem>
            )}
            {users.map((user) => (
                <ListItem key={user.id} disablePadding>
                    <ListItemText
                        primary={user.id}
                        onClick={() => master && openUserModal(user.id)}
                        style={{
                            color: !user.connected ? 'gray' : '',
                            cursor: master ? 'pointer' : '',
                        }}
                    />
                </ListItem>
            ))}
        </List>
    )
}
