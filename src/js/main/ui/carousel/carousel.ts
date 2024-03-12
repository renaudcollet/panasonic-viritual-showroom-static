import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel'

export default class Carousel {

  public embla: EmblaCarouselType | null
  private dotsArray: NodeListOf<HTMLElement>
  private prevBtn: any
  private nextBtn: any

  constructor(container: HTMLElement) {
    const viewPort: HTMLElement | null = container.querySelector('.embla__viewport')
    // console.log(`Carousel`, viewPort)
    
    if (viewPort) {
      this.prevBtn = container.querySelector('.embla__buttons .embla__button--prev')
      this.nextBtn = container.querySelector('.embla__buttons .embla__button--next')
      this.dotsArray = container.querySelectorAll('.embla__dots .embla__dot')

      // Init Embla
      this.embla = EmblaCarousel(viewPort, { loop: false })

      this.embla.on('init', this.onInitEmbla.bind(this))
      this.embla.on('select', this.onSelectEmbla.bind(this))
    }
  }

  onInitEmbla(e: any) {
    // console.log(`on Init Embla`, e)
    // console.log(`slides`, this.embla?.slideNodes())

    this.disablePrevNextBtns()
    this.initPrevNextBtns()
        
    this.initDotBtns()
    this.selectDotBtn()
  }

  onSelectEmbla(e: any) {
    // console.log(`on Select Embla`, e)
    this.selectDotBtn()
    this.disablePrevNextBtns()
  }

  // Next Prev
  initPrevNextBtns() {
    this.prevBtn.addEventListener('click', this.onClickPrev.bind(this), false)
    this.nextBtn.addEventListener('click', this.onClickNext.bind(this), false)
  }

  onClickPrev(e: any) {
    this.embla?.scrollPrev()
  }

  onClickNext(e: any) {
    this.embla?.scrollNext()
  }
  
  disablePrevNextBtns() {
    if (this.prevBtn && this.nextBtn) {
      if (this.embla?.canScrollPrev()) this.prevBtn.removeAttribute('disabled')
      else this.prevBtn.setAttribute('disabled', 'disabled')

      if (this.embla?.canScrollNext()) this.nextBtn.removeAttribute('disabled')
      else this.nextBtn.setAttribute('disabled', 'disabled')
    }
  }

  // Dot Buttons
  initDotBtns() {
    this.dotsArray.forEach((dotNode, i) => {
      dotNode.addEventListener('click', this.onClickDotBtn.bind(this, i), false)
    })
  }

  onClickDotBtn(e: any) {
    if (this.embla)
      this.embla.scrollTo(e)
  }

  selectDotBtn () {
    if (this.embla) {
      const previous = this.embla.previousScrollSnap()
      const selected = this.embla.selectedScrollSnap()
      // console.log(`selectDotBtn ${previous} > ${selected}`)
      
      this.dotsArray[previous].classList.remove("is-selected")
      this.dotsArray[selected].classList.add("is-selected")
    }
  }

  destroy() {
    if (this.embla) {
      this.embla.off('init', this.onInitEmbla.bind(this))
      this.embla.off('select', this.onSelectEmbla.bind(this))
      this.embla.on('destroy', this.onDestroyEmbla.bind(this))
      this.embla.destroy()
    }
  }

  onDestroyEmbla() {
    if (this.embla) {
      this.embla.off('destroy', this.onDestroyEmbla.bind(this))
      this.embla = null
      // console.log(`Carousel destroyed !`);
    }
    
  }
}