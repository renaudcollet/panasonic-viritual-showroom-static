// import SimpleBar from 'simplebar'
import SimpleBar from 'simplebar'
import * as Constants from '../../const'
import Popbox from '../ui/popbox'
import Youtube from '../ui/youtube'
import ModalBase from './modal-base'

export default class ModalRecSessions extends ModalBase {
  elModalRec: HTMLElement | null
  elVideo: HTMLElement | null | undefined
  elText: HTMLElement | null | undefined
  elLink: HTMLElement | null | undefined
  yt: Youtube
  oContent: any

  constructor(id: string, popbox: Popbox){
    super(id, popbox)
    this.elModalRec = document.querySelector('.modal-rec-sessions')
    this.elVideo = this.elModalRec?.querySelector('.video')
    this.elText = this.elModalRec?.querySelector('.text')
    this.elLink = this.elModalRec?.querySelector('.link')
  }
  
  onOpening() {
    this.oContent = window.products_rec_sessions[window.products_rec_session_id]

    if (this.elText)
      this.elText.innerHTML = this.oContent.text

    if (this.elLink) {
      this.elLink.setAttribute('href', this.oContent.linkURL)
      this.elLink.innerHTML = this.oContent.linkLabel
    }

    this.playYoutubeVideos()

    // Update content

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
      eventLabel: 'REC Sessions'  // name of the clicked navigation item 
    })
  }

  playYoutubeVideos() {
    if (this.elVideo) {
      if (this.yt) {
        this.yt.start(this.oContent.videoId)
      } else {
        this.yt = new Youtube()
        this.yt.createPlayer(this.elVideo, this.oContent.videoId)
      }
    }
  }

  onOpened() {
    super.onOpened()

    // Activate simple scrollbar if not mobile
    if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
      const _scrolled: any = document.querySelector('.modal-rec-sessions .scrolled') || null
      const _scroller: any = document.querySelector('.modal-rec-sessions .scroller') || null
      if (_scroller && _scrolled && _scrolled.getBoundingClientRect().height > _scroller.getBoundingClientRect().height + 10) {
        this.scrollbar = new SimpleBar(_scroller, {
          autoHide: true
        })
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