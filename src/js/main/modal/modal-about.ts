import SimpleBar from 'simplebar'
import * as Constants from '../../const'
import ModalBase from './modal-base'

export default class ModalAbout extends ModalBase {

  onOpening() {
    super.onOpening()

    // Activate simple scrollbar if not mobile
    if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
      const _scroller: any = document.querySelector('.modal-about .scroller') || null
      if (_scroller) {
        // console.log(`Create scrollbar About`)
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
      eventLabel: 'About'  // name of the clicked navigation item 
    })
  }

  onOpened() {
    super.onOpened()
  }

  onClosing() {
    super.onClosing()

  }

  onClosed() {
    super.onClosed()
    
  }

  /* private initScrollToTop() {
    const btn = document.querySelector('.modal-about .btn-back-to-top')
    console.log(`initScrollToTop`, btn)
    if (btn) {
      btn.addEventListener('click', () => {
        console.log(`click back to top`)
        const scroller: any = document.querySelector('.modal-about .scroller')
        if (scroller && this.scrollbar) {
          this.scrollbar.getScrollElement().scroll(0, 0)
        } else if(scroller) {
          scroller.scroll(0, 0)
        }
      })
    }
  } */
}