import React, { useRef, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'
import { Engine, GroundMesh, StandardMaterial, Texture } from '@babylonjs/core'
import { electron_send, electron_send_recieve, window_dispatch } from '../../../app'
import { ToolFormWrapper } from '../../shared/tool-form-wrapper'
import { DEFAULT_VALIDATIONS } from '../../shared/validations'
import { buildInitialScene, SceneConfig } from '../start'
import { AutocompletOnChange, BuildFormComponents } from '../../shared/base-form'
import { Grid } from '@mui/material'
import { GridMaterial } from '@babylonjs/materials'

type SceneEditValues = {
    map: string
    name: string
    width: number
    height: number
    gridRows: number
    gridColumns: number
    mapX: number
    mapZ: number
    gridLines: boolean
}

const SceneEditComponents = BuildFormComponents<SceneEditValues>()

export type SceneEditFromProps = {
    id: string
    maps: string[]
}

export const SceneEditForm = (props: SceneEditFromProps) => {
    const { id, maps } = props
    const [errorMessage, setErrorMessage] = useState('')

    let pageTitle: string
    let sceneName: string
    let map: string
    let gridColumns: number
    let gridRows: number
    let mapX: number
    let mapZ: number
    let gridLines: boolean
    if (id === 'new') {
        pageTitle = 'New Scene'
        mapX = 0
        mapZ = 0
        gridLines = true
    } else {
        pageTitle = 'Edit Scene'
        sceneName = window.opener.zylSession.currentScenes.find(
            (s: any) => s.id === Number(id),
        ).name
        const engine = window.opener.babylonEngine as Engine
        const scene = engine.scenes[0]
        const mapGround = scene.meshes.find((m) => m.name === 'map-ground') as GroundMesh
        const material = mapGround.material as StandardMaterial
        map = (material.emissiveTexture as Texture).url.replace(/.*\//g, '')
        const gridMaterial = scene.materials.find((m) => m.name === 'grid-material') as GridMaterial
        const gridRatio = gridMaterial.gridRatio
        gridColumns = Math.round(mapGround._width / gridRatio)
        gridRows = Math.round(mapGround._height / gridRatio)
        mapX = mapGround.position.x
        mapZ = mapGround.position.z
        gridLines = gridMaterial.opacity !== 0
    }

    const onSubmit: SubmitHandler<SceneEditValues> = (data) => {
        const mapElement = mapRef.current
        const config: SceneConfig = {
            mapUrl: mapElement.src,
            mapWidth: mapElement.naturalWidth,
            mapHeight: mapElement.naturalHeight,
            gridColumns: data.gridColumns,
            gridRows: data.gridRows,
            mapX: data.mapX,
            mapZ: data.mapZ,
            gridLines: data.gridLines,
        }
        if (id === 'new') {
            return new Promise<void>((resolve) => {
                const sceneCreateCallback = (_event: any, val: any) => {
                    let error = ''
                    if (val.error) error = val.error
                    else {
                        electron_send(
                            'set-my-scene',
                            val.result.sceneId,
                            window.opener.zylSession.userData.id,
                        )
                    }
                    setErrorMessage(error)
                    resolve()
                    window.close()
                }
                electron_send_recieve(
                    'scene-create',
                    sceneCreateCallback,
                    data.name,
                    buildInitialScene(config),
                )
            })
        } else {
            window_dispatch('scene-manage', config)
        }
    }

    const [mapSource, setMapSource] = useState(map)
    const mapRef = useRef<HTMLImageElement>(null)

    const onMapChange: AutocompletOnChange = (_, value) => {
        setMapSource(value)
    }

    return (
        <ToolFormWrapper pageTitle={pageTitle}>
            <SceneEditComponents.Form onSubmit={onSubmit} errorMessage={errorMessage}>
                <Grid container spacing={2}>
                    <SceneEditComponents.TextField
                        autoFocus
                        field="name"
                        defaultValue={sceneName}
                        validations={DEFAULT_VALIDATIONS}
                    />
                    <Grid size={8}>
                        <SceneEditComponents.Autocomplete
                            field="map"
                            options={maps}
                            defaultValue={map}
                            onChange={onMapChange}
                            validations={DEFAULT_VALIDATIONS}
                        />
                    </Grid>
                    <Grid size={4}>
                        {mapSource && (
                            <img
                                ref={mapRef}
                                style={{ height: '49px', verticalAlign: 'text-top' }}
                                src={`${window.opener.zylSession.userData.url}/images/maps/${mapSource}`}
                            />
                        )}
                    </Grid>
                    <Grid size={6}>
                        <SceneEditComponents.TextField
                            type="number"
                            field="gridColumns"
                            defaultValue={gridColumns}
                            validations={DEFAULT_VALIDATIONS}
                        />
                    </Grid>
                    <Grid size={6}>
                        <SceneEditComponents.TextField
                            type="number"
                            field="gridRows"
                            defaultValue={gridRows}
                            validations={DEFAULT_VALIDATIONS}
                        />
                    </Grid>
                    <Grid size={6}>
                        <SceneEditComponents.TextField
                            type="number"
                            step={0.01}
                            field="mapX"
                            defaultValue={mapX}
                            validations={DEFAULT_VALIDATIONS}
                        />
                    </Grid>
                    <Grid size={6}>
                        <SceneEditComponents.TextField
                            type="number"
                            step={0.01}
                            field="mapZ"
                            defaultValue={mapZ}
                            validations={DEFAULT_VALIDATIONS}
                        />
                    </Grid>
                    <Grid size={12}>
                        <SceneEditComponents.Switch field="gridLines" defaultChecked={gridLines} />
                    </Grid>
                    <SceneEditComponents.SubmitButton label={'Submit'} />
                </Grid>
            </SceneEditComponents.Form>
        </ToolFormWrapper>
    )
}
