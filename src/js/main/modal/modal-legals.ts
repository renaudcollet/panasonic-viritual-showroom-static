import Popbox from '../ui/popbox'
import SimpleBar from 'simplebar'
import * as Constants from '../../const'
import ModalBase from './modal-base'

export default class ModalLegals extends ModalBase {

  constructor(id: string, popbox: Popbox){
    super(id, popbox)
  }

  init(open: boolean = false) {
    super.init(open)
    // this.initScrollToTop()
  }

  onOpening() {
    super.onOpening()
    // console.log(`Opening Legals`)

    // Activate simple scrollbar if not mobile
    if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
      const _scroller: any = document.querySelector('.modal-legals .scroller') || null
      if (_scroller) {
        // console.log(`Create scrollbar Legals`)
        this.scrollbar = new SimpleBar(_scroller, {
          autoHide: false
        })
      }
    }

    
    //
    // Analytics
    //
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'gaEvent',
      eventCategory:'Navigation',
      eventAction: 'Main',
      eventLabel: 'Legal'  // name of the clicked navigation item 
    })
  }

  /* private initScrollToTop() {
    const btn = document.querySelector('.modal-legals .btn-back-to-top')
    console.log(`initScrollToTop`, btn)
    if (btn) {
      btn.addEventListener('click', () => {
        console.log(`click back to top`)
        const scroller: any = document.querySelector('.modal-legals .scroller')
        if (scroller && this.scrollbar) {
          this.scrollbar.getScrollElement().scroll(0, 0)
        } else if(scroller) {
          scroller.scroll(0, 0)
        }
      })
    }
  } */
}