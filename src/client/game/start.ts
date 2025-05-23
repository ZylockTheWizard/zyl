import {
    AbstractMesh,
    ArcRotateCamera,
    Color3,
    Color4,
    Engine,
    GroundMesh,
    HighlightLayer,
    IKeyboardEvent,
    KeyboardEventTypes,
    LoadSceneAsync,
    Mesh,
    MeshBuilder,
    PointerEventTypes,
    PointerInfo,
    Scene,
    SceneSerializer,
    StandardMaterial,
    Texture,
    Vector3,
} from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'
import { window_listen } from '../../app'

export type SceneConfig = {
    mapUrl: string
    mapWidth: number
    mapHeight: number
    gridColumns: number
    gridRows: number
    mapX: number
    mapZ: number
    gridLines: boolean
}

const save = () => {
    const id = window.zylSession.currentSceneId
    const scene = window.babylonEngine.scenes[0]
    window.ipcRenderer.send('scene-update', id, JSON.stringify(SceneSerializer.Serialize(scene)))
}

const isEven = (val: number) => val % 2 === 0

const calcSceneProps = (config: SceneConfig) => {
    const { mapWidth, mapHeight, gridColumns, gridRows } = config
    const cellWidth = mapWidth / gridColumns
    const cellHeight = mapHeight / gridRows
    if (cellWidth !== cellHeight) {
        throw new Error('Invalid Dimensions')
    }
    const maxCells = Math.max(gridColumns, gridRows)
    const width = mapWidth / maxCells
    const height = mapHeight / maxCells
    const gridRatio = width / gridColumns

    const gridOffsetX = isEven(gridColumns) ? 0 : gridRatio / 2
    const gridOffsetZ = isEven(gridRows) ? 0 : gridRatio / 2

    return { width, height, gridRatio, gridOffsetX, gridOffsetZ }
}

const setupCamera = (scene: Scene, canvas: HTMLCanvasElement) => {
    const camera = scene.cameras[0] as ArcRotateCamera
    camera.attachControl(canvas, true)
    const rotationState = { x: camera.alpha, y: camera.beta }
    scene.registerBeforeRender(() => {
        camera.alpha = rotationState.x
        camera.beta = rotationState.y
    })
}

const onSceneLoaded = (scene: Scene) => {
    const canvas = window.babylonEngine.getRenderingCanvas()
    setupCamera(scene, canvas)

    const tokenGround = scene.meshes.find((m) => m.name === 'token-ground') as GroundMesh
    const gridGround = scene.meshes.find((m) => m.name === 'grid-ground') as GroundMesh
    const mapGround = scene.meshes.find((m) => m.name === 'map-ground') as GroundMesh
    const gridMaterial = gridGround.material as GridMaterial
    const gridRatio = gridMaterial.gridRatio
    const highlightLayer = scene.effectLayers.find(
        (l) => l.name === 'highlight-layer',
    ) as HighlightLayer
    highlightLayer.removeAllMeshes()

    let tokenSelected: AbstractMesh
    let grabStart: Vector3

    window_listen('scene-manage', (event: CustomEvent) => {
        const config: SceneConfig = event.detail
        const { mapX, mapZ, gridLines } = config

        mapGround.position = new Vector3(mapX, 0, mapZ)
        gridMaterial.opacity = gridLines ? 0.99 : 0

        save()
    })

    const cursorPick = () => scene.pick(scene.pointerX, scene.pointerY)

    const onPointerDown = (pointerInfo: PointerInfo) => {
        highlightLayer.removeAllMeshes()
        const pickedMesh = pointerInfo.pickInfo.pickedMesh
        if (pointerInfo.event.button === 0 && pickedMesh === tokenGround) {
            tokenSelected = pickedMesh
            grabStart = cursorPick().pickedPoint
        } else {
            tokenSelected = null
        }
    }

    const onPointerMove = () => {
        const hoverMesh = cursorPick()?.pickedMesh

        let cursor = 'default'
        if (hoverMesh === tokenGround) cursor = 'grab'
        if (grabStart) cursor = 'grabbing'
        canvas.style.cursor = cursor

        if (!grabStart) return
        const current = cursorPick()?.pickedPoint
        if (!current) return
        const diff = current.subtract(grabStart)
        diff.y = 0
        tokenSelected.position.addInPlace(diff)
        grabStart = current
    }

    const gridColumns = Math.round(gridGround._width / gridRatio)
    const gridRows = Math.round(gridGround._height / gridRatio)
    const xOffset = isEven(gridColumns) ? gridRatio / 2 : 0
    const zOffset = isEven(gridRows) ? gridRatio / 2 : 0

    const onPointerUp = () => {
        grabStart = null
        if (tokenSelected) {
            const pos = tokenSelected.position
            pos.x = Math.round((pos.x + xOffset) / gridRatio) * gridRatio - xOffset
            pos.z = Math.round((pos.z + zOffset) / gridRatio) * gridRatio - zOffset
            tokenSelected.position = pos
            highlightLayer.addMesh(tokenSelected as Mesh, Color3.Blue())

            save()
        }
    }

    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case PointerEventTypes.POINTERDOWN:
                onPointerDown(pointerInfo)
                break
            case PointerEventTypes.POINTERUP:
                onPointerUp()
                break
            case PointerEventTypes.POINTERMOVE:
                onPointerMove()
                break
        }
    })

    const onKeyUp = (event: IKeyboardEvent) => {
        if (tokenSelected) {
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                    tokenSelected.position.z += gridRatio
                    save()
                    break
                case 'ArrowDown':
                case 's':
                    tokenSelected.position.z -= gridRatio
                    save()
                    break
                case 'ArrowRight':
                case 'd':
                    tokenSelected.position.x += gridRatio
                    save()
                    break
                case 'ArrowLeft':
                case 'a':
                    tokenSelected.position.x -= gridRatio
                    save()
                    break
            }
        }
    }

    scene.onKeyboardObservable.add((keyboardInfo) => {
        switch (keyboardInfo.type) {
            case KeyboardEventTypes.KEYUP:
                onKeyUp(keyboardInfo.event)
                break
        }
    })

    window.babylonEngine.runRenderLoop(() => scene.render())
    window_listen('resize', () => window.babylonEngine.resize())
}

export const loadScene = (canvas: HTMLCanvasElement, data: string) => {
    if (!window.babylonEngine) window.babylonEngine = new Engine(canvas, true)
    else window.babylonEngine.scenes[0].dispose()

    LoadSceneAsync('data: ' + data, window.babylonEngine).then(onSceneLoaded)
}

export const buildInitialScene = (config: SceneConfig) => {
    const engine = new Engine(document.createElement('canvas'))
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)
    const camera = new ArcRotateCamera('camera', -(Math.PI / 2), 0, 30, new Vector3(0, 0, 0), scene)
    camera.lowerRadiusLimit = 5
    camera.upperRadiusLimit = 50
    camera.wheelPrecision = 5
    camera.inputs.attached.pointers.camera.panningSensibility = 200

    const { mapUrl, mapX, mapZ, gridLines } = config
    const { width, height, gridRatio, gridOffsetX, gridOffsetZ } = calcSceneProps(config)

    const mapDimensions = { width, height }
    const mapMaterial = new StandardMaterial('map-material', scene)
    mapMaterial.emissiveTexture = new Texture(mapUrl, scene)
    const mapGround = MeshBuilder.CreateGround('map-ground', mapDimensions, scene)
    mapGround.material = mapMaterial
    mapGround.position = new Vector3(mapX, 0, mapZ)
    mapGround.alphaIndex = 0

    const gridMaterial = new GridMaterial('grid-material', scene)
    gridMaterial.gridRatio = gridRatio
    gridMaterial.gridOffset = new Vector3(gridOffsetX, 0, gridOffsetZ)
    gridMaterial.majorUnitFrequency = 0
    gridMaterial.opacity = gridLines ? 0.99 : 0
    const gridGround = MeshBuilder.CreateGround('grid-ground', mapDimensions, scene)
    gridGround.material = gridMaterial
    gridGround.position = new Vector3(0, 0.001, 0)
    gridGround.alphaIndex = 1

    const tokenMaterial = new StandardMaterial('token-material', scene)
    const tokenTexture = new Texture(`${window.zylSession.userData.url}/images/token1.png`, scene)
    tokenMaterial.emissiveTexture = tokenTexture
    tokenMaterial.opacityTexture = tokenTexture
    const tokenGround = MeshBuilder.CreateGround(
        'token-ground',
        { width: gridMaterial.gridRatio, height: gridMaterial.gridRatio },
        scene,
    )
    tokenGround.material = tokenMaterial
    tokenGround.position = new Vector3(0, 0.002, 0)
    tokenGround.alphaIndex = 2

    new HighlightLayer('highlight-layer', scene, {
        isStroke: true,
        mainTextureRatio: 5,
    })

    return JSON.stringify(SceneSerializer.Serialize(scene))
}
