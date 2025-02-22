import React from 'react'
import { Avatar, Box, Drawer, FormControl, List, ListItem, ListItemAvatar, ListItemText, TextField, Typography } from '@mui/material'
import { SubmitHandler, useForm } from 'react-hook-form'

type ChatFormData = {
    message: string
}

export const Chat = () => {
    const { register, handleSubmit } = useForm<ChatFormData>()
    const [users, setUsers] = React.useState(window.zylSession.loginData.users)
    const [messages, setMessages] = React.useState(window.zylSession.loginData.messages)

    const textFieldStyles: React.CSSProperties = {
        marginTop: 'auto',
        backgroundColor: 'black',
    }
    window.register('connected-users', (_event: any, val: any) => {
        window.zylSession.loginData = {
            users: val.users,
        }
        setUsers(val.users)
    })

    window.register('current-messages', (_event: any, val: any) => {
        window.zylSession.loginData = {
            messages: val.messages,
        }
        setMessages(val.messages)
    })

    const onSubmit: SubmitHandler<ChatFormData> = (data: ChatFormData) => {
        console.log({ data })
        if (data.message) {
            window.ipcRenderer.send('message', data.message)
        }
    }

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
                anchor="left"
            >
                <List>
                    {users.map((user) => (
                        <ListItem key={user} disablePadding>
                            <ListItemAvatar>
                                <Avatar src={`${window.zylSession.userData.url}/images/Zylorack.jpg`} />
                            </ListItemAvatar>
                            <ListItemText primary={user} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                {messages.map((message, index) => (
                    <Typography key={`message_${index}`} sx={{ marginBottom: 2, border: 'solid white', padding: '4px' }}>
                        <b>{message.userId}</b>
                        <br />
                        <span>{message.message}</span>
                    </Typography>
                ))}
                <FormControl component="form" onSubmit={handleSubmit(onSubmit)} style={textFieldStyles}>
                    <TextField autoFocus id="message" name="message" {...register('message')} />
                </FormControl>
            </Box>
        </Box>
    )
}
