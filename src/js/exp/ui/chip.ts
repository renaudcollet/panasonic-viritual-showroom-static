import {gsap, Elastic, Back} from 'gsap'
import { Box3, Vector3 } from 'three'
import { SCALE_SCENE_FACTOR } from '../../const'
import { ObjectData } from '../objects/ObjectData'

export default class Chip {

  public objData: ObjectData
  public el: HTMLElement
  public elRec: HTMLElement
  public elInside: HTMLElement

  constructor(container: HTMLElement, obj: ObjectData, hasRecSession: boolean) {
    this.objData = obj

    // Create Box3, to position chip at the top right, but if the object is rotated, the chip is positioned the opposite
    let box = new Box3().setFromObject(obj.object3D)
    let boxSize = box.getSize(new Vector3())
    // let boxCenter = box.getCenter(new Vector3())

    // console.log(`Chip ${obj.id}`, boxSize, boxCenter)    

    this.objData.chipVector = new Vector3(
      // (boxCenter.x + parseInt(obj.chip[0])) * SCALE_SCENE_FACTOR, 
      parseInt(obj.chip[0]) * SCALE_SCENE_FACTOR, 
      // (boxCenter.y + parseInt(obj.chip[1])) * SCALE_SCENE_FACTOR, 
      boxSize.y + parseInt(obj.chip[1]) * SCALE_SCENE_FACTOR, 
      parseInt(obj.chip[2]) * SCALE_SCENE_FACTOR
    )

    // Chip element
    this.el = container.appendChild(this.createDiv(hasRecSession))
    gsap.set(this.el, {autoAlpha: 1})

    // Event delegation: Add listener on parent instead of multiple children
    // https://ehsangazar.com/javascript-tips-for-performance-ee53239ae12d
    // this.el.addEventListener('click', this.onClick.bind(this)) // Handled in parent
    this.el.addEventListener('mouseover', this.onMouseOver)
    this.el.addEventListener('mouseout', this.onMouseOut)

    // REC Session element
    /* if (hasRecSession) {
      this.elRec = container.appendChild(this.createDivRec())
      gsap.set(this.el, {autoAlpha: 1})
  
      // Event delegation: Add listener on parent instead of multiple children
      // https://ehsangazar.com/javascript-tips-for-performance-ee53239ae12d
      // this.el.addEventListener('click', this.onClick.bind(this)) // Handled in parent
      // this.elRec.addEventListener('mouseover', this.onMouseOverRec)
      // this.elRec.addEventListener('mouseout', this.onMouseOutRec)
    } */
  }

  /* onClick(e: MouseEvent) {
    // e.stopImmediatePropagation()
    console.log(`click chip ${this.el.dataset.productId}`)
  } */

  onMouseOver(e: MouseEvent) {
    e.stopImmediatePropagation()
    gsap.to(e.target, {scale: 1.1, ease: Elastic.easeOut})
  }

  onMouseOut(e: MouseEvent) {
    e.stopImmediatePropagation()
    gsap.to(e.target, {scale: 0.9, ease: Back.easeOut, delay: 0.1})
  }

  createDiv(hasRec:boolean): HTMLElement {
    const div = document.createElement('div')
    
    const divInside = document.createElement('div')
    divInside.dataset['productId'] = this.objData.id
    divInside.classList.add('chip')
    this.elInside = div.appendChild(divInside)
    
    if (hasRec) {
      const divInsideRec = document.createElement('div')
      divInsideRec.dataset['productId'] = this.objData.id
      divInsideRec.classList.add('chip-rec')
      /* this.elInsideRec =  */div.appendChild(divInsideRec)
    }

    return div
  }

  /* createDivRec(): HTMLElement {
    const div = document.createElement('div')
    
    const divInside = document.createElement('div')
    divInside.dataset['productId'] = this.objData.id
    divInside.classList.add('chip-rec')
    const elInside = div.appendChild(divInside)

    return div
  } */
}