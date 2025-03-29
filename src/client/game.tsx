import React from 'react'
import { Box, Drawer, Tab, Tabs } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import LandscapeIcon from '@mui/icons-material/Landscape'
import { UsersTab } from './game/panel/users-tab'
import { SettingsTab } from './game/panel/settings-tab'
import { isMaster } from './shared/common-functions'
import { ScenesTab } from './game/panel/scenes-tab'
import { Scene } from './game/scene'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index } = props

    return (
        <div role="tabpanel" hidden={value !== index}>
            <Box style={{ padding: '4px' }}>{children}</Box>
        </div>
    )
}

const GameTabs = () => {
    const [tabValue, setTabValue] = React.useState(0)

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const tabStyles = {
        minWidth: '24px',
    }

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="fullWidth" value={tabValue} onChange={handleChange}>
                    <Tab value={0} icon={<PersonIcon />} title="Players" style={tabStyles} />
                    {isMaster() && (
                        <Tab value={1} icon={<LandscapeIcon />} title="Scenes" style={tabStyles} />
                    )}
                    <Tab value={2} icon={<SettingsIcon />} title="Settings" style={tabStyles} />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
                <UsersTab />
            </TabPanel>
            {isMaster() && (
                <TabPanel value={tabValue} index={1}>
                    <ScenesTab />
                </TabPanel>
            )}
            <TabPanel value={tabValue} index={2}>
                <SettingsTab />
            </TabPanel>
        </Box>
    )
}

export const Game = () => {
    return (
        <>
            <Scene />
            <Box sx={{ display: 'flex' }}>
                <Drawer
                    sx={{
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                        },
                    }}
                    variant="permanent"
                    anchor="right"
                >
                    <GameTabs />
                </Drawer>
            </Box>
        </>
    )
}
