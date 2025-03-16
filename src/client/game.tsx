import React from 'react'
import { useNavigate } from 'react-router'
import { SubmitHandler } from 'react-hook-form'
import {
    Box,
    Button,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Modal,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { BuildFormComponents } from './shared/base-form'
import { Validations } from './shared/validations'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index } = props

    return (
        <div role="tabpanel" hidden={value !== index}>
            <Box sx={{ p: 2 }}>{children}</Box>
        </div>
    )
}

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
            console.log({ val })

            let error = ''
            if (val.error) error = val.error
            else props.setOpen(false)

            setErrorMessage(error)
        })
        window.ipcRenderer.send('user-save', data.id)
    }

    const user = props.id
        ? window.zylSession.loginData.users.find((u) => u.id === props.id)
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

const GameTabs = () => {
    const navigate = useNavigate()
    const [tabValue, setTabValue] = React.useState(0)
    const [users, setUsers] = React.useState(window.zylSession.loginData.users)

    window.register('current-users', (_event: any, val: any) => {
        console.log({ currentUsers: val })
        window.zylSession.loginData = { users: val.users }
        setUsers(val.users)
    })

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const onDisconnectClick = function () {
        window.ipcRenderer.send('logout')
        navigate('/')
    }

    const [open, setOpen] = React.useState(false)

    const [userModalId, setUserModalId] = React.useState<string>()

    const openUserModal = (id?: string) => {
        setUserModalId(id)
        setOpen(true)
    }

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="fullWidth" value={tabValue} onChange={handleChange}>
                    <Tab icon={<PersonIcon />} title="Players" />
                    <Tab icon={<SettingsIcon />} title="Settings" />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
                <List>
                    <ListItem disablePadding style={{ textAlign: 'right' }}>
                        <ListItemText>
                            <IconButton title="Add Player" onClick={() => openUserModal()}>
                                <PersonAddIcon />
                            </IconButton>
                        </ListItemText>
                    </ListItem>
                    {users.map((user) => (
                        <ListItem key={user.id} disablePadding>
                            <ListItemText
                                primary={user.id}
                                onClick={() => openUserModal(user.id)}
                                style={{ color: !user.connected ? 'gray' : '', cursor: 'pointer' }}
                            />
                        </ListItem>
                    ))}
                </List>
                <UserModal {...{ open, setOpen, id: userModalId }} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Typography
                    title="User"
                    style={{
                        width: '100%',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '24px',
                    }}
                >
                    {window.zylSession.userData.user}
                </Typography>
                <Button fullWidth variant="contained" color="error" onClick={onDisconnectClick}>
                    Disconnect
                </Button>
            </TabPanel>
        </Box>
    )
}

export const Game = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                sx={{
                    width: 200,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 200,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="right"
            >
                <GameTabs />
            </Drawer>
        </Box>
    )
}
