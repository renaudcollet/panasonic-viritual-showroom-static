export const ASSETS_PATH :string = './assets'
export const MODELS_PATH :string = './assets/models'

export const SCALE_SCENE_FACTOR :number = 0.1 // c4d makes elements bigger than blender


export const lg = 992

// Debug
export const DEBUG_GUI: boolean = false
export const DEBUG_GUI_CLOSED: boolean = true
export const DEBUG_WIREFRAME: boolean = false

// Skip
export const SKIP_HOMEPAGE: boolean = false
export const SKIP_HELP: boolean = false // TODO: false

// Threejs
export const CAMERA_Y :number = 17.2
export const CAMERA_START_X: number = 10 //-12.5
export const CAMERA_START_Z: number = 50 // 107
export const CAMERA_START_ROT_X: number = -Math.PI/12
export const CAMERA_START_ROT_Y: number = -Math.PI
  
export const CAMERA_DISTANCE_FROM_PLAYER :number = 15
export const CAMERA_FOV :number = 45

export const ENV_MAP_INTENSITY: number = 1 //1.25 // 0.955
export const TONE_MAPPING_EXPOSURE: number = 0.9 // 1.4 //2.1


// Nav Rooms
export const A_NAV_ROOM_POSITION: Array<any> = [
  {x: 100 * SCALE_SCENE_FACTOR, y: CAMERA_Y, z: -500 * SCALE_SCENE_FACTOR}, // Living Room
  {x: 300 * SCALE_SCENE_FACTOR, y: CAMERA_Y, z: -30 * SCALE_SCENE_FACTOR}, // Kitchen
  {x: -410 * SCALE_SCENE_FACTOR, y: CAMERA_Y, z: -600 * SCALE_SCENE_FACTOR}, // Office
  {x: 380 * SCALE_SCENE_FACTOR, y: CAMERA_Y, z: 415 * SCALE_SCENE_FACTOR}, // Teenager
  {x: 400 * SCALE_SCENE_FACTOR, y: CAMERA_Y, z: 900 * SCALE_SCENE_FACTOR}, // Bathroom
  {x: 7 * SCALE_SCENE_FACTOR, y: CAMERA_Y, z: 1404 * SCALE_SCENE_FACTOR}, // Parent
  {x: 366 * SCALE_SCENE_FACTOR, y: 1500 * SCALE_SCENE_FACTOR, z: 183 * SCALE_SCENE_FACTOR} // Overview
]


// Filled by 3d room
export const A_ROOM_POSITION: Array<any> = []
export const A_ROOM_LOOKAT: Array<any> = []


// Videos / Sound
export const ENABLE_SOUND: boolean = true 
export const VOLUME_DEFAULT: number = 0.5
export const VOLUME_VIDEO_DISTANCE_MAX: number = 30 //40
export const VOLUME_VIDEO_DISTANCE_GAP: number = 10