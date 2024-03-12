import gsap from 'gsap/all'
import SimpleBar from 'simplebar'
import * as Constants from '../../const'
import ModalBase from './modal-base'

export default class ModalProductList extends ModalBase {
  aCategory: NodeListOf<Element> | undefined
  aProducts: NodeListOf<Element> | undefined
  elProductList: any
  elProducts: any
  selectedCat: string | undefined
  previousCat: string | undefined
  selectedProd: string | undefined
  previousProd: string | undefined
  imageLoader: HTMLImageElement
  elArrowTop: any
  elArrowBottom: any
  scrollerH: any
  elProductPictureClick: any
  selectedProdId: string | undefined
  scrolledH: any

  onOpening() {
    super.onOpening()

    //
    // Analytics
    //
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'gaEvent',
      eventCategory:'Navigation',
      eventAction: 'Main',
      eventLabel: 'Product List'  // name of the clicked navigation item 
    })
  }

  onOpened() {
    this.elProductList = document.querySelector('.modal-product-list')

    this.elArrowTop = this.elProductList.querySelector('.arrow-scroll--top')
    this.elArrowBottom = this.elProductList.querySelector('.arrow-scroll--bottom')

    // // Activate simple scrollbar if not mobile
    // if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
    const _scroller: any = this.elProductList?.querySelector('.modal-product-list .products__scroller') || null
    if (this.scrollbar === undefined && _scroller) {
      const sWidth = _scroller.getBoundingClientRect().width + 'px'
      _scroller.style.width = sWidth
      this.scrollbar = new SimpleBar(_scroller, {
        autoHide: false
      })
      
      this.elProductPictureClick = this.elProductList.querySelector('.product-picture-click')
      this.elProductPictureClick.addEventListener('click', this.onClickPicture.bind(this))

      this.scrollerH = this.elProductList.querySelector('.products__scroller').getBoundingClientRect().height

      this.scrollbar.getScrollElement().addEventListener('scroll', this.onScrollProducts.bind(this))
      this.onScrollProducts()

      this.elArrowTop.addEventListener('click', this.onClickArrowTop.bind(this))
      this.elArrowBottom.addEventListener('click', this.onClickArrowBottom.bind(this))
    }
    // }

    this.aCategory = this.elProductList?.querySelectorAll('.btn-category')
    this.aCategory?.forEach((value: Element, key) => {
      (value as HTMLElement).addEventListener('click', this.onClickCategory.bind(this))
      if (key === 0) {
        this.onClickCategory({target: value})
      }
    })

    super.onOpened()
  }

  onClickArrowTop(e: any) {
    let _scrollTop = this.scrollbar.getScrollElement().scrollTop
    if (_scrollTop >= 35) gsap.to(this.scrollbar.getScrollElement(), {scrollTop: _scrollTop - 30})
    else gsap.to(this.scrollbar.getScrollElement(), {scrollTop: 0})
    this.onScrollProducts()
  }

  onClickArrowBottom(e: any) {
    let _scrollTop = this.scrollbar.getScrollElement().scrollTop
    if (_scrollTop <= this.scrollerH - 35) gsap.to(this.scrollbar.getScrollElement(), {scrollTop: _scrollTop + 30})
    else gsap.to(this.scrollbar.getScrollElement(), {scrollTop: this.scrollerH})
    this.onScrollProducts()
  }

  onClickCategory(e: any) {
    (e.target as HTMLElement)?.classList.add('selected');
    
    const cat: string | undefined = (e.target as HTMLElement)?.dataset.category;

    this.scrollbar.getScrollElement().scrollTop = 0

    // Prevent click twice on the same item
    if (cat !== this.selectedCat) {
      this.previousCat = this.selectedCat
      this.selectedCat = cat;
  
      // Reset previous product button
      if (this.elProducts) {
        // console.log(`Reset previous buttons  ${this.selectedProd} from ${this.previousCat} category`)
        this.elProducts.querySelector(`[data-product="${this.selectedProd}"]`)?.classList.remove('selected')
        // Remove previous listeners
        this.aProducts = this.elProducts.querySelectorAll(`.prodcuts [data-category="${this.previousCat}`)
        this.aProducts?.forEach((value, key) => {
          (value as HTMLElement).removeEventListener('click', this.onClickProduct.bind(this))
        })
  
        this.selectedProd = undefined
        this.previousProd = undefined
      }
  
      // Current category 
      this.elProducts = this.elProductList.querySelector(`.products [data-category="${this.selectedCat}"]`)
      this.elProducts.classList.add('show')
  
      this.aProducts = this.elProducts.querySelectorAll(`.btn-product`)
      this.aProducts?.forEach((value, key) => {
        (value as HTMLElement).addEventListener('click', this.onClickProduct.bind(this))
        if(key === 0) {
          this.onClickProduct({target: value})
        }
      })
  
      // Previous category
      if (this.previousCat !== undefined) {
        this.elProductList.querySelector(`.categories [data-category="${this.previousCat}"]`).classList.remove('selected')

        const elProductsPrevious = this.elProductList.querySelector(`.products [data-category="${this.previousCat}"]`)
        elProductsPrevious.classList.remove('show')
      }

      // Update Arrows
      this.scrolledH = this.elProductList.querySelector('.products__scrolled').getBoundingClientRect().height
      // Show arrows
      this.onScrollProducts()
    }
  }
  
  onScrollProducts() {
    gsap.killTweensOf(this.elArrowTop)
    gsap.killTweensOf(this.elArrowBottom)
    
    if (this.scrolledH > this.scrollerH) {
      if (this.scrolledH - this.scrollbar.getScrollElement().scrollTop === this.scrollerH) {
        gsap.to(this.elArrowTop, {autoAlpha: 1})
        gsap.to(this.elArrowBottom, {autoAlpha: 0})
      } else if(this.scrollbar.getScrollElement().scrollTop === 0) {
        gsap.to(this.elArrowTop, {autoAlpha: 0})
        gsap.to(this.elArrowBottom, {autoAlpha: 1})
      } else {
        gsap.to(this.elArrowTop, {autoAlpha: 1})
        gsap.to(this.elArrowBottom, {autoAlpha: 1})
      }
    } else {
      gsap.to(this.elArrowTop, {autoAlpha: 0})
      gsap.to(this.elArrowBottom, {autoAlpha: 0})
    }
  }

  onClickProduct(e: any) {
    const elProduct: HTMLElement | null = (e.target as HTMLElement);
    elProduct?.classList.add('selected');
    const prod: string | undefined = elProduct?.dataset.product;

    // Prevent click twice the same
    if (prod !== this.selectedProd) {
      this.previousProd = this.selectedProd
      this.selectedProd = prod

      this.selectedProdId = elProduct?.dataset.productId
      
      this.elProducts.querySelector(`[data-product="${this.selectedProd}"]`)?.classList.add('selected')

      // Set image background
      const img: string | undefined = elProduct?.dataset.image;
      const elProductPictures = this.elProductList.querySelectorAll('.product-picture')
      if (img !== undefined) {
        // Copy image to lower node
        elProductPictures[0].style.backgroundImage = elProductPictures[1].style.backgroundImage
        // const imgPath: string = `${window.theme_path}assets/img/uploads/${img}`
        this.loadImage(img).then(() => {
          // Hide higher node
          gsap.killTweensOf(elProductPictures[1])
          gsap.set(elProductPictures[1], {opacity: 0})

          elProductPictures[1].style.backgroundImage = `url('${img}')`
          gsap.to(elProductPictures[1], {opacity: 1, duration: 1, delay: 0.1})
        })
      }
  
      if (this.previousProd !== undefined) {
        this.elProducts.querySelector(`[data-product="${this.previousProd}"]`).classList.remove('selected')
      }
    }
  }

  onClickPicture(e: any) {
    window.popbox.open(`modal-product-${this.selectedProdId}`)
  }

  loadImage(src: string) {
    return new Promise(function(resolve, reject) {
      const image = new Image()
      image.addEventListener('load', resolve)
      image.addEventListener('error', reject)
      image.src = src
   })
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