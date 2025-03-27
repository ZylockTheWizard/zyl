import React from 'react'
import { Box, Modal } from '@mui/material'

type BaseModalProps = {
    open: boolean
    children: React.ReactNode
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const BaseModal = (props: BaseModalProps) => {
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

    return (
        <Modal open={props.open} onClose={() => props.setOpen(false)}>
            <Box sx={style}>{props.children}</Box>
        </Modal>
    )
}
