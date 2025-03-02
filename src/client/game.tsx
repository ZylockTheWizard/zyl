import React, { CSSProperties, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { GridMaterial } from '@babylonjs/materials'
import { AbstractMesh, ArcRotateCamera, Engine, MeshBuilder, PointerEventTypes, Scene, StandardMaterial, Texture, Vector3 } from '@babylonjs/core'

export const Game = () => {
    const containerStyles: CSSProperties = {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
    }

    const canvasStyles: CSSProperties = {
        width: '100%',
        height: '100%',
        outline: 'none',
        touchAction: 'none',
    }

    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const { current: canvas } = canvasRef
        if (!canvas) return

        const engine = new Engine(canvas, true)
        const scene = new Scene(engine)

        const camera = new ArcRotateCamera('Camera', -(Math.PI / 2), 0, 30, new Vector3(0, 0, 0), scene)
        camera.attachControl(canvas, true)

        const rotationState = { x: camera.alpha, y: camera.beta }
        scene.registerBeforeRender(() => {
            camera.alpha = rotationState.x
            camera.beta = rotationState.y
        })
        camera.lowerRadiusLimit = 5
        camera.upperRadiusLimit = 30
        camera.wheelPrecision = 5
        camera.inputs.attached.pointers.camera.panningSensibility = 200

        const mapMaterial = new StandardMaterial('map', scene)
        mapMaterial.emissiveTexture = new Texture('https://runefoundry.com/cdn/shop/files/ForestWaterfallIsometric_digital_grid_day.jpg', scene)
        mapMaterial.disableLighting = true
        const ground = MeshBuilder.CreateGround('ground', { width: 33, height: 23.1 }, scene)
        ground.material = mapMaterial

        const gridMaterial = new GridMaterial('grid', scene)
        gridMaterial.gridRatio = 23.1 / 21
        gridMaterial.gridOffset = new Vector3(0, 0, 0.5)
        gridMaterial.majorUnitFrequency = 0
        gridMaterial.opacity = 0.99
        const gridGround = MeshBuilder.CreateGround('grid', { width: 33, height: 23.1 }, scene)
        gridGround.material = gridMaterial
        gridGround.position = new Vector3(0, 0.001, 0)

        const tokenMaterial = new StandardMaterial('token', scene)
        tokenMaterial.emissiveTexture = new Texture('https://runefoundry.com/cdn/shop/files/ForestWaterfallIsometric_digital_grid_day.jpg', scene)
        tokenMaterial.disableLighting = true

        const tokenGround = MeshBuilder.CreateGround('token', { width: 1, height: 1 }, scene)
        tokenGround.material = tokenMaterial
        tokenGround.position = new Vector3(0, 0.002, 0)

        let startingPoint: Vector3
        let currentMesh: AbstractMesh

        const getGroundPosition = function () {
            const pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
                return mesh === ground
            })
            if (pickinfo.hit) {
                return pickinfo.pickedPoint
            }

            return null
        }

        const pointerDown = function (mesh: AbstractMesh) {
            currentMesh = mesh
            startingPoint = getGroundPosition()
            if (startingPoint) {
                setTimeout(function () {
                    camera.detachControl()
                }, 0)
            }
        }

        const pointerUp = function () {
            if (startingPoint) {
                camera.attachControl(canvas, true)
                startingPoint = null
                return
            }
        }

        const pointerMove = function () {
            if (!startingPoint) {
                return
            }
            const current = getGroundPosition()
            if (!current) {
                return
            }

            const diff = current.subtract(startingPoint)
            currentMesh.position.addInPlace(diff)

            startingPoint = current
        }

        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.button === 0 && pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh !== ground) {
                        pointerDown(pointerInfo.pickInfo.pickedMesh)
                    }
                    break
                case PointerEventTypes.POINTERUP:
                    pointerUp()
                    break
                case PointerEventTypes.POINTERMOVE:
                    pointerMove()
                    break
            }
        })

        engine.runRenderLoop(() => scene.render())
        window.addEventListener('resize', () => engine.resize())
    })

    return (
        <Box sx={containerStyles}>
            <canvas
                style={canvasStyles}
                ref={canvasRef}
                onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
            />
        </Box>
    )
}
