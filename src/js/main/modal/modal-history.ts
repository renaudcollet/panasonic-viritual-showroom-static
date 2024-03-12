// import SimpleBar from 'simplebar'
import SimpleBar from 'simplebar'
import * as Constants from '../../const'
import Popbox from '../ui/popbox'
import Youtube from '../ui/youtube'
import ModalBase from './modal-base'

export default class ModalHistory extends ModalBase {
  elModal: HTMLElement | null
  elVideo: HTMLElement | null | undefined
  videoId: string | undefined
  yt: Youtube

  constructor(id: string, popbox: Popbox){
    super(id, popbox)
    this.elModal = document.querySelector('.modal-history')
    this.elVideo = this.elModal?.querySelector('.video')
    this.videoId = this.elVideo?.dataset.ytVideoId
  }
  
  onOpening() {
    this.playYoutubeVideos()

    super.onOpening()

    //
    // Analytics
    // TODO: Set dynamic analytics, and category, and action
    //
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'gaEvent',
      eventCategory:'Navigation',
      eventAction: 'Main',
      eventLabel: 'History'  // name of the clicked navigation item 
    })
  }

  playYoutubeVideos() {
    if (this.elVideo && this.videoId) {
      if (this.yt) {
        this.yt.start(this.videoId)
      } else {
        this.yt = new Youtube()
        this.yt.createPlayer(this.elVideo, this.videoId)
      }
    }
  }

  onOpened() {
    super.onOpened()

    // Activate simple scrollbar if not mobile
    if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
      const _scrolled: any = this.elModal?.querySelector('.scrolled') || null
      const _scroller: any = this.elModal?.querySelector('.scroller') || null
      if (_scroller && _scrolled) {
        const scrollerH: number = _scroller.getBoundingClientRect().height
        const scrolledH: number = _scrolled.getBoundingClientRect().height
        console.log(scrolledH + ' > ' + scrollerH)
        if(scrolledH > scrollerH + 2) {
          this.scrollbar = new SimpleBar(_scroller, {
            autoHide: true
          })
        }
      } 
    }
  }

  onClosing() {
    super.onClosing()

    if (this.yt) {
      this.yt.pause()
      this.yt.stop()
    }
  }

  onClosed() {
    super.onClosed()
    
  }
}