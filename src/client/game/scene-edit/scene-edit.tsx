import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CircularProgress } from '@mui/material'
import { electron_send_recieve } from '../../../app'
import { SceneEditForm } from './scene-edit-form'

export const SceneEdit = () => {
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const [maps, setMaps] = useState<string[]>()
    useEffect(() => electron_send_recieve('get-maps', (_, val: any) => setMaps(val)), [])
    return !maps ? <CircularProgress size={25} /> : <SceneEditForm {...{ id, maps }} />
}
