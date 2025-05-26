import React from 'react'
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'

export const TokensTab = () => {
    const tokens = window.zylSession.currentTokens.map((t) => JSON.parse(t.data))
    const tokenPath = `${window.zylSession.userData.url}/images/tokens/`
    return (
        <List style={{ padding: 0 }}>
            {tokens.map((token, index) => (
                <ListItem key={index} disablePadding divider={index !== tokens.length - 1}>
                    <ListItemAvatar style={{ cursor: 'pointer' }}>
                        <Avatar src={tokenPath + token.activeImage} />
                    </ListItemAvatar>
                    <ListItemText primary={token.name} />
                </ListItem>
            ))}
        </List>
    )
}
