// import * as Constants from '../../const'
import gsap from 'gsap/all'
import Popbox from '../ui/popbox'
import GoogleTagCustom from '../../gt'
import Cookies from 'js-cookie'

export default class ModalCookies {
  public popbox: Popbox
  public id: string

  private _gt: GoogleTagCustom = new GoogleTagCustom()

  elModal: HTMLElement | null
  elBtnAccept: HTMLElement | null
  elBtnRefuse: HTMLElement | null

  constructor(id: string, popbox: Popbox){
    this.popbox = popbox
    this.id = id
    this.elModal = document.querySelector('.modal-cookies')
  }

  init(open: boolean = false) {
    if (this.elModal) {
      this.elModal.addEventListener('popbox_opening', this.onOpening.bind(this))
      this.elModal.addEventListener('popbox_opened', this.onOpened.bind(this))
      this.elModal.addEventListener('popbox_closing', this.onClosing.bind(this))
      this.elModal.addEventListener('popbox_closed', this.onClosed.bind(this))
  
      this.elBtnAccept = this.elModal.querySelector('.btn-accept')
      this.elBtnAccept?.addEventListener('click', this.onClickAccept.bind(this))
      this.elBtnRefuse = this.elModal.querySelector('.btn-refuse')
      this.elBtnRefuse?.addEventListener('click', this.onClickRefuse.bind(this))
    }

    // Open popup
    if (open) this.popbox.open(this.id)
  }  

  onClickAccept() {
    this._gt.addTags()
    this.popbox.close('modal-cookies')
    Cookies.set('cookiesAccepted', 'true')
  }

  onClickRefuse() {
    this.popbox.close('modal-cookies')
  }
  
  onOpening() {
    gsap.set(this.elModal, {autoAlpha: 0, display: 'flex'})
    gsap.to(this.elModal, {autoAlpha: 1})
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
    
    this.elBtnAccept?.removeEventListener('click', this.onClickAccept)
    this.elBtnRefuse?.removeEventListener('click', this.onClickRefuse)
  }
}