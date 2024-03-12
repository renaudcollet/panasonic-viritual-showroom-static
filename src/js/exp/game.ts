import { SCALE_SCENE_FACTOR, CAMERA_Y, CAMERA_FOV, CAMERA_START_X, CAMERA_START_Z, CAMERA_START_ROT_X, CAMERA_START_ROT_Y, DEBUG_GUI, DEBUG_GUI_CLOSED, DEBUG_WIREFRAME, CAMERA_DISTANCE_FROM_PLAYER, ENV_MAP_INTENSITY, TONE_MAPPING_EXPOSURE, VOLUME_DEFAULT, VOLUME_VIDEO_DISTANCE_MAX, VOLUME_VIDEO_DISTANCE_GAP, ENABLE_SOUND } from '../const'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
// import { MeshoptDecoder } from '../libs/meshopt_decoder.js';
// import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader'
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI, GUIController } from 'three/examples/jsm/libs/dat.gui.module'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { ObjectData } from './objects/ObjectData'
import ObjectsModel from './model/ObjectsModel'
import { ACESFilmicToneMapping, AmbientLight, AxesHelper, Box3, BoxBufferGeometry, BufferAttribute, BufferGeometry, CineonToneMapping, Color, CubeTexture, CubeTextureLoader, DirectionalLight, Euler, Group, HemisphereLight, Intersection, Line, LinearToneMapping, MathUtils, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, NoToneMapping, Object3D, PCFShadowMap, PerspectiveCamera, Quaternion, Raycaster, ReinhardToneMapping, Scene, sRGBEncoding, TextureLoader, Vector3, VideoTexture, WebGLRenderer } from 'three'
import FirstPerson from './control/FirstPerson'
import gsap from 'gsap'
import Chip from './ui/chip'
import * as Optimizer from '../utils/Optimizer'
import AudioPlayer from './audio/audio-player'
import CreateVideo from './video/create-video'

export default class Game {
  private scene: Scene
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private control: FirstPerson
  private environmentTexture: CubeTexture
  // private backgroundTexture: CubeTexture
  private orbit: OrbitControls
  
  // private intersectHelper: Line
  private intersection: any
  private aIntersectsPlayer: Array<Intersection>
  private aIntersectsChip: Array<Intersection>
  private aIntersectsClickable: Array<Intersection>
  private raycasterPlayer: Raycaster
  private raycasterChip: Raycaster
  private raycasterClickable: Raycaster

  private meshBoundingBoxMat: MeshBasicMaterial
  private textureLoader: TextureLoader
  private ktx2Loader: KTX2Loader
  // private basisLoader: BasisTextureLoader
  /* private ktx2FormatStrings = {
    [ RGBAFormat ]: "RGBA32",
    [ RGBA_ASTC_4x4_Format ]: "RGBA_ASTC_4x4",
    [ RGB_S3TC_DXT1_Format ]: "RGB_S3TC_DXT1",
    [ RGBA_S3TC_DXT5_Format ]: "RGBA_S3TC_DXT5",
    [ RGB_PVRTC_4BPPV1_Format ]: "RGB_PVRTC_4BPPV1",
    [ RGBA_PVRTC_4BPPV1_Format ]: "RGBA_PVRTC_4BPPV1",
    [ RGB_ETC1_Format ]: "RGB_ETC1",
    [ RGB_ETC2_Format ]: "RGB_ETC2",
    [ RGBA_ETC2_EAC_Format ]: "RGB_ETC2_EAC",
  }; */

  private pointerDownX: number
  private pointerDownY: number
  private bMouseDownMoved: boolean
  private bMouseDown: boolean
  // private bMouseRightDownMoved: boolean
  private bMouseRightDown: boolean
  private bMoveCameraToTarget: boolean
  private modeOverview:boolean
  private modeComeFromOverview:boolean
  private oGsapLook: any

  private windowW: number
  private windowH: number
  private windowHalfW: number
  private windowHalfH: number

  private loadedObjects: number
  private totalObjects: number
  private callbackCompleteLoader: Function

  public audioPlayer: AudioPlayer
  
  private aClickableMeshes: Array<Mesh>
  private aCollisionMeshes: Array<Mesh>
  private aChips: Array<Chip>  
  private nbChips: number = 0
  private aNavRoomOverview: Array<{elNav: HTMLElement, obj3d: Object3D}>  
  private aVideosIn3D: Array<{obj3D: Object3D, meshTV: Mesh, name: string, file: string, poster: string}> = []
  private bSoundInVideoInited: boolean = false

  private chipContainer: HTMLElement = document.getElementById('chip-container') as HTMLElement
  private orbitContainer: HTMLElement = document.getElementById('orbit-container') as HTMLElement
  private overviewContainer: HTMLElement = document.getElementById('overview-container') as HTMLElement
  private prepareLoader: HTMLElement = document.querySelector('#main-loader-prepare span') as HTMLElement
  private elLoaderProgress :HTMLElement = document.getElementById('main-loader-progress') as HTMLElement
  private elLoaderPercent :HTMLElement = document.getElementById('main-loader-percent') as HTMLElement

  // private debugOutput: HTMLElement = document.querySelector('#debug-output') as HTMLElement

  private stats: any
  private gui: GUI
  private guiDebugObject: any = {}
  private guiCamRotX: GUIController

  public UID: number = Math.round(Math.random() * 100)

  constructor() {
    // this.addStats()
  }

  async init(aModels: Array<object>, cbkComplete: Function) {
    this.callbackCompleteLoader = cbkComplete

    // Scene
    this.scene = new Scene()
		// this.scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 )

    // Camera
    this.camera = new PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(CAMERA_START_X, CAMERA_Y, CAMERA_START_Z) // Distance from player
    this.camera.rotation.set(CAMERA_START_ROT_X, CAMERA_START_ROT_Y, 0, 'YXZ') // 'XYZ' mandatory
    this.camera.name = 'main-camera'

    // Env Map
    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_envmaps.html
    const loader = new CubeTextureLoader()
    loader.setPath( window.theme_path + 'assets/img/' )

    // this.backgroundTexture = loader.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
    // this.backgroundTexture.encoding = sRGBEncoding
    // this.scene.background = this.backgroundTexture
    this.scene.background = new Color(0xffffff)

    // this.environmentTexture = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] )
    this.environmentTexture = loader.load( [ 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg' ] )
    this.environmentTexture.encoding = sRGBEncoding
    this.scene.environment = this.environmentTexture

    // Init vars
    this.aCollisionMeshes = []
    this.aClickableMeshes = []
    this.aChips = []
    this.aNavRoomOverview = []
    
    // Mesh Material product hit box
    this.meshBoundingBoxMat = new MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false, fog: false })

    this.addGUI()
    this.addRenderer()
    this.addLights()
    // this.addGround()
    // this.addGrid()
    this.addControl()
    this.addOrbitControl()
    this.addObjects(aModels)
    this.addRaycaster()
    // this.testKTX2()

    // const axesHelper = new AxesHelper(100)
    // axesHelper.name = 'axes-helper'
    // this.scene.add(axesHelper)

    window.addEventListener('resize', Optimizer.throttle(this.onWindowResize.bind(this)), false)
    // Note: in FirstPerson we use 'mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchend'
    // window.addEventListener('touchstart', this.onTouchStart.bind(this), false)

    // Note: The container used for interactive event is chip container
    // this.chipContainer?.addEventListener('pointermove', this.onPointerMove.bind(this), false)
    this.chipContainer?.addEventListener('pointermove', this.throttle((evt: any) => {
      this.onPointerMove(evt)
    }), false)
    this.chipContainer?.addEventListener('pointerdown', this.onPointerDown.bind(this), false)
    this.chipContainer?.addEventListener('pointerup', this.onPointerUp.bind(this), false)
    this.chipContainer?.addEventListener('contextmenu', this.onContextMenu.bind(this), false)

    // NOTE: Added in main.ts to handle modals opening
    // this.chipContainer?.addEventListener('click', this.onClickChipContainer.bind(this), false)

    this.bMouseDownMoved = false
    this.bMouseDown = false
    
    this.animate()
    this.onWindowResize()

    window.game = this
  }

  updateAllMaterials() {
    this.scene.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.envMapIntensity = this.guiDebugObject.envMapIntensity
        child.material.needsUpdate = true
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  addRenderer() {
    this.renderer = new WebGLRenderer( { antialias: true } )
		this.renderer.setPixelRatio( window.devicePixelRatio )
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.physicallyCorrectLights = true
    this.renderer.toneMapping = LinearToneMapping // ACESFilmicToneMapping
    // this.renderer.toneMapping = Number(this.renderer.toneMapping)
    this.renderer.toneMappingExposure = TONE_MAPPING_EXPOSURE // default
    this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.type = PCFShadowMap;

    if (DEBUG_GUI) {
      this.guiDebugObject.envMapIntensity = ENV_MAP_INTENSITY
      this.gui.add(this.guiDebugObject, 'envMapIntensity', 0, 10, 0.001).onChange(this.updateAllMaterials.bind(this))
      
      this.gui
      .add(this.renderer, 'toneMapping', {
        No: NoToneMapping,
        Linear: LinearToneMapping,
        Reinhard: ReinhardToneMapping,
        Cineon: CineonToneMapping,
        ACESFilmic: ACESFilmicToneMapping
      })
      .onFinishChange(() => {
        this.renderer.toneMapping = Number(this.renderer.toneMapping)
        this.updateAllMaterials()
      })

      this.gui.add(this.renderer, 'toneMappingExposure', 0, 10, 0.001)
    }
    this.renderer.domElement.classList.add('experience-canvas')
    document.body.appendChild(this.renderer.domElement)
  }

  addRaycaster() {
    // RAYCASTER
    this.raycasterPlayer = new Raycaster()
    this.raycasterChip = new Raycaster()
    this.raycasterClickable = new Raycaster()

    // INTERSECTION
    this.intersection = {
      intersects: false,
      point: new Vector3(),
      normal: new Vector3(),
      quaternion: new Quaternion(),
      isHistory: false
    }
    this.aIntersectsPlayer = []
    this.aIntersectsChip = []
    this.aIntersectsClickable = []

    // Intersection Helper
    // this.intersectHelper = new AxesHelper(5)
    // this.intersectHelper.position.set(0, 0, 0)
    // this.intersectHelper.name = 'intersect-helper'
    // this.scene.add(this.intersectHelper)
  }

  addLights() {
    // LIGHTS
		const hemisphereLight: HemisphereLight = new HemisphereLight( 0xf9fcc3, 0xa2a2a2 ) // Cast no shadows
		hemisphereLight.position.set( 0, 10, 0 )
    hemisphereLight.name = 'light-hemisphere'
		// this.scene.add( hemisphereLight )
    
    // Hemisphere Light Helper
    // const helper = new HemisphereLightHelper( hemisphereLight, 5 )
    // this.scene.add( helper )

    const ambientLight: AmbientLight = new AmbientLight(0xffffff, 2)
    this.scene.add(ambientLight)

    // Directional Light
    // See this https://stackoverflow.com/questions/65655433/why-is-three-js-cast-shadow-not-working-on-a-3d-model
    const directionalLight:DirectionalLight = new DirectionalLight(0xffffff, 5)
		directionalLight.position.set( 101, 35, 9 )
    directionalLight.target.position.set(0, 0, 0)
		directionalLight.castShadow = true
    // directionalLight.visible = false
    
    // directionalLight.shadow.radius = 2// Not working with PCFSoftShadowMap
    directionalLight.shadow.camera.left = -120;
    directionalLight.shadow.camera.right = 175;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 160
    directionalLight.shadow.mapSize.set(512, 512)
    directionalLight.name = 'light-direction'
    // // directionalLight.shadow.bias = 0.007
    // directionalLight.shadow.normalBias = 1
    
		this.scene.add( directionalLight )
		this.scene.add( directionalLight.target )

    // Directional Light Camera Helper
    // const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera)
    // this.scene.add(directionalLightCameraHelper)

    // Directional Light Helper
    // const lightHelper = new DirectionalLightHelper(directionalLight, 5, 0xffff00)
    // this.scene.add( lightHelper )

    // Point Light
    // const light_point:PointLight = new PointLight(0xffffff, 8, 100, 1)
    // light_point.position.set(200, 78, 186)
    // light_point.intensity = 0.9
    // light_point.decay = 0
    // light_point.distance = 0
    // this.scene.add(light_point)

    if (DEBUG_GUI) {
      const hemisphereLightFolder = this.gui.addFolder("Light Hemisphere")
      hemisphereLightFolder.add(hemisphereLight, "visible", false)
      hemisphereLightFolder.add(hemisphereLight, "intensity", 0, 10, 0.0001)

      // Ambient Light
      const ambientLightFolder = this.gui.addFolder("Light Ambient")
      ambientLightFolder.add(directionalLight, "visible", false)
      ambientLightFolder.add(directionalLight, "intensity", 0, 10, 0.0001)

      // Directional Light
      const onDirectionalLightChange = () => {
        directionalLight.target.updateMatrixWorld()
        // lightHelper.update()
      }

      // light1Folder.open()
      const light2Folder = this.gui.addFolder("Light Directional")
      light2Folder.add(directionalLight, "visible", false)
      light2Folder.add(directionalLight.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
      light2Folder.add(directionalLight.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
      light2Folder.add(directionalLight.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
      light2Folder.add(directionalLight, "intensity", 0, 10, 0.0001)

      const light3Folder = this.gui.addFolder("Light Dir. target")
      light3Folder.add(directionalLight.target.position, "x", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
      light3Folder.add(directionalLight.target.position, "y", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
      light3Folder.add(directionalLight.target.position, "z", -200, 200, 0.01).onChange(() => onDirectionalLightChange)
  
      // Point Light
      // const lightPointFolder = this.gui.addFolder("light point")
      // lightPointFolder.add(light_point, "visible", false)
      // lightPointFolder.add(light_point.position, "x", -300, 300, 0.01)
      // lightPointFolder.add(light_point.position, "y", -300, 300, 0.01)
      // lightPointFolder.add(light_point.position, "z", -300, 300, 0.01)
      // lightPointFolder.add(light_point, "intensity", 0, 10, 0.001)
      // lightPointFolder.add(light_point, "decay", 0, 10, 0.001)
      // lightPointFolder.add(light_point, "distance", 0, 20, 0.001)
    }
  }

  /* addGround() {
		var mesh = new Mesh( new PlaneBufferGeometry( 2000, 2000 ), new MeshBasicMaterial( { color: 0xFFF000, depthWrite: false, transparent: true, opacity: 0.0 } ) )
		mesh.rotation.x = - Math.PI / 2
    mesh.name = 'ground'
		this.scene.add( mesh )
    this.aCollisionMeshes.push(mesh)
  } */

  /* addGrid() {
    // const polarGridHelper = new PolarGridHelper( 500, 6, 8, 64, 0x0000ff, 0x808080 )
    // polarGridHelper.name = 'polar-grid-helper'
    // polarGridHelper.position.x = this.camera.position.x
    // polarGridHelper.position.z = this.camera.position.z
    // this.scene.add( polarGridHelper )

		// const grid: GridHelper = new GridHelper(1000, 40, 0x000000, 0x000000);
		// (grid.material as LineBasicMaterial).opacity = 0.2;
		// (grid.material as LineBasicMaterial).transparent = true;
    // grid.name = 'grid-helper'
		// this.scene.add( grid )
  } */
  
  addControl() {    
    // Note: Orbit control with right click, or two fingers is not possible, because it needs a center to rotate around, which we don't know.
    // FirstPerson is important, don't remove
    this.control = new FirstPerson(
      this.chipContainer,
      this.camera,
      {
        onMove: this.onPlayerRotate,
        onPan: this.onPlayerPan,
        game: this
      }
    )
  }

  /**
   * Orbit Control for Overview
   */
  addOrbitControl() {
    if (this.orbitContainer) {
      
      this.overviewContainer.style.display = 'none'
      this.overviewContainer.querySelectorAll('.js-navroom-overview-item')
        .forEach((item: Element) => {
          item.addEventListener('click', this.onClickNavRoomOverview.bind(this))
        })

      // Click on nav room overview items
      // _el.addEventListener('click', (evt) => {
      //   if (evt.target && (evt.target as HTMLElement).matches('.js-navroom-overview-item')) {
      //     const id: string | undefined = (evt.target as HTMLElement).dataset.roomId
      //     if (id !== undefined) {
      //       this.moveCameraToRoom(id)
      //     }
      //   }
      // })

      this.orbitContainer.style.display = 'none'
      this.orbit = new OrbitControls(this.camera, this.orbitContainer)
      this.orbit.maxPolarAngle = Math.PI * 0.5
      this.orbit.update()
      this.orbit.enabled = false;
      this.orbit.addEventListener('change', this.onOrbitControlChange.bind(this))
    }
  }

  activateOrbitControl(b: boolean) {
    if (b) {
      if (this.orbit) {
        this.orbit.update()
        this.orbit.enabled = true;
        this.orbitContainer.style.display = 'block'
        this.overviewContainer.style.display = 'block'
      }
    } else {
      if (this.orbit) {
        this.orbit.enabled = false;
        this.orbitContainer.style.display = 'none'
        this.overviewContainer.style.display = 'none'
      }
    }
  }

  onClickNavRoomOverview(evt: any) {
    // console.log(`Click nav room overview`, evt);
    if (evt.target && (evt.target as HTMLElement).matches('.js-navroom-overview-item')) {
      const id: string | undefined = (evt.target as HTMLElement).dataset.roomId
      if (id !== undefined) {
        this.moveCameraToRoom(id)
      }
    }
  }

  onOrbitControlChange() {
    this.updateNavRoomOverview()
    this.render()
  }

  initNavRoomOverview() {
    document.querySelectorAll('.js-navroom-overview-item').forEach((v: Element) => {
      const roomId: any = (<HTMLElement>v).dataset.roomId
      const obj3d: any = this.scene.getObjectByName('ROOM_' + roomId)
      if (roomId !== undefined && obj3d !== undefined) {
        this.aNavRoomOverview.push({ elNav: (<HTMLElement>v), obj3d: (<Object3D>obj3d) })
        gsap.set(v, {
          x: `${this.windowHalfW}px`,
          y: `${this.windowHalfH}px`,
          opacity: 0
        })
      }
    })
  }

  updateNavRoomOverview() {
    if (this.modeOverview) {
      this.camera.updateProjectionMatrix()
      let pos: Vector3 = new Vector3()
      for (let i = 0; i < this.aNavRoomOverview.length; i++) {
        const obj = this.aNavRoomOverview[i]
        obj.obj3d.getWorldPosition(pos)
        const vScreen: Vector3 = pos.project(this.camera)
        gsap.to(obj.elNav, {
          x: `${this.windowHalfW * (vScreen.x + 1)}px`,
          y: `${-this.windowHalfH * (vScreen.y - 1)}px`
        })
        gsap.to(obj.elNav, {
          delay: 0.05 * i,
          opacity: 1
        })
      }
    }
  }

	/**
	 * Updated by FirstPerson callback
   * @param rotY radians
   * @param rotX radians
	 */
	onPlayerRotate(leftNormalize: number, topNormalize: number) {
    
    if (this.modeOverview)
      return

    const rotY = leftNormalize * Math.PI
    const rotX = topNormalize * Math.PI

    const _finalRotX: number = MathUtils.clamp(this.camera.rotation.x + rotX, -1, 1)
    
    gsap.killTweensOf(this.oGsapLook)
    gsap.killTweensOf(this.camera.rotation)
    gsap.to(this.camera.rotation, {
      y: this.camera.rotation.y + rotY,
      x: _finalRotX,
      duration: 0.01 // This value can't be too high, otherwise the rotation is weird
    })
	}

  /**
   * Deplacement in the appartment
   * @param position 
   * @param wheel 
   * @param forward 
   */
  onPlayerPan(position: Vector3, wheel: boolean = false, forward: Boolean = true) {  

    if (this.modeOverview)
      return

    const _direction: Vector3 = position.clone().sub(this.camera.position).normalize()
    // if (!forward) _direction.negate()
    // console.log(`direction ${forward ? 'forward' : 'backward'}`, _direction)

    this.raycasterPlayer.set(this.camera.position, _direction)
    // console.log('RAY', this.raycasterPlayer.ray.direction)

    // this.raycasterPlayer.setFromCamera(_mouse, this.camera)
    // console.log('RAY from CAM', this.raycasterPlayer.ray.direction)

    // // Keep the direction straight forward
    // // this.raycasterPlayer.ray.direction.y = 0

    // if (!forward) {
    //   this.raycasterPlayer.ray.direction.applyEuler(new Euler(0, Math.PI, 0))
    //   console.log('RAY from BACK', this.raycasterPlayer.ray.direction)
    // }
    
    this.raycasterPlayer.intersectObjects(this.aCollisionMeshes, false, this.aIntersectsPlayer)

    // console.log(`PAN INTERSECT`, this.aIntersectsPlayer.length)
    // if (wheel) {
    //   var axes: AxesHelper = new AxesHelper(1)
    //   axes.position.copy(position).y = 1
    //   this.scene.add(axes)
    // }

    if (this.aIntersectsPlayer.length > 0) {
      const point: Vector3 = this.aIntersectsPlayer[0].point

      // Move mousehelper over the intersected surface
      // this.intersectHelper.position.copy( point )
      // console.log(`Intersection`, point)
      // console.log(`DISTANCE from intersection`, point.distanceTo(position))
      // console.log(`${point.distanceTo(position) / CAMERA_DISTANCE_FROM_PLAYER} times min DISTANCE from intersection`)

      // How many minimum distance from intersection
      if (point.distanceTo(position) / CAMERA_DISTANCE_FROM_PLAYER >= 1) {
        this.tweenCameraPosition(position)
      }
      
      // if (wheel) {
      //   var axes: AxesHelper = new AxesHelper(5)
      //   axes.position.copy(point)
      //   this.scene.add(axes)
      // }

      this.aIntersectsPlayer.length = 0

    } else {
      this.tweenCameraPosition(position)
    }

    // console.groupEnd()
  }

  // Tween Camera position
  tweenCameraPosition(position: Vector3) {
    gsap.killTweensOf(this.camera.position)
    gsap.to(this.camera.position, {
      y: CAMERA_Y,
      x: position.x,
      z: position.z,
      // duration: 0.01 
    })
  }
  
  /**
   * CREATE OBJECTS 
   */
  addObjects(aModels: Array<object>) {

    this.totalObjects = aModels.length
    this.loadedObjects = 0

    // Basic Texture Loader
    this.textureLoader = new TextureLoader()

    // KTX2 Loader
    this.ktx2Loader = new KTX2Loader()
    this.ktx2Loader.setTranscoderPath(window.theme_path + 'basis/')
    this.ktx2Loader.setResourcePath(window.theme_path + 'basis/')
    this.ktx2Loader.detectSupport(this.renderer)

    // BASIS Loader
    // this.basisLoader = new BasisTextureLoader()
    // this.basisLoader.setTranscoderPath(window.theme_path + 'basis/')
    // this.basisLoader.detectSupport(this.renderer)

    // let loader_fbx: FBXLoader
    let loader_gltf: GLTFLoader
    let loader_draco: DRACOLoader = new DRACOLoader()
    // loader_draco.setDecoderPath(window.theme_path + 'draco/')
    loader_draco.setDecoderPath('//www.gstatic.com/draco/versioned/decoders/1.4.1/')
    loader_draco.setDecoderConfig({type: 'js'})


    // const bMobile: boolean = window.matchMedia(`(max-width: 1025px)`).matches
    // console.log(`IS MOBILE ??? `, bMobile)

    aModels.forEach((obj: any) => {
      
      ObjectsModel.getInstance().add(obj as ObjectData)
      console.log(`Start Load ${obj.name}`, obj);

      // Load FBX
      /* if (obj.ext === 'fbx') {
        loader_fbx = new FBXLoader()
        loader_fbx.load(obj.path, (object) => {
          // console.log(`Loaded fbx`, object);
          this.onObjectLoaded(object, obj)
        })
      } else  */
      if (obj.ext === 'glb' || obj.ext === 'gltf') {
        // Load GLB
        loader_gltf = new GLTFLoader()

        // Used for gltf or glb loading ktx2 or basis textures
        loader_gltf.setKTX2Loader(this.ktx2Loader)

        if (obj.comp === 'draco') {
          loader_gltf.setDRACOLoader(loader_draco)
          // loader_gltf.setMeshoptDecoder(MeshoptDecoder)
        }

        loader_gltf.load(obj.path, (gltf) => {
          console.log(`Loaded ${obj.ext}`, gltf);

          // Materials
          if (obj.texture) {
            // console.log(`Load texture diffuse`, obj);
            
            // KTX2 textures
            if (obj.texture.indexOf('.ktx2') > -1) {
              obj.bakedMat = new MeshStandardMaterial();
              obj.bakedMat.map = this.ktx2Loader.load(obj.texture, (texture) => {
                // console.info( `ktx2 transcoded to ${this.ktx2FormatStrings[ texture.format ]}` )
                // obj.bakedMat.map = texture
                // gltf.scene.traverse((child) => {
                //   (child as THREE.Mesh).material = obj.bakedMat
                // })
              }, (evt) => { /* console.error('PROGRESS' ,evt) */ }, (error) => {console.error(`Error - ${obj.name}` ,error)})

            } else {

              // Other textures
              if (obj.roughness || obj.metalness) {
                obj.bakedMat = new MeshStandardMaterial();
              }
              else
                obj.bakedMat = new MeshBasicMaterial()

              // Classic texture (jpg, png)
              obj.bakedMat.map = this.textureLoader.load(obj.texture)
              obj.bakedMat.map.flipY = false
              obj.bakedMat.map.encoding = sRGBEncoding
              obj.bakedMat.reflectivity = 0
              // obj.bakedMat.map.minFilter = NearestFilter // LinearFilter // NearestMipmapNearestFilter 
              // obj.bakedMat.map.needsUpdate()
            }

            // This activate maps AO, reflections
            // obj.bakedMat.envMap = this.environmentTexture
            // obj.bakedMat.envMapIntensity = ENV_MAP_INTENSITY
            obj.bakedMat.wireframe = DEBUG_WIREFRAME
            obj.bakedMat.fog = false

            // Ambient not working actually, maybe because of light ? Importer un test d'ambient qui fonctionne dans exemples Threejs
            // Maybe because needs an envMap 
            if (obj.ao) {
              // console.log(`Load texture AO`);
              // Note: threejs uses Red channel of the texture for aoMap, Green channel for roughnessMap, Blue for metalnessMap
              // see: https://medium.com/@kfarr/experimenting-with-pbr-textures-and-a-frame-26c5a034b7b
              const map = this.textureLoader.load(obj.ao)
              map.flipY = false
              obj.bakedMat.aoMap = map
              obj.bakedMat.aoMapIntensity = obj.ao_intensity
              obj.bakedMat.roughnessMap = map
              obj.bakedMat.roughness = obj.rough_intensity
              obj.bakedMat.metalnessMap = map
              obj.bakedMat.metalness = obj.metal_intensity
            }

            if (obj.roughness) {
              // Note: threejs uses Red channel of the texture for aoMap, Green channel for roughnessMap, Blue for metalnessMap
              // see: https://medium.com/@kfarr/experimenting-with-pbr-textures-and-a-frame-26c5a034b7b
              const map = this.textureLoader.load(obj.roughness)
              map.flipY = false
              obj.bakedMat.roughness = obj.rough_intensity
              obj.bakedMat.roughnessMap = map
              // console.log(`Load texture Roughness`, obj.bakedMat);
            }

            if (obj.metalness) {
              // console.log(`Load texture Metalness`);
              // Note: threejs uses Red channel of the texture for aoMap, Green channel for roughnessMap, Blue for metalnessMap
              // see: https://medium.com/@kfarr/experimenting-with-pbr-textures-and-a-frame-26c5a034b7b
              const map = this.textureLoader.load(obj.metalness)
              map.flipY = false
              obj.bakedMat.metalness = obj.metal_intensity
              obj.bakedMat.metalnessMap = map
            }

            if (obj.bump) {
              // console.log(`Load texture Bump`, obj.bakedMat);
              const map = this.textureLoader.load(obj.bump)
              map.flipY = false
              obj.bakedMat.bump = obj.bump_scale
              obj.bakedMat.bumpMap = map
            }

            if (obj.alpha) {
              // console.log(`Load texture Alpha`, obj.bakedMat);
              obj.bakedMat.transparent = true
              const map = this.textureLoader.load(obj.alpha)
              map.flipY = false
              obj.bakedMat.alphaMap = map
            }
          }
          this.onObjectLoaded(gltf.scene, obj)
        }, () => {}, (event) => {
          console.error(`Error load glb ${obj.path}`, event)
        })
      } else {
        console.warn(`Extension not handled ! ${obj.ext},  id: ${obj.id},  name: ${obj.name}`)
      }
    });
  }

  // Object loaded 
  onObjectLoaded(loaded3d: Object3D, objData: ObjectData) {
    let _scale: Array<number> = [1, 1, 1]
    let _position: Array<number> = [0, 0, 0]
    let _isOneMeshGroup: boolean

    const a:any = objData.path.split('/')
    // console.log(`%cObject ${objData.id} (${a[a.length - 1]}) is loaded, now traverse it`, 'font-weight:bold;', loaded3d);
    
    // SCALE AND POSITION OBJECT
    let _obj3d: Object3D
    // Check if it is a 'placed in Blender'
    // It should be merged and in a container at position 0,0,0
    if (loaded3d.children.length === 1
        /* && objData.position[0] === 0
        && objData.position[1] === 0
        && objData.position[2] === 0 */) {
          
        _obj3d = loaded3d.children[0]
        _scale = [_obj3d.scale.x,
                  _obj3d.scale.y,
                  _obj3d.scale.z]
        _position = [_obj3d.position.x,
                    _obj3d.position.y,
                    -_obj3d.position.z]
        
        _isOneMeshGroup = true
        // Give the group the name of the object
        loaded3d.name = _obj3d.name
         
    } else {
      // or the 3d placed with backoffice
      _obj3d = loaded3d
      // _scale = objData.scale
      // _position = objData.position
      objData.object3D = loaded3d
    }
    
    objData.object3D = _obj3d

    if (objData.category === ObjectData.CATEGORY_PRODUCT) {
      // Give the object the id from json
      _obj3d.name = `${objData.id}`

      // Set product id
      _obj3d.userData.productId = objData.id
    }

    _obj3d.scale.set(
      _scale[0] * SCALE_SCENE_FACTOR, 
      _scale[1] * SCALE_SCENE_FACTOR, 
      _scale[2] * SCALE_SCENE_FACTOR
      )
      
    _obj3d.position.set(
      _position[0] * SCALE_SCENE_FACTOR, 
      _position[1] * SCALE_SCENE_FACTOR,
      _position[2] * -SCALE_SCENE_FACTOR
      )
    
    // Add object to scene
    this.scene.add(_obj3d)

    // TRAVERSE LOADED OBJECT
    loaded3d.traverse((child) => {
      if ((<Mesh>child).isMesh) {

        this.prepareMeshObject(<Mesh>child, objData)

      } else if ((<Group>child).isGroup) {
        // console.log(`%cGroup`, 'background:#fce5ba', (<Group>child).name, child);

        console.log(objData.name +" > "+ objData.sub_cat);

        // Note: si un seul mesh est exporté de Blender, il est chargé en tant que Group
        if (objData.category === ObjectData.CATEGORY_PRODUCT) {
          // TV Video
          if(objData.sub_cat && objData.sub_cat === 'tv') {
            const _meshVideo: Mesh = _obj3d.getObjectByName('video') as Mesh
            if(_meshVideo) {
              this.aVideosIn3D.push({
                obj3D: _obj3d,
                meshTV: _meshVideo,
                name: objData.name,
                file: window.products_videos[objData.id].video,
                poster: window.products_videos[objData.id].poster
              })
              console.log(`VIDEO IN TV`, window.products_videos[objData.id])
            } else {
              console.warn(`TV has no mesh 'video'`, objData.name, objData)
            }
          }

          this.addBoundingBox(_obj3d)
        } else if (_isOneMeshGroup) {
          // console.log(`%cGroup  ${objData.object3D.name}`, 'background:#fce5ba', 'is a unique Mesh', this.scene.getObjectByName(objData.object3D.name) );
          // Because blender export a unique mesh as a group, but you need to get the Mesh with getObjectByName
          this.prepareMeshObject(this.scene.getObjectByName(objData.object3D.name) as Mesh, objData)
        }
      }
    })
    
    this.addChip(objData)

    this.loadedObjects++
    console.log(`loaded objects ${this.loadedObjects}/${this.totalObjects} | ${objData.name}`)

    this.prepareLoader.innerHTML = `${this.loadedObjects}/${this.totalObjects}`
    this.onProgressLoader(this.loadedObjects / this.totalObjects)

    if (this.loadedObjects === this.totalObjects)
      this.onAllObjectsLoaded()
  }

  onProgressLoader(e: any) { 
    this.elLoaderProgress.style.width = `${(e || 0) * 100}%` 
    this.elLoaderPercent.innerHTML = `${Math.round((e || 0) * 100)}%`
  }

  prepareMeshObject(m: Mesh, objData: ObjectData) {
    // console.log(`%cMesh`, 'background:#00ffff', m.name)
    m.userData.productId = `${objData.id}`

    if (objData.bakedMat) {
      // console.log(`Apply baked texture to ${m.name}`);  
      if (objData.ao) {
        // console.log(`%c--------->Create AO second set of UV`, 'color:#ff00ff')
        m.geometry.setAttribute('uv2', new BufferAttribute(m.geometry.attributes.uv.array, 2));
      }

      m.material = objData.bakedMat
      m.material.alphaTest = 0.7
      m.material.depthWrite = true
      
      // Note: The material need to be MeshStandardMaterial to receive shadow, 
      // BUT if the material receive shadow, it receives light also... the material will be too bright...
      if (m.name.indexOf('plafond') > -1 && m.name.indexOf('murs') > -1) {
        m.receiveShadow = false
        m.castShadow = false
      } else
        m.receiveShadow = true
      
      // console.log(`Baked material`, m.material);  
      
    } else if (m.material) {
      // Make object transparent if its opacity < 1
      (m.material as MeshBasicMaterial).transparent = (m.material as MeshBasicMaterial).opacity < 1;

      if (objData.category === ObjectData.CATEGORY_PRODUCT) {
        // m.castShadow = true 
        m.receiveShadow = true
      }
    }
      
    if (m.material instanceof MeshStandardMaterial) {
      m.material.envMapIntensity = ENV_MAP_INTENSITY
      m.material.needsUpdate = true
    }
    
    // Mirror
    if (m.name.indexOf('mirror') === 0) {
      // console.log(`Found a mirror`, m)
      // Global scale before creating mirror
      const pos: Vector3 = m.position.multiplyScalar(SCALE_SCENE_FACTOR)
      const sc: Vector3 = m.scale.multiplyScalar(SCALE_SCENE_FACTOR)

      const geo: BufferGeometry = new BufferGeometry()
      geo.copy(m.geometry)// .scale(SCALE_SCENE_FACTOR, SCALE_SCENE_FACTOR, SCALE_SCENE_FACTOR)
      const mirror: Reflector = new Reflector(geo, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: new Color(0x889999)
      })

      mirror.position.copy(pos)
      mirror.scale.set(sc.x, sc.z, sc.y)
      mirror.rotation.copy(m.rotation)
      mirror.name = m.name + '_reflector'
      
      this.scene.add(mirror)

      // Clear mirror from blender
      m.geometry.dispose()
      m.material[0] = null
      m.clear()
      this.scene.remove(m)
    }

    // Collision walls and room floors
    // Positions and Lookat markers
    if (m.name.indexOf('collision') === 0 
      || m.name.indexOf('POSITION') === 0
      || m.name.indexOf('LOOKAT') === 0) {
      (m.material as MeshBasicMaterial).transparent = true;
      (m.material as MeshBasicMaterial).opacity = 0.0;
      (m.material as MeshBasicMaterial).depthWrite = false
      m.receiveShadow = false
      m.castShadow = false
      // console.log(`Hide collisions for ${m.name}`)
    }

    // Only for decor
    if (objData.category === ObjectData.CATEGORY_DECOR) {
      if (objData.collision) {
        this.aCollisionMeshes.push(m)
        objData.mesh = m
      } else if (objData.clickable) {
        this.aClickableMeshes.push(m)
        objData.mesh = m
      }
    }
  }
  
  onAllObjectsLoaded() {
    // this.updateAllMaterials()
    this.callbackCompleteLoader()
    this.initNavRoomOverview()
    this.moveCameraToRoom('START')
    this.initSoundButton()
  }

  playSounds() {
    if (this.bSoundInVideoInited === false) {
      this.bSoundInVideoInited = true      
      // BUG: Why cant remove listener ???
      // @ts-ignore 
      window.removeEventListener('click', this.playSounds.bind(this))
      
      this.audioPlayer.playSound()

      console.log('Create videos ----', this.aVideosIn3D.length)
      // Videos in 3D
      for (let i = 0; i < this.aVideosIn3D.length; i++) {
        const videoIn3D = this.aVideosIn3D[i]
        const createvideo = new CreateVideo(videoIn3D.file, videoIn3D.poster, videoIn3D.name)
        videoIn3D.obj3D.userData.elVideo = createvideo.elVideo
        videoIn3D.obj3D.userData.videoName = createvideo.name
        videoIn3D.obj3D.userData.videoVolume = 0
        const videoTex = new VideoTexture(videoIn3D.obj3D.userData.elVideo)
        const mVideo = new MeshBasicMaterial({ map: videoTex })
        videoIn3D.meshTV.material = mVideo
        this.audioPlayer.addAudioFromVideo(videoIn3D.obj3D.userData.elVideo, videoIn3D.name)
      }
    }
  }

  initSoundButton() {
    if (!this.audioPlayer) {
      // Audio
      this.audioPlayer = new AudioPlayer()
      this.audioPlayer.init()
      
      if(ENABLE_SOUND)
        window.addEventListener('click', this.playSounds.bind(this))
    }
  }

  addBoundingBox(_obj3d: Object3D) {
    const box = new Box3().setFromObject(_obj3d)
    const boxSize = box.getSize(new Vector3())
    // const boxCenter = box.getCenter(new Vector3());

    const geo = new BoxBufferGeometry(boxSize.x, boxSize.y, boxSize.z, 1, 1, 1)

    const mesh = new Mesh(geo, this.meshBoundingBoxMat)
    mesh.position.copy(_obj3d.position)
    mesh.userData.productId = _obj3d.userData.productId

    this.aCollisionMeshes.push(mesh)
    
    this.scene.add( mesh )
  }


  /**
   * CREATE CHIPS
   */
  addChip(obj: ObjectData) {
    if (obj.hasOwnProperty('chip')) {
      const chip = new Chip(this.chipContainer, obj, window.products_rec_sessions[obj.id] !== undefined)
      this.aChips.push(chip)
      this.nbChips = this.aChips.length
      this.updateChip(chip, chip.objData.object3D.position.clone())
    }
  }

  updateChips() {
    if (!this.modeOverview) {
      let chip: Chip
      this.camera.updateProjectionMatrix() // needed for project(this.camera)
  
      for(let i = 0; i < this.nbChips; ++i) {
        chip = this.aChips[i]
        if (chip.objData.object3D) {
          this.updateChip(chip, chip.objData.object3D.position.clone())
        }
      }
    }
  }

  updateChip(chip: Chip, objPosition: Vector3) {
    // Position chip 
    const chipPosition: Vector3 = objPosition.clone().add(chip.objData.chipVector)
    // console.log(`Update chip raycaster for`, chip.objData.object3D.userData)

    // Project to screen 2d
    objPosition.project(this.camera)
    chipPosition.project(this.camera)

    // Empty intersections
    this.aIntersectsChip.length = 0

    this.raycasterChip.setFromCamera({x: objPosition.x, y: objPosition.y}, this.camera)
    // const a = this.raycasterChip.intersectObjects(this.aCollisionMeshes, false) // for debug, otherwise the array is emptied
    this.raycasterChip.intersectObjects(this.aCollisionMeshes, false, this.aIntersectsChip)

    if (this.aIntersectsChip.length > 0) {

      // Object is visible, show chip
      if (this.aIntersectsChip[0].object.userData.productId === chip.objData.id) {
        // Scale
        // const distance: number = this.aIntersectsChip[0].distance
        // gsap.to(chip.el, {duration: 0.5, transformOrigin:'center', transform:`scale(${objPosition.z}%)`})
        // gsap.to(chip.elInside, {duration: 0.01, scale: 22 / distance})

        // Position
        // gsap.killTweensOf(chip.el)
        gsap.to(chip.el, {
          duration: 0.0,
          autoAlpha: 1,
          x: `${this.windowHalfW * (chipPosition.x + 1)}px`,
          y: `${-this.windowHalfH * (chipPosition.y - 1)}px`
        })

        // Play video
        if (chip.objData.object3D.userData.elVideo) {
          const videoDistance: number = chip.objData.object3D.position.distanceTo(this.camera.position) - CAMERA_DISTANCE_FROM_PLAYER - VOLUME_VIDEO_DISTANCE_GAP 
          let volumeOverDistance: number = (1 - (videoDistance / VOLUME_VIDEO_DISTANCE_MAX)) * VOLUME_DEFAULT
          if (volumeOverDistance > VOLUME_DEFAULT) volumeOverDistance = VOLUME_DEFAULT
          else if (volumeOverDistance < 0) volumeOverDistance = 0
          if (chip.objData.object3D.userData.elVideo.paused) {
            // console.log(`Play video of ${chip.objData.name}`)
            let playPromise = chip.objData.object3D.userData.elVideo.play()
            playPromise.then(() => {
              chip.objData.object3D.userData.videoIsPlaying = true
            })
          }
          if (chip.objData.object3D.userData.videoVolume !== volumeOverDistance) {
            chip.objData.object3D.userData.videoVolume = volumeOverDistance
            // chip.objData.object3D.userData.elVideo.volume = volumeOverDistance // old way, now using Web Audio API
            this.audioPlayer.setVolumeForVideo(chip.objData.object3D.userData.videoName, volumeOverDistance)
          }
        }
        
      } else {
        // Hide chip
        this.hideChip(chip.el)

        // Pause video
        if (chip.objData.object3D.userData.elVideo && !chip.objData.object3D.userData.elVideo.paused) {
          // console.log(`Pause video of ${chip.objData.name}`)
          if (chip.objData.object3D.userData.videoIsPlaying)
            chip.objData.object3D.userData.elVideo.pause()
          chip.objData.object3D.userData.videoVolume = 0
          this.audioPlayer.setVolumeForVideo(chip.objData.object3D.userData.videoName, 0)
        }
      }
    } else {
      // Hide chip
      this.hideChip(chip.el)

      // Pause video
      if (chip.objData.object3D.userData.elVideo && !chip.objData.object3D.userData.elVideo.paused) {
        // console.log(`Pause video of ${chip.objData.name}`)
        if (chip.objData.object3D.userData.videoIsPlaying)
          chip.objData.object3D.userData.elVideo.pause()
        chip.objData.object3D.userData.videoVolume = 0
        this.audioPlayer.setVolumeForVideo(chip.objData.object3D.userData.videoName, 0)
      }
    }
  }
  
  hideChip(el: HTMLElement) {
    gsap.killTweensOf(el)
    gsap.to(el, {
      duration: 0.2, 
      autoAlpha: 0
    })
  }

  showChipsContainer(b: boolean) {
    // this.chipContainer.style.display = 'none' // Chip container is used for mouse events
    gsap.to(this.chipContainer, {opacity: b ? 1 : 0})
  }

  /**
   * Move Camera to target when click in appart
   */
  // https://kevanstannard.github.io/three-experiments/
  // https://stackoverflow.com/questions/36385478/angle-of-face-to-camera-three-js

  moveCameraToTarget() {

    var targetPosition: Vector3 = new Vector3().copy(this.intersection.point)
    targetPosition.y = CAMERA_Y
    var cameraPosition: Vector3 = new Vector3().copy(this.camera.position)
    cameraPosition.y = CAMERA_Y

    var dirToCamera: Vector3 = this.camera.position.clone().sub(targetPosition)
    dirToCamera.normalize()

    // var axes: AxesHelper = new AxesHelper()
    // axes.position.copy(dirToCamera)
    // this.scene.add(axes)

    // Get the angle from target position minus camera position
    const targetPositionOffsetFromCamera: Vector3 = 
      new Vector3().copy(this.intersection.point).sub(this.camera.position.clone())

    let angleToTarget = Math.atan2(targetPositionOffsetFromCamera.x, targetPositionOffsetFromCamera.z)

    // Invert direction
    angleToTarget -=  Math.PI
    
    // We round it, because rotation.y returns precision 0.0001 rad
    angleToTarget = Math.round(angleToTarget * 10000) / 10000

    const shortestAngle = this.getShortestAngleInRadians(MathUtils.radToDeg(this.camera.rotation.y), MathUtils.radToDeg(angleToTarget))

    // Rotation
    gsap.killTweensOf(this.camera.rotation)
    gsap.to(this.camera.rotation, {
      y: this.camera.rotation.y + shortestAngle,
      duration: 2
    })
    
    // Position
    const _new: Vector3 = new Vector3(0, 0, 0);
    _new.subVectors(cameraPosition, targetPosition).setLength(CAMERA_DISTANCE_FROM_PLAYER).add(targetPosition);
    
    // We say 0.5s for 10 units
    let _t: number = 0.5 * targetPosition.distanceTo(cameraPosition) / 10
    let _ease: string = 'power2.out'
    let _delay: number = 0

    // Comes from overview
    if(this.modeOverview) {
      _t = 2
      _ease = 'power1.out'
      _delay = 0
    } 

    this.bMoveCameraToTarget = true
    
    gsap.killTweensOf(this.camera.position)
    gsap.to(this.camera.position, {
      x: _new.x,
      y: _new.y,
      z: _new.z,
      duration: _t,
      delay: _delay,
      ease: _ease,
      onComplete: () => {
        this.bMoveCameraToTarget = false
      }
    })

    if (this.modeOverview) {
      this.showChipsContainer(true)
      gsap.to(this.camera.rotation, {
        x: 0,
        duration: 1,
        delay: 1.15,
        ease: 'power2.inOut'
      })
    }
  }

  /**
   * Move Camera by Room
   * @param roomId 
   */
  moveCameraToRoom(roomId: string) {
    if (this.bMoveCameraToTarget)
      if (this.modeOverview || this.modeComeFromOverview)
        return false

    const objPos: Object3D | undefined = this.scene.getObjectByName(`POSITION_${roomId}`)
    const objLookat: Object3D | undefined = this.scene.getObjectByName(`LOOKAT_${roomId}`)
    
    if (objPos && objLookat) {
      const pos: Vector3 = objPos.position.clone().divideScalar(1 / SCALE_SCENE_FACTOR)
      if (roomId !== 'OVERVIEW') {
        pos.y = CAMERA_Y
        this.modeComeFromOverview = this.modeOverview
        this.modeOverview = false
        this.activateOrbitControl(false)
        this.showChipsContainer(true)
      } else {
        this.control.enabled = false
        this.scene.background = new Color(0xffffff)
        this.showCeiling(false)
        this.showPanoramic(false)
        this.showChipsContainer(false)
        this.modeComeFromOverview = false
        this.modeOverview = true
      }
      const lookat: Vector3 = objLookat.position.clone().divideScalar(1 / SCALE_SCENE_FACTOR)
      lookat.y = CAMERA_Y
      this.moveAndLookAt(pos, lookat)
    }
  }

  /**
   * @param dstpos move to this position
   * @param dstlookat and lookat this position
   */
  moveAndLookAt(dstpos: Vector3, dstlookat: Vector3) {

    this.bMoveCameraToTarget = true

    /**
     * Position
     *  */ 
    var origpos = new Vector3().copy(this.camera.position) // original position
    var origrot = new Euler().copy(this.camera.rotation) // original rotation
  
    this.camera.position.set(dstpos.x, dstpos.y, dstpos.z)
    this.camera.lookAt(dstlookat)
    var dstrot = new Euler().copy(this.camera.rotation)
  
    // reset original position and rotation
    this.camera.position.set(origpos.x, origpos.y, origpos.z)
    this.camera.rotation.set(origrot.x, origrot.y, origrot.z)

    // We say 0.5s for 10 units
    let _t: number = 0.5 * this.camera.position.distanceTo(dstpos) / 10
    let _ease: string = 'power3.out'
    let _delay: number = 0

    if (this.modeOverview) {
      _t = 3
      _ease = 'power1.inOut'
      _delay = .1
    } else if(this.modeComeFromOverview) {
      _t = 2
      _ease = 'power1.out'
      _delay = 0
    } 

    gsap.killTweensOf(this.camera.position)
    gsap.to(this.camera.position, {
      x: dstpos.x,
      y: dstpos.y,
      z: dstpos.z,
      duration: _t,
      delay: _delay,
      ease: _ease,
      onComplete: () => {
        this.bMoveCameraToTarget = false
        if (this.modeOverview) {
          this.activateOrbitControl(true)
        }
        if (this.modeComeFromOverview) {
          this.control.enabled = true
          // this.scene.background = this.backgroundTexture
          this.showCeiling(true)
          this.showPanoramic(true)
        }
      }
    })
  
    /**
     * Rotation (using slerp)
     *  */ 
    var qa: Quaternion = qa = new Quaternion().copy(this.camera.quaternion) // src quaternion
    var qb: Quaternion = new Quaternion().setFromEuler(dstrot) // dst quaternion
    var qm = new Quaternion()
    // this.camera.quaternion = qm

    if (this.modeOverview) {
      _t = 1
      _ease = 'power1.inOut'
      _delay = 0
    } else if(this.modeComeFromOverview) {
      _t = 1.5
      _ease = 'power1.inOut'
      _delay = 1
    } 
    
    gsap.killTweensOf(this.oGsapLook)
    this.oGsapLook = {t: 0}
    gsap.to(this.oGsapLook, {
      t: 1, 
      duration: _t,
      delay: _delay,
      ease: _ease,
      onUpdate: () => {
        // this.camera.lookAt(dstlookat)
        Quaternion.slerp(qa, qb, qm, this.oGsapLook.t) // Get the quaternion from qa and qb into qm
        this.camera.quaternion.set(qm.x, qm.y, qm.z, qm.w)
      }
    })
  }

  // Return degree
  getShortestAngle(from: number, to: number): number {
    // console.log(`Shortest angle from ${from} to ${to}`)
    const diff = ( to - from + 180 ) % 360 - 180
    return diff < -180 ? diff + 360 : diff
  }
  getShortestAngleInRadians(from: number, to: number): number {
    return MathUtils.degToRad(this.getShortestAngle(from, to))
  }

  /**
   * Show Ceiling
   */
  showCeiling(b: boolean) {
    const objCeiling: Object3D | undefined = this.scene.getObjectByName('ceiling')
    if (objCeiling) {
      objCeiling.visible = b
    } else {
      console.warn(`There is no object named 'ceiling'`)
    }
  }
  /**
   * Show Panoramic
   */
  showPanoramic(b: boolean) {
    const objPanoramic: Object3D | undefined = this.scene.getObjectByName('panoramique')
    if (objPanoramic) {
      objPanoramic.visible = b
    } else {
      console.warn(`There is no object named 'panoramique'`)
    }
  }

  /***
   * Pointer Events
   */
  onContextMenu(e: MouseEvent) {
    e.preventDefault()
    // console.log(`onContextMenu`, e)
  }

  onPointerDown(e: any) {
    if (e.button === 0) {
      // if button is left click
      this.bMouseDown = true
      this.bMouseDownMoved = false
      this.pointerDownX = parseInt(e.clientX, 10)
      this.pointerDownY = parseInt(e.clientY, 10)
    } else {
      // right click, should Pan
      this.bMouseRightDown = true
      // this.bMouseRightDownMoved = false
    }
  }

  /**
   * Utils throttle
   * https://decipher.dev/30-seconds-of-typescript/docs/throttle/
   * @param fn 
   * @param wait 
   * @returns 
   */
  throttle = (fn: Function, wait: number = 200) => {
    let inThrottle: boolean,
      lastFn: ReturnType<typeof setTimeout>,
      lastTime: number;
    return function (this: any) {
      const context = this,
        args = arguments
      if (!inThrottle) {
        fn.apply(context, args)
        lastTime = Date.now()
        inThrottle = true
      } else {
        clearTimeout(lastFn)
        lastFn = setTimeout(() => {
          if (Date.now() - lastTime >= wait) {
            fn.apply(context, args)
            lastTime = Date.now()
          }
        }, Math.max(wait - (Date.now() - lastTime), 0))
      }
    }
  }

  onPointerMove(e :PointerEvent) {
    // console.log(`POINTER MOVE !`,e );
    if (e.isPrimary) {
      // this.debug(`POINTER MOVE, ${e.clientX}x${e.clientY}`)

      this.checkMouseMoveIntersection(e.clientX, e.clientY)

      if (/* !this.bMouseDownMoved &&  */this.bMouseDown) {
        this.bMouseDownMoved = true
      }
    }
  }

  onPointerUp(e: any) {
    // console.log(`pointer up`, e)
    // console.log(`POINTER UP`, `mouse down moved : ${this.bMouseDownMoved}`)

    if (!this.modeOverview) {
      // Skip moveCameraToTarget if is a chip
      if (e.path && (e.path[0].classList.contains('chip') || e.path[0].classList.contains('chip-rec'))) {
        this.bMouseDownMoved = false
        this.bMouseDown = false
        this.bMouseRightDown = false
        // this.bMouseRightDownMoved = false
        return
      }

      // Rework this, because on some mobile pointermove is dispatched while not really moving, ex: 0.000000 -> 0.000001
      // So we check if movement is more than 2 pixels
      this.bMouseDownMoved = Math.abs(this.pointerDownX - e.clientX) > 2 || Math.abs(this.pointerDownY - e.clientY) > 2
      // this.debug(`POINTER UP, moved: ${this.bMouseDownMoved}`)
  
      if (this.bMouseDownMoved === false && this.bMouseRightDown !== true && this.control.isPanning === false) {
        if (this.intersection.isHistory) {
          this.intersection.isHistory = false
          window.popbox.open('modal-history')
        } else {
          this.checkMouseIntersection(e.clientX, e.clientY)
          if ( this.intersection.intersects ) this.moveCameraToTarget()
        }
      }
  
      this.bMouseDownMoved = false
      this.bMouseDown = false
      // this.bMouseRightDownMoved = false
      this.bMouseRightDown = false
    }
  }

  /**
   * Mouse Move Intersection
   */
   checkMouseMoveIntersection(x: number, y: number) {
    const _mouse :any = {
      x: (x / this.windowW) * 2 - 1,
      y: -(y / this.windowH) * 2 + 1
    }
    
    this.raycasterClickable.setFromCamera(_mouse, this.camera)
    this.raycasterClickable.intersectObjects(this.aClickableMeshes, false, this.aIntersectsClickable)

    if (this.aIntersectsClickable.length > 0) {

      const _intersected = this.aIntersectsClickable[0]

      // Move mousehelper over the intersected surface
      // this.intersectHelper.position.copy( _intersected.point )
      this.chipContainer.style.cursor = 'pointer'

      // Prevent move to position
      // this.bMouseDownMoved = false
      // this.bMouseDown = false
      // this.bMouseRightDown = false

      // Store intersection point
      // this.intersection.point.copy( _intersected.point)
      // this.intersection.quaternion.copy( _intersected.object.quaternion )
      // this.intersection.intersects = true
      // this.intersection.object = _intersected.object
      this.intersection.isHistory = true

      this.aIntersectsClickable.length = 0

    } else {
      this.intersection.isHistory = false
      this.intersection.intersects = false
      this.chipContainer.style.cursor = 'default'
    }
  }

  /**
   * Intersection
   */
  checkMouseIntersection(x: number, y: number) {
    const _mouse :any = {
      x: (x / this.windowW) * 2 - 1,
      y: -(y / this.windowH) * 2 + 1
    }
    
    this.raycasterPlayer.setFromCamera(_mouse, this.camera)
    this.raycasterPlayer.intersectObjects(this.aCollisionMeshes, false, this.aIntersectsPlayer)

    if (this.aIntersectsPlayer.length > 0) {

      const _intersected = this.aIntersectsPlayer[0]

      // Move mousehelper over the intersected surface
      // this.intersectHelper.position.copy( _intersected.point )
      // console.log(`Intersection`, _intersected)

      // Store intersection point
      this.intersection.point.copy( _intersected.point)
      this.intersection.quaternion.copy( _intersected.object.quaternion )
      this.intersection.intersects = true
      this.intersection.object = _intersected.object

      this.aIntersectsPlayer.length = 0

    } else {
      this.intersection.intersects = false
    }
  }

  /**
   * Animate 
   */
  // TODO: Optimize: only render when needed, ex: mousemove, mousewheel, OrbitControl change event ...
  animate() {
		// const dt = this.clock.getDelta()
    this.render()
    
    // Note: Change FPS to 60
    setTimeout(() => {
      // if (this.bMouseDownMoved || this.bMoveCameraToTarget) {
        this.updateChips()
      // }
      // // Note: Comment stats for prod
      // if (this.stats !== undefined) this.stats.update()
      requestAnimationFrame(() => {this.animate()})
    }, 1000 / 60 )
  }

  onWindowResize() {
    this.windowW = window.innerWidth
    this.windowH = window.innerHeight
    this.windowHalfW = this.windowW * 0.5
    this.windowHalfH = this.windowH * 0.5
    this.camera.aspect = this.windowW /  this.windowH
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.windowW,  this.windowH)
    this.render()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
  
  addStats() {
    this.stats = Stats()
    this.stats.dom.classList.add('stats')
    document.body.appendChild(this.stats.dom)
  }

  // debug(s: any) {
  //   this.debugOutput.innerHTML += `${s}<br/>`
  // }

  addGUI() {
    if (DEBUG_GUI) {
      this.gui = new GUI({closed: DEBUG_GUI_CLOSED})

      const cameraFolder = this.gui.addFolder("Camera")
      const cameraFolderPosition = cameraFolder.addFolder('position')
      cameraFolderPosition.add(this.camera.position, "x", 0, 100, 0.1)
      cameraFolderPosition.add(this.camera.position, "y", 0, 100, 0.1)
      cameraFolderPosition.add(this.camera.position, "z", 0, 100, 0.1)
      this.guiCamRotX = cameraFolder.add(this.camera.rotation, "x", -Math.PI / 2, Math.PI / 2, Math.PI / 180)
        .name('rot X')
        .onChange((rad) => {
          this.guiCamRotX.name(`rot X (${MathUtils.radToDeg(rad)}°)`)
        });
      // this.guiCamRotY = cameraFolder.add(this.camera.rotation, "y", -Math.PI * 2, Math.PI * 2, Math.PI / 180)
      //   .name('rot Y')
      //   .onChange((rad) => {
      //     console.log(`ROTATION Y CHANGED  ${MathUtils.radToDeg(rad)}°`)      
      //     this.guiCamRotY.name(`rot Y (${MathUtils.radToDeg(rad)}°)`)
      //   });
      // cameraFolder.open()
    }
  }
}