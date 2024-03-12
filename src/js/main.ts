import "../css/main.scss"

import Menu from './main/menu'
import Popbox from './main/ui/popbox'
import ModalProduct from './main/modal/modal-product'
import ModalAbout from './main/modal/modal-about'
import ModalLegals from './main/modal/modal-legals'
import Youtube from './main/ui/youtube'
import LazyLoad from 'vanilla-lazyload'
import Experience from './main/experience'
import ModalHelp from './main/modal/modal-help'
import NavRooms from './main/ui/nav-rooms'
import ModalLanguage from './main/modal/modal-language'
import * as Constants from './const'
import gsap from 'gsap'
import ModalConditions from "./main/modal/modal-conditions"
import ModalProductList from "./main/modal/modal-product-list"
import ModalRecSessions from "./main/modal/modal-rec-sessions"
import ModalHistory from "./main/modal/modal-history"
import ModalNewsletter from "./main/modal/modal-newsletter"
import ModalCookies from "./main/modal/modal-cookies"
import Cookies from "js-cookie"

// For debugging game
declare global {
  interface Window {
    popbox:Popbox
  }
}

window.addEventListener('load', () => {
  let experience: Experience

  // Lazyload
  new LazyLoad()

  // Prepare for YT iframe
  new Youtube()

  // Note: Use routing ? https://openbase.com/js/director#client-side-routing

  // Menu
  new Menu()

  // Nav Rooms
  const navRooms: NavRooms = new NavRooms()

  // Popups
  let popbox = new Popbox({blur: true})
  window.popbox = popbox

  // Chip container
  const chipsContainer = document.getElementById('chip-container')

  // function onPopboxClosed(e: any) {
  //   console.log(`On pop closed`, e);
  //   experience.game.audioPlayer.setVolumePopupClosed()
  // }

  // Experience loaded and started Callback when 3d is loaded
  function onStartedCbk() {
    // Listen all the Chips
    chipsContainer?.addEventListener('click', (evt: MouseEvent) => {
      if (evt.target) {
        if ((evt.target as HTMLElement).matches('div.chip')) {
          const id: string | undefined = (evt.target as HTMLElement).dataset.productId
          if (id !== undefined) {
            popbox.open(`modal-product-${id}`)
            // INFO: Click move to object is in game.ts in onPointerUp()
          }
        } else if((evt.target as HTMLElement).matches('div.chip-rec')) {
          const id: string | undefined = (evt.target as HTMLElement).dataset.productId
          if (id !== undefined) {
            window.products_rec_session_id = id
            popbox.open(`modal-rec-sessions`)
          }
        }
      } 
    }, false)
    
    // Show chips contaienr
    gsap.to(chipsContainer, {autoAlpha: 1})

    // Show Nav Rooms
    navRooms.show()
    
    if (window.matchMedia(`(min-width: ${Constants.lg}px)`).matches) {
      // Show logo overlay
      gsap.to('.js-page-experience-logo-overlay', {autoAlpha: 0.65})
    }

    // Modal Quick Access - Preview Modal or Default Open Modal
    if (window.current_id_product !== '') {
      popbox.open(`modal-product-${window.current_id_product}`)
    }
  }


  // Start Experience
  const startExp = () => {
    if (!experience) {

      // Hide chips container
      gsap.set(chipsContainer, {autoAlpha: 0})

      // Hide logo overlay
      gsap.set('.js-page-experience-logo-overlay', {autoAlpha: 0})
  
      // Experience 3d
      experience = new Experience()
      experience.start(popbox, onStartedCbk)
  
      // Nav room click
      navRooms.addEventListener('ON_DATA', (evt) => {
        if (evt.data.id === 'ALL_PRODUCTS')
          popbox.open('modal-product-list')
        else
          experience.game.moveCameraToRoom(evt.data.id)
      })
    }
  }


  // Click start button
  const clickStart = (lang: string) => {
    // console.log(`Click start language=`, lang)
    if (lang === window.lang_ip) {
      // On lance experience si c'est la bonne langue
      popbox.close('modal-language')
      startExp()
    } else {
      window.location.href = '//' + window.location.host + '/' + lang
    }
  }


  // Homapage & Language
  const modalLanguage: ModalLanguage = new ModalLanguage('modal-language', popbox, clickStart) 

  const modalAbout: ModalAbout = new ModalAbout('modal-about', popbox) 
  modalAbout.init()

  const modalLegals: ModalLegals = new ModalLegals('modal-legals', popbox) 
  modalLegals.init()

  const modalConditions: ModalConditions = new ModalConditions('modal-conditions', popbox) 
  modalConditions.init()

  const modalHelp: ModalHelp = new ModalHelp('modal-help', popbox, navRooms) 
  modalHelp.init()

  const modalProductList: ModalProductList = new ModalProductList('modal-product-list', popbox) 
  modalProductList.init()

  const modalRecSessions: ModalRecSessions = new ModalRecSessions('modal-rec-sessions', popbox) 
  modalRecSessions.init()

  const modalHistory: ModalHistory = new ModalHistory('modal-history', popbox) 
  modalHistory.init()

  const modalNewsletter: ModalNewsletter = new ModalNewsletter('modal-newsletter', popbox) 
  modalNewsletter.init()

  const modalCookies: ModalCookies = new ModalCookies('modal-cookies', popbox) 
  modalCookies.init()

  if (Cookies.get('cookiesAccepted') !== 'true')
    modalCookies.popbox.open('modal-cookies')
  

  // Popup Products
  const products: NodeListOf<HTMLElement> = document.querySelectorAll('.modal-product')
  products.forEach((v: HTMLElement, k: number) => {
    if (v.dataset.popboxId !== undefined && v.dataset.popboxId !== '') {
      // console.log(`Create Modal Product`, v.dataset.popboxId)
      const modalProduct: ModalProduct = new ModalProduct(v.dataset.popboxId, popbox) 
      modalProduct.init()
    } else {
      console.error(`Modal Product has no id`, v)
    }
  })


  // Open homepage if no language in url
  function checkHomepage() {  
    
    // Check if country lang is in url
    const selected: HTMLElement | null | undefined = 
      popbox.find('modal-language')?.querySelector('.custom-option.selected')
    
    if (selected) {
      const l: string | undefined = selected.dataset.value
      // Lang est dans l'url, on commence l'experience
      if (l !== undefined && window.location.pathname.includes(l)) {
        // window.lang_url
        modalLanguage.init(false)
        startExp()
        return
      }
    }
    
    // Sinon on ouvre la popup language, même si il y a une langue dans l'url
    modalLanguage.init(true)

    // Go straight to game
    if (Constants.SKIP_HOMEPAGE)
      clickStart('fr-fr')
  }

  checkHomepage()
})