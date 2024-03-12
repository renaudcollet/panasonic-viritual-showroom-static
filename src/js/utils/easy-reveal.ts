import gsap from "gsap/all";

export default class EasyReveal {

  public list: Array<HTMLElement>
  public delay: number = 0.2 // delay between apparitions
  public duration: number = 0.33 // delay between apparitions

  constructor(elToQueryIn: HTMLElement) {
    this.list = []
    let id: string | undefined
    elToQueryIn.querySelectorAll('[data-easy-reveal]').forEach((el: any) => {
      id = (<HTMLElement>el).dataset.easyReveal
      if (id)
        this.list[parseInt(id)] = el
      this._resetEl(el)
    })
  }

  private _resetEl(el: Element) {
    gsap.killTweensOf(el)
    gsap.set(el, {opacity: 0, y: '+=10'})
  }

  reset() {
    this.list.forEach((el: Element) => {
      this._resetEl(el)
    })
  }

  play(delay: number = 0) {
    let i: number = 0
    this.list.forEach((el: Element) => {
      gsap.killTweensOf(el)
      gsap.to(el, {opacity: 1, y: '-=10', delay: delay + this.delay * i, duration: this.duration})
      ++i
    })
  }
}