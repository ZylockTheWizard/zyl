import {
    AbstractMesh,
    ArcRotateCamera,
    Color3,
    Color4,
    Engine,
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

const save = () => {
    const id = window.zylSession.currentSceneId
    const scene = window.babylonEngine.scenes[0]
    window.ipcRenderer.send('scene-update', id, JSON.stringify(SceneSerializer.Serialize(scene)))
}

export const loadScene = (canvas: HTMLCanvasElement, data: string) => {
    if (!window.babylonEngine) window.babylonEngine = new Engine(canvas, true)
    else window.babylonEngine.scenes[0].dispose()

    LoadSceneAsync('data: ' + data, window.babylonEngine).then((scene) => {
        const camera = scene.cameras[0] as ArcRotateCamera
        camera.attachControl(canvas, true)
        const rotationState = { x: camera.alpha, y: camera.beta }
        scene.registerBeforeRender(() => {
            camera.alpha = rotationState.x
            camera.beta = rotationState.y
        })

        const tokenGround = scene.meshes.find((m) => m.name === 'token-ground')
        const gridGround = scene.meshes.find((m) => m.name === 'grid-ground')
        const gridMaterial = gridGround.material as GridMaterial
        const highlightLayer = scene.effectLayers.find(
            (l) => l.name === 'highlight-layer',
        ) as HighlightLayer
        highlightLayer.removeAllMeshes()

        let tokenSelected: AbstractMesh
        let grabStart: Vector3

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

        const onPointerUp = () => {
            grabStart = null
            if (tokenSelected) {
                const pos = tokenSelected.position
                const gridRatio = gridMaterial.gridRatio
                const xOffset = gridRatio / 2
                pos.x = Math.round((pos.x + xOffset) / gridRatio) * gridRatio - xOffset
                pos.z = Math.round(pos.z / gridRatio) * gridRatio
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
                        tokenSelected.position.z += gridMaterial.gridRatio
                        save()
                        break
                    case 'ArrowDown':
                    case 's':
                        tokenSelected.position.z -= gridMaterial.gridRatio
                        save()
                        break
                    case 'ArrowRight':
                    case 'd':
                        tokenSelected.position.x += gridMaterial.gridRatio
                        save()
                        break
                    case 'ArrowLeft':
                    case 'a':
                        tokenSelected.position.x -= gridMaterial.gridRatio
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
        window.addEventListener('resize', () => window.babylonEngine.resize())
    })
}

export const updateScene = (data: string) => {
    LoadSceneAsync('data: ' + data, window.babylonEngine)
}

export const buildDefaultScene = () => {
    const engine = new Engine(document.createElement('canvas'))
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)

    const camera = new ArcRotateCamera('camera', -(Math.PI / 2), 0, 30, new Vector3(0, 0, 0), scene)

    camera.lowerRadiusLimit = 5
    camera.upperRadiusLimit = 30
    camera.wheelPrecision = 5
    camera.inputs.attached.pointers.camera.panningSensibility = 200

    const mapMaterial = new StandardMaterial('map-material', scene)
    mapMaterial.emissiveTexture = new Texture(
        `${window.zylSession.userData.url}/images/map1.png`,
        scene,
    )
    const map = MeshBuilder.CreateGround('map-ground', { width: 33, height: 23.1 }, scene)
    map.material = mapMaterial
    map.position = new Vector3(0.05, 0, 0.03)
    map.alphaIndex = 0

    const gridMaterial = new GridMaterial('grid-material', scene)
    gridMaterial.gridRatio = 23.1 / 21
    gridMaterial.gridOffset = new Vector3(0, 0, 0.55)
    gridMaterial.majorUnitFrequency = 0
    gridMaterial.opacity = 0.99
    const gridGround = MeshBuilder.CreateGround('grid-ground', { width: 33, height: 23.1 }, scene)
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
