/* export interface Model3DInterface {
  id: string,
  name: string,
  type: string,
  path: string,
  position: Array<number>
} */

import { Mesh, MeshBasicMaterial, Object3D, Texture, Vector3 } from 'three'

export class ObjectData {

  static CATEGORY_PRODUCT: string = 'product'
  static CATEGORY_DECOR: string = 'decor'

  // from datas.json
  id: string
  name: string
  device: string // both, desktop, mobile
  path: string
  type: string // glb, fbx, ...
  compression: string // draco
  position: Array<number> // [x, y, z]
  scale: Array<number> // [x, y, z]
  collision: boolean // intersect raycaster or not
  clickable: boolean = false// decors specific click
  chip: Array<any>
  category: string
  sub_cat: string

  // TV
  video: string
  poster: string

  // modal 3d product zoom
  zoom_min: number
  zoom_max: number

  // Maps
  texture: string
  textureSmall: string
  ao: string
  bump: string
  metalness: string
  roughness: string
  // displacement: string
  alpha: string

  // Maps values
  ao_intensity: number
  rough_intensity: number
  metal_intensity: number
  bump_scale: number
  

  // from .js
  object3D: Object3D
  mesh: Mesh
  chipVector: Vector3
  bakedMat: MeshBasicMaterial

  constructor() {

  }
}