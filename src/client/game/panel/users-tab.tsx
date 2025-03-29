import React from 'react'
import { SubmitHandler } from 'react-hook-form'
import { BuildFormComponents } from '../../shared/base-form'
import { Validations } from '../../shared/validations'
import { areEqual, isMaster } from '../../shared/common-functions'
import {
    Button,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { BaseModal } from '../../shared/base-modal'
import { register, send_register } from '../../../app'

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
    const [loading, setLoading] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')

    const onSubmit: SubmitHandler<UserModalFieldValues> = (data: UserModalFieldValues) => {
        setLoading(true)
        const userSaveCallback = (_event: any, val: any) => {
            setLoading(false)

            let error = ''
            if (val.error) error = val.error
            else props.setOpen(false)

            setErrorMessage(error)
        }
        send_register('user-save', userSaveCallback, data.id)
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
        <BaseModal open={props.open} setOpen={props.setOpen}>
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
                <Button type="submit" fullWidth variant="contained" disabled={loading || user?.id}>
                    {loading ? <CircularProgress size={25} /> : 'Save'}
                </Button>
            </UserForm.Form>
        </BaseModal>
    )
}

export const UsersTab = () => {
    const [open, setOpen] = React.useState(false)
    const [userModalId, setUserModalId] = React.useState<string>()

    const [users, setUsers] = React.useState(window.zylSession.currentUsers)

    register('current-users', (_event: any, val: any) => {
        window.zylSession.currentUsers = val.users
        setUsers(val.users)
    })

    const openUserModal = (id?: string) => {
        setUserModalId(id)
        setOpen(true)
    }

    const master = isMaster()

    return (
        <List style={{ padding: 0 }}>
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
            {users.map((user, index) => (
                <ListItem
                    key={user.id}
                    disablePadding
                    divider={index !== users.length - 1}
                    onClick={() => master && openUserModal(user.id)}
                >
                    <ListItemText
                        primary={user.id}
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
