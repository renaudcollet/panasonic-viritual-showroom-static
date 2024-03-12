import Popbox from '../ui/popbox'
import SimpleBar from 'simplebar'
import Carousel from '../ui/carousel/carousel'
import * as Constants from '../../const'
import ModalBase from './modal-base'
import Youtube from '../ui/youtube'
import Product3d from './products/product3d'
import gsap from 'gsap/all'

export default class ModalProduct extends ModalBase {

  private carousel: Carousel
  private product3d: Product3d
  private elModal: HTMLElement
  private aSlides: Array<{hasVideo: boolean, yt: Youtube | null}> = []
  private code: string | null | undefined
  private elBtn1: HTMLElement | null
  private elBtn1Link: string | null
  private elBtn2: HTMLElement | null
  private elBtn2Link: string | null

  constructor(id: string, popbox: Popbox){
    super(id, popbox)

    this.elModal = this.popbox.getpopbox(this.id)
  }

  init(open: boolean = false) {
    super.init(open)
    this.initScrollToTop()
  }

  onOpening() {
    super.onOpening()
    // console.log(`%cOpen Modal`, 'background: #fce5ba', this.id)

    //
    // Analytics
    //
    this.code = this.elModal.querySelector('.product-number')?.textContent
    this.code = this.code?.replace(/ /g,'')
    // let _code = code?.replace(/ /g,'')
    // if(typeof window.gtag != "undefined") {
    //   window.gtag('event', 'view_item', {
    //     'items' : [{
    //       'id': code
    //     }]
    //   })
    // }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'gaEvent',
      eventCategory:'Product Click',
      eventAction: `${this.code}`,  // name of the clicked product
      eventLabel: '{{Product category}}' // category of the clicked product
    })

    this.elBtn1 = this.elModal.querySelector('.product-links__button--1')
    if (this.elBtn1) {
      this.elBtn1Link = this.elBtn1.getAttribute('href')
      this.elBtn1.addEventListener('click', this.outboundTag1.bind(this))
    }
    this.elBtn2 = this.elModal.querySelector('.product-links__button--2')
    if (this.elBtn2) {
      this.elBtn2Link = this.elBtn2.getAttribute('href')
      this.elBtn2.addEventListener('click', this.outboundTag2.bind(this))
    }

    // Activate simple scrollbar if not mobile
    if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
      const _scroller: any = this.elModal.querySelector('.scroller') || null
      if (_scroller) {
        this.scrollbar = new SimpleBar(_scroller, {
          autoHide: false
        })
      }
    }
    
    setTimeout(() => {
      // Carousel
      const elCarousel: HTMLElement | null = this.elModal.querySelector('.carousel-block')
      // console.log(`Has carousel`, elCarousel);
      
      if (elCarousel) {
        this.carousel = new Carousel(elCarousel)
        if (this.carousel.embla) {
          this.carousel.embla.on('init', this.onCarouselInit.bind(this))
          this.carousel.embla.on('select', this.onCarouselSelect.bind(this))
        }
      }
    }, 300)
  }

  outboundTag1(e: any) {
    this.outboundTag(this.elBtn1Link)
  }

  outboundTag2(e: any) {
    this.outboundTag(this.elBtn1Link)
  }

  outboundTag(link: string | null) {
    console.log('-> outbound', this.code, link?.replace(/ /g,''))
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'gaEvent',
      eventCategory:'Product Outbound',
      eventAction: `${this.code}`,  // name of the opened product
      eventLabel: `${link}` // outbound link
    })
  }
  
  onOpened() {
    super.onOpened()
    
    // Note: Debug
    window.modalProduct = this

    setTimeout(() => {
      // Cancel timeout if we close the popup right after opening it
      if (!this.isClosing) {
        // Create 3d product
        const el: HTMLElement | null = this.elModal.querySelector('.product-3d')
        if (el) {
          this.product3d = Product3d.getInstance()
          this.product3d.start(this.id, el)
        }
      }
    }, 200)
  }

  onClosing() {
    super.onClosing()
  }

  onClosed() {
    super.onClosed()
    // console.log(`%cClosed Modal`, 'background: #fce5ba')

    if (this.elBtn1) {
      this.elBtn1.removeEventListener('click', this.outboundTag1.bind(this))
    }
    if (this.elBtn2) {
      this.elBtn2.removeEventListener('click', this.outboundTag2.bind(this))
    }

    // Destroy YT
    // Note: Maybe keep loaded iframes
    this.stopYoutubeVideos()
    
    // Destroy carousel
    if (this.carousel.embla) {
      this.carousel.embla.off('init', this.onCarouselInit.bind(this))
      this.carousel.embla.off('select', this.onCarouselSelect.bind(this))
    }
    this.carousel.destroy()

    this.product3d.stop()

    // Destroy Scrollbar
    // this.scrollbar.unMount()
  }

  private onCarouselInit() {
    // console.log(`Product - on carousel init`)  
    if (this.carousel.embla) {
      this.carousel.embla.off('init', this.onCarouselInit.bind(this))
    }
    this.createYoutubeVideos()
  }

  createYoutubeVideos() {
    if (this.aSlides.length === 0) {
      // Check if contains youtube video
      const el: HTMLElement | null = document.querySelector(`#${ this.id }`)
      if (el) {
        // Get slides
        const elSlides: NodeListOf<HTMLElement> = el.querySelectorAll('.embla__slide')
        // Loop slides
        elSlides.forEach((v: HTMLElement, k: number) => {
          const elPlayer: HTMLElement | null = v.querySelector('.yt-player')
          if (elPlayer) {
            // console.log(`Slide ${k} is a video`, elPlayer.dataset.ytVideoId)
            const yt: Youtube = new Youtube()
            yt.createPlayer(elPlayer, elPlayer.dataset.ytVideoId || '')
            this.aSlides[k] = { hasVideo: true, yt }
          } else {
            this.aSlides[k] = { hasVideo: false, yt: null }
          }
        })
      }
    }
    else {
      this.playCurrentSlideVideo()
    }
  }

  playCurrentSlideVideo() {
    if (this.carousel.embla) {
      this.aSlides[this.carousel.embla.selectedScrollSnap()].yt?.play()
    }
  }

  stopYoutubeVideos() {
    this.aSlides.forEach((v: any) => {
      if (v.hasVideo) {
        v.yt.stop()
      }
    })
  }

  private onCarouselSelect() {
    if (this.carousel.embla) {
      const previous = this.carousel.embla.previousScrollSnap()
      const selected = this.carousel.embla.selectedScrollSnap()
      
      if (this.aSlides[previous].hasVideo) {
        this.aSlides[previous].yt?.pause()
      } 
      if (this.aSlides[selected].hasVideo) {
        this.aSlides[selected].yt?.play()
      } 
    }    
  }

  private initScrollToTop() {
    const btn = this.elModal.querySelector('.btn-back-to-top')
    if (btn) {
      btn.addEventListener('click', () => {
        // console.log(`click back to top`)
        const scroller: any = this.scrollbar ? this.scrollbar.getScrollElement() : this.elModal.querySelector('.scroller')
        const oGsap: any = { y: scroller.scrollTop }
        gsap.to(oGsap, {
          y: 0,
          duration: 0.8,
          onUpdate: () => {
            scroller.scroll(0, oGsap.y)
          }
        })
      })
    }
  }
}