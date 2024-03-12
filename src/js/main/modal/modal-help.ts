import Popbox from '../ui/popbox'
import ModalBase from './modal-base'
import gsap from 'gsap/all'
import NavRooms from '../ui/nav-rooms'
import EasyReveal from '../../utils/easy-reveal'

export default class ModalHelp extends ModalBase {

  private previousStep: number
  private currentStep: number
  private aStep: NodeListOf<HTMLElement>
  private btnNext: HTMLElement | null
  private navRooms: NavRooms
  private idTimer: any
  private easyReveal1: EasyReveal
  private easyReveal2: EasyReveal
  private easyReveal3: EasyReveal

  
  constructor(id: string, popbox: Popbox, navRooms: NavRooms){
    super(id, popbox)
    this.navRooms = navRooms
  }


  init(open: boolean = false) {
    super.init(open)

    // Steps
    this.aStep = document.querySelectorAll(`.${this.id} .js-help-step`)
    this.initSteps()

    this.easyReveal1 = new EasyReveal(this.aStep[0])
    this.easyReveal2 = new EasyReveal(this.aStep[1])
    this.easyReveal3 = new EasyReveal(this.aStep[2])

    // Debug
    // this.popbox.open(this.id)
  }

  onOpening() {
    super.onOpening()
    // console.log(`Opening Help`)

    this.resetSteps()

    this.navRooms.zTop()

    // Activate simple scrollbar if not mobile
    // if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
    //   const _scroller: any = document.querySelector('.modal-help .scroller') || null
    //   if (_scroller) {
    //     console.log(`Create scrollbar Help`)
    //     this.scrollbar = new SimpleBar(_scroller, {
    //       autoHide: false
    //     })
    //   }
    // }
    
    //
    // Analytics
    //
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'gaEvent',
      eventCategory:'Navigation',
      eventAction: 'Main',
      eventLabel: 'Help'  // name of the clicked navigation item 
    })
  }

  onOpened() {
    super.onOpened()

    setTimeout(() => {

      // Reveal step1
      this.easyReveal1.play()

      // Timer steps
      this.idTimer = setInterval(() => {
        this.onClickNext(null)

      }, 10000)

    }, 1200)
  }

  onClosed() {
    super.onClosed()
    
    this.navRooms.zDefault()

    this.clearTimer()
  }

  initSteps() {
    this.btnNext = document.querySelector(`.${this.id} .btn-next`)
    this.btnNext?.addEventListener('click', this.onClickNext.bind(this))

    this.resetSteps()
  }

  resetSteps() {
    this.currentStep = 0
    this.previousStep = 0
    gsap.set(this.aStep[0], {opacity: 1})
    gsap.set(this.aStep[1], {opacity: 0})
    gsap.set(this.aStep[2], {opacity: 0})
    gsap.to(this.btnNext, {autoAlpha: 1})
  }

  onClickNext(e: MouseEvent | null) {
    if (e) {
      this.clearTimer()
    }

    if (this.currentStep === this.aStep.length - 1) {
      // gsap.to(this.btnNext, {autoAlpha: 0})
      this.popbox.close(this.id)
    } else {
      this.previousStep = this.currentStep
      this.currentStep++
  
      gsap.to(this.aStep[this.previousStep], {opacity: 0, display:'none'})
      gsap.to(this.aStep[this.currentStep], {opacity: 1, display:'block'})
      if (this.currentStep === 1)
        this.easyReveal2.play(0.5)
      else if (this.currentStep === 2)
        this.easyReveal3.play(0.5)
    }
  }

  clearTimer() {
    if (this.idTimer) {
      clearInterval(this.idTimer)
      this.idTimer = undefined
    }
  }

}