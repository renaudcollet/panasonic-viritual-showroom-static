import gsap from 'gsap'
import * as Exp from '../exp'
import * as Constants from '../const'
import Popbox from './ui/popbox'
import Game from '../exp/game'
import Cookies from 'js-cookie'

export default class Experience {
  constructor() {}

  start(popup: Popbox, onStartedCbk: Function) {
    // Show exp
    gsap.set('.js-page-experience', {autoAlpha: 0})
    gsap.to('.js-page-experience', {autoAlpha: 1})
    
    // Start loading data
    Exp.loadDatas(this.onLoadComplete.bind(this, popup, onStartedCbk))
    // Exp.loadModels()
  }

  private onLoadComplete(popup: Popbox, onStartedCbk: Function) {
    // Hide loader
    const intro: any = document.querySelector('.js-page-experience-intro')
    
    gsap.to(intro, {autoAlpha: 0, duration: 1, delay: 0.4, onComplete: () => {
      intro.style.display = 'none'

      // Opacity on background
      gsap.to('.js-big-bg', {
        delay: 0.5, 
        opacity: 0, 
        display: 'none', 
        onComplete: () => { 
          onStartedCbk() 
        }
      })
      
      // Open Help
      if (!Constants.SKIP_HELP && Cookies.get('viewHelp') !== 'true') {
        popup.open('modal-help')
        Cookies.set('viewHelp', 'true')
      }

      // Timeout open newsletter
      setTimeout(() => {
        popup.open('modal-newsletter')
      }, 30000)

      // onStartedCbk()
    }})
  }

  public get game(): Game {
    return Exp.game
  }
}