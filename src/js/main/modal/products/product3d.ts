import { AmbientLight, Box3, Color, CubeTexture, CubeTextureLoader, HemisphereLight, MathUtils, Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Scene, sRGBEncoding, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import ObjectsModel from '../../../exp/model/ObjectsModel'
import { CAMERA_FOV, lg, DEBUG_GUI, DEBUG_GUI_CLOSED } from '../../../const'
import { ObjectData } from '../../../exp/objects/ObjectData'
import { GUI, GUIController } from 'three/examples/jsm/libs/dat.gui.module'
import gsap from 'gsap'

export default class Product3d {
  private scene: Scene
  private camera: PerspectiveCamera
  private renderer: WebGLRenderer
  private product: Mesh
  private orbit: OrbitControls
  private light_point: PointLight
  private light_point2: PointLight
  private canvasContainer: HTMLElement
  private canvasRect: DOMRect
  private oGsapScale: any = {t: 0}
  private envMapTexture: CubeTexture

  private gui: GUI

  // Singleton
  private static instance: Product3d

  public static getInstance(): Product3d {
    if (!Product3d.instance) {
        Product3d.instance = new Product3d()
    }
    return Product3d.instance
}

  /**
   * We create a canvas that we move to the current opened product3d container
   * Product3d will work like a singleton
   * // TODO: Free memory : https://threejsfundamentals.org/threejs/lessons/threejs-cleanup.html 
   */
  constructor() {}

  start(productId: string, canvasContainer: HTMLElement) {   
    // console.log(`Prodcut3d start`, productId );
     
    this.canvasContainer = canvasContainer
    this.canvasRect = this.canvasContainer.getBoundingClientRect()    

    // Create the scene only once and reuse it throughout the popups
    if (this.scene === undefined) {
      // Scene
      this.scene = new Scene()
      const loader = new CubeTextureLoader()
      loader.setPath( window.theme_path + 'img/' )
  
      // let textureCube: CubeTexture = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] )
      this.envMapTexture = loader.load( [ 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg', 'nx-fef8e7.jpg' ] )
      // this.envMapTexture = loader.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
      this.envMapTexture.encoding = sRGBEncoding
  
      this.scene.environment = this.envMapTexture
      // this.scene.background = new Color( 0x303030 )
      // this.scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 )
      
      // CAMERA
      this.camera = new PerspectiveCamera(CAMERA_FOV, this.canvasRect.width / this.canvasRect.height, 0.1, 1000)
      this.camera.position.set(0, 0, 0)
      this.camera.name = 'product-camera'
      
      // RENDERER
      this.renderer = new WebGLRenderer( { alpha: true, antialias: true, logarithmicDepthBuffer: true } )
      this.renderer.setPixelRatio( window.devicePixelRatio )
      this.renderer.setSize(this.canvasRect.width, this.canvasRect.height)
      this.renderer.setClearColor(0x000000, 0)
      this.renderer.outputEncoding = sRGBEncoding
      this.renderer.physicallyCorrectLights = true
      // this.renderer.toneMapping = ACESFilmicToneMapping
      this.canvasContainer.appendChild(this.renderer.domElement)
  
      this.addGUI()
      this.addLights()
      
      // const axesHelper = new AxesHelper(100)
      // axesHelper.name = 'axes-helper'
      // this.scene.add(axesHelper)

      // Orbit control
      this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
      this.orbit.minDistance = 5
      this.orbit.maxDistance = 100
      this.orbit.update()
      this.orbit.addEventListener('change', this.onControlChange.bind(this))

      if (DEBUG_GUI || window.is_preview) {
        const orbitMinMax = this.gui.addFolder('Zoom prod 3D')
        orbitMinMax.add(this.orbit, 'minDistance')
        orbitMinMax.add(this.orbit, 'maxDistance')
      }
      
      // Note: Debug
      window.currentProductUpdate = this.onControlChange.bind(this)
    } 
    
    this.renderer.setSize(this.canvasRect.width, this.canvasRect.height)
    this.canvasContainer.appendChild(this.renderer.domElement)

    this.camera.position.set(0, 0, -10)
    this.camera.lookAt(new Vector3(0, 0, 0))

    let obj: ObjectData = ObjectsModel.getInstance().getObjectById(productId.substr(14))
    this.showObject(obj)
    
      // Note: Debug
    window.currentProduct = this.product

    this.onWindowResize()
    this.orbit.minDistance = obj.zoom_min
    this.orbit.maxDistance = obj.zoom_max
    this.orbit.update()
    this.onControlChange()
    // this.animate()
  }

  onControlChange() {
    this.light_point.position.copy(this.camera.position).add(new Vector3(-20, 0, 0))
    this.light_point2.position.copy(this.camera.position).add(new Vector3(20, 0, 0))
    this.render()
  }

  stop() {
    console.log(`Prodcut3d stop`)
    gsap.killTweensOf(this.product.rotation)
    gsap.killTweensOf(this.oGsapScale)

    // Product object is a copy of the appart object, just dispose the copy
    this.scene.remove(this.product)
    this.product.clear()

    this.orbit.enabled = false
  }

  addLights() {
    // LIGHTS
		const light_hemisphere = new HemisphereLight() // Cast no shadows
    light_hemisphere.intensity = 1
		light_hemisphere.position.set( 0, 0, -30 )
    light_hemisphere.groundColor = new Color(0xffffff)
    light_hemisphere.color = new Color(0xffffff)
    light_hemisphere.name = 'light-hemisphere'
		this.scene.add( light_hemisphere )

    const light_ambient: AmbientLight = new AmbientLight(0xffffff, 1)
    this.scene.add(light_ambient)

    this.light_point = new PointLight(0xffffff, 20, 150, 0.92)
    this.light_point.position.set(0, 0, -30)
    this.scene.add(this.light_point)

    this.light_point2 = new PointLight(0xffffff, 20, 150, 0.92)
    this.light_point2.position.set(0, 0, 30)
    this.scene.add(this.light_point2)

    if (DEBUG_GUI || window.is_preview) {

      const updateLight = () => {
        this.render()
      }

      const updateLightColor = () => {
        light_hemisphere.color = new Color(params.color)
        light_hemisphere.groundColor = new Color(params.groundColor)
        this.render()
      }

      const folderLight = this.gui.addFolder("Popup 3D")

      const folderLightHemisphere = folderLight.addFolder('Hemisphere light')
      var params = {color: 0xffffff, groundColor: 0xffffff};
      folderLightHemisphere.addColor(params, "color").onChange(updateLightColor)
      folderLightHemisphere.addColor(params, "groundColor").onChange(updateLightColor)
      folderLightHemisphere.add(light_hemisphere, "visible", true).onChange(updateLight)
      folderLightHemisphere.add(light_hemisphere, "intensity", 0, 300, 0.01).onChange(updateLight)

      const folderLightAmbient = folderLight.addFolder('Ambient light')
      folderLightAmbient.add(light_ambient, "visible", true).onChange(updateLight)
      folderLightAmbient.add(light_ambient, "intensity", 0, 300, 0.01).onChange(updateLight)

      const folderLightPoint = folderLight.addFolder('Point light')
      folderLightPoint.add(this.light_point, "visible", true).onChange(updateLight)
      folderLightPoint.add(this.light_point, "intensity", 0, 300, 0.01).onChange(updateLight)
      folderLightPoint.add(this.light_point, "distance", 0, 300, 0.01).onChange(updateLight)
      folderLightPoint.add(this.light_point, "decay", 0, 2, 0.01).onChange(updateLight)

      const folderLightPoint2 = folderLight.addFolder('Point light 2')
      folderLightPoint.add(this.light_point2, "visible", true).onChange(updateLight)
      folderLightPoint.add(this.light_point2, "intensity", 0, 300, 0.01).onChange(updateLight)
      folderLightPoint.add(this.light_point2, "distance", 0, 300, 0.01).onChange(updateLight)
      folderLightPoint.add(this.light_point2, "decay", 0, 2, 0.01).onChange(updateLight)
    }
  }
  
  showObject(obj: ObjectData) {
    // console.log(`ObjectsModel ${productId}`, obj)

    // Clone and set final values
    this.product = obj.object3D.clone() as Mesh
    this.product.position.set(0, 0, 0)
    this.product.scale.set(0.1, 0.1, 0.1)
    this.product.rotation.set(0, Math.PI, 0);
    // this.product.quaternion.set(0, 0, 0, 1)
    this.product.traverse((child) => {
      if (child.name === 'video') {
        child.visible = false
      } else if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        (child.material as MeshStandardMaterial).envMap = this.envMapTexture
        child.material.needsUpdate = true
      }
    })
    
    // Create Box3
    let box = new Box3().setFromObject(this.product)
    let boxSize = box.getSize(new Vector3())
    let boxSizeLength = boxSize.length()
    let boxCenter = box.getCenter(new Vector3())
    
    // Center product based on Box3 center
    const center = boxCenter.multiplyScalar(-1)
    this.product.position.copy(center)
    
    /* // Re-create Box3 with product programatically centered
    const geo = new BoxGeometry(boxSize.x, boxSize.y, boxSize.z, 1, 1, 1)

    // Mesh Material product hit box
    const mat: MeshBasicMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false })
    const mesh = new Mesh(geo, mat)
    mesh.position.copy(this.product.position)    
    this.scene.add( mesh ) */


    if (window.matchMedia(`(min-width: ${lg}px)`).matches) {
      // set the camera to frame the box
      this.frameArea(boxSizeLength * 1.1, boxSizeLength, boxCenter)
    } else {
      // Mobile
      this.frameArea(boxSizeLength * 1.3, boxSizeLength, boxCenter)
    }

    // const helper = new Box3Helper( box, new Color(0xffff00) );
    // this.scene.add( helper )
    
    // Set initial values for transition
    this.product.scale.set(0, 0, 0)
    this.product.rotation.set(0, 0, 0)

    this.scene.add(this.product)

    // Transition
    let s: number
    this.oGsapScale = {t: 0}
    gsap.killTweensOf(this.oGsapScale)
    gsap.to(this.oGsapScale, {
      t: 1,
      delay: 1.5,
      duration: 2,
      onUpdate: () => {
        s = this.oGsapScale.t / 10
        this.product.scale.set(s, s, s)
        this.render()
        this.orbit.enabled = true
      }
    })

    gsap.killTweensOf(this.product.rotation)
    gsap.to(this.product.rotation, {
      y: Math.PI,
      delay: 1.5,
      duration: 2
    })
  }
  
  // Center product in renderer, see frameArea here : https://threejsfundamentals.org/threejs/lessons/threejs-cleanup.html
  frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: Vector3) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5
    const halfFovY = MathUtils.degToRad(this.camera.fov * .5)
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)

    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new Vector3())
        .subVectors(this.camera.position, boxCenter)
        .multiply(new Vector3(0, 0, 1)) // put back (1, 0, 1) for x and z in camera position
        .normalize()

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    this.camera.position.copy(direction.multiplyScalar(distance).add(boxCenter))

    // pick some near and far values for the frustum that
    // will contain the box.
    this.camera.near = boxSize / 100
    this.camera.far = boxSize * 100

    this.camera.updateProjectionMatrix()

    // point the camera to look at the center of the box
    this.camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z)
  }

  // not used
  /* animate() {
    if (this.active) {
      // const dt = this.clock.getDelta()
      this.render()
      
      // Note: Change FPS to 60
      setTimeout(() => {
        // this.control.update()
  
        // Note: Comment stats for prod
        requestAnimationFrame(() => {this.animate()})
  
      }, 1000 / 30 )
    }
  } */

  onWindowResize() {
    this.canvasRect = this.canvasContainer.getBoundingClientRect()
    this.camera.aspect = this.canvasRect.width /  this.canvasRect.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.canvasRect.width,  this.canvasRect.height)
    this.render()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }


  addGUI() {
    if (DEBUG_GUI || window.is_preview) {
      this.gui = new GUI({closed: DEBUG_GUI_CLOSED})
    }
  }

}