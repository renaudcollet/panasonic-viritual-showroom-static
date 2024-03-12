// import * as Constants from '../../const'
import gsap from 'gsap/all'
import Popbox from '../ui/popbox'
// import ModalBase from './modal-base'

export default class ModalNewsletter {
  public popbox: Popbox
  public id: string

  elModal: HTMLElement | null

  constructor(id: string, popbox: Popbox){
    this.popbox = popbox
    this.id = id
    this.elModal = document.querySelector('.modal-newsletter')
  }

  init(open: boolean = false) {
    this.elModal?.addEventListener('popbox_opening', this.onOpening.bind(this))
    this.elModal?.addEventListener('popbox_opened', this.onOpened.bind(this))
    this.elModal?.addEventListener('popbox_closing', this.onClosing.bind(this))
    this.elModal?.addEventListener('popbox_closed', this.onClosed.bind(this))

    // Open popup
    if (open) this.popbox.open(this.id)
  }  
  
  onOpening() {
    gsap.set(this.elModal, {autoAlpha: 0, display: 'flex'})
    gsap.to(this.elModal, {autoAlpha: 1})
    //
    // Analytics
    // TODO: Set dynamic analytics, and category, and action
    //
    // window.dataLayer = window.dataLayer || []
    // window.dataLayer.push({
    //   event: 'gaEvent',
    //   eventCategory:'Navigation',
    //   eventAction: 'Main',
    //   eventLabel: 'Newsletter'  // name of the clicked navigation item 
    // })
  }

  onOpened() {
  }

  onClosing() {
    gsap.to(this.elModal, {autoAlpha: 0, onComplete:() => {
      gsap.set(this.elModal, {display: 'none'})
    }})
  }

  onClosed() {
    this.elModal?.removeEventListener('popbox_opening', this.onOpening.bind(this))
    this.elModal?.removeEventListener('popbox_opened', this.onOpened.bind(this))
    this.elModal?.removeEventListener('popbox_closing', this.onClosing.bind(this))
    this.elModal?.removeEventListener('popbox_closed', this.onClosed.bind(this))
  }
}