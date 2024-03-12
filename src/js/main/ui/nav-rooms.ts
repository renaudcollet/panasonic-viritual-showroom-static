// import * as Constants from '../../const'
import gsap from 'gsap'
import { EventDispatcher } from 'three'
import DataEvent from '../events/DataEvent'

export default class NavRooms extends EventDispatcher {

  private nav: HTMLElement | null

  constructor() {
    super()
    this.nav = document.getElementById('nav-rooms')
    this.nav?.addEventListener('click', (evt: MouseEvent) => {
      if (evt.target && (evt.target as HTMLElement).matches('li')) {
        const id: string | undefined = (evt.target as HTMLElement).dataset.roomId
        if (id !== undefined) {
          this.dispatchEvent(new DataEvent('ON_DATA', { id }))
          
          //
          // Analytics
          //
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'gaEvent',
            eventCategory:'Navigation',
            eventAction: 'Bottom',
            eventLabel: `${id}` // name of the clicked room
          })
        }
      }
      
    })
  }

  show() {
    gsap.to(this.nav, {autoAlpha: 1})
  }

  hide() {
    gsap.to(this.nav, {autoAlpha: 0})
  }

  zTop() {
    this.nav?.classList.add('z-top')
  }

  zDefault() {
    this.nav?.classList.remove('z-top')
  }
}