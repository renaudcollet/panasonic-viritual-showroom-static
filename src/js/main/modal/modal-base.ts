import Popbox from '../ui/popbox'
import SimpleBar from 'simplebar'
import gsap from 'gsap'
import Experience from '../experience'
import AudioPlayer from '../../exp/audio/audio-player'

export default class ModalBase {

  public popbox: Popbox
  public scrollbar: SimpleBar
  public id: string
  public isOpening: boolean
  // public isOpened: boolean
  public isClosing: boolean
  // public isClosed: boolean

  private _body: HTMLElement | null = document.querySelector('body')

  private elBg: HTMLElement | null

  constructor(id: string, popbox: Popbox){
    this.popbox = popbox
    this.id = id
  }

  init(open: boolean = false) {
    const _pop: HTMLElement = this.popbox.getpopbox(this.id)
    _pop.addEventListener('popbox_opening', this.onOpening.bind(this))
    _pop.addEventListener('popbox_opened', this.onOpened.bind(this))
    _pop.addEventListener('popbox_closing', this.onClosing.bind(this))
    _pop.addEventListener('popbox_closed', this.onClosed.bind(this))

    // Init animations element
    this.elBg = _pop.querySelector('.popbox_container')
    gsap.set(this.elBg, {
      clipPath: 'polygon(0 100%, 100% 100%, 100% 101%, 0% 101%)'
    })

    // Open popup
    if (open) this.popbox.open(this.id)
  }  

  onOpening() {
    this.isOpening = true
    this.isClosing = false;

    if (this._body?.classList.contains('modal-opened')) {
      // A modal is already opened
      this._body?.classList.add('modal-opened-2')
    } else {
      this._body?.classList.add('modal-opened')
    }
    
    if (window.game && window.game.audioPlayer)
      (window.game.audioPlayer as AudioPlayer).setVolumePopupOpened()

    // Create mask with: https://bennettfeely.com/clippy/
    
    // Ouverture bande centrale puis s'élargie
    gsap.set(this.elBg, {
      clipPath: 'polygon(49.75% 100%, 50.25% 100%, 50.25% 101%, 49.75% 101%)'
    })

    var tl = gsap.timeline();
    tl.to(this.elBg, {
      delay: 0.3, 
      duration: 0.3,
      ease: 'power2.in',
      clipPath: 'polygon(49.75% 0%, 50.25% 0%, 50.25% 101%, 49.75% 101%)'
    }).to(this.elBg, {
      delay: 0.1,
      duration: 0.5,
      ease: 'power2.out',
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    })
  }

  /**
   * Open is called straight after opening, it is not a real onOpened finished
   * Then you can delay next animations beginning
   */
  onOpened() {
    // console.log(`opened`)
  }

  onClosing() {    
    this.isClosing = true
    this.isOpening = false
    
    gsap.set(this.elBg, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    })
    // Change delay for modal to close in popbox.ts close()
    var tl = gsap.timeline();
    tl.to(this.elBg, {
      delay: 0, 
      duration: 0.3,
      ease: 'power3.out',
      clipPath: 'polygon(49.75% 0%, 50.25% 0%, 50.25% 101%, 49.75% 101%)'
    }).to(this.elBg, {
      delay: 0.05,
      duration: 0.3,
      ease: 'power3.in',
      clipPath: 'polygon(49.75% 100%, 50.25% 100%, 50.25% 101%, 49.75% 101%)'
    })
  }

  onClosed() {
    // gsap.set(this.elBg, {
    //   clipPath: 'polygon(0 100%, 100% 100%, 100% 101%, 0% 101%)'
    // })

    if (this._body?.classList.contains('modal-opened-2')) {
      this._body?.classList.remove('modal-opened-2')
    } else {
      this._body?.classList.remove('modal-opened')
      
      // Music restarts when all modals are closed
      if (window.game && window.game.audioPlayer)
        (window.game.audioPlayer as AudioPlayer).setVolumePopupClosed()
    }
  }
}