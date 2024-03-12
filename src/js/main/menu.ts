export default class Menu {

  private btnBurger: any
  private menu: any

  constructor() {
    this.menu = document.querySelector('#menu')
    this.addBurgerButtonEvent()
    this.addMenuEvent()
  }

  addBurgerButtonEvent() {
    this.btnBurger = this.menu.querySelector('.btn-burger')
    this.btnBurger.addEventListener('click', () => {
      if (this.menu.classList.contains('open')) {
        this.menu.classList.remove('open')
      } else {
        this.menu.classList.add('open')
      }
    })
  }

  addMenuEvent() {
    const aItems = this.menu.querySelectorAll('.menu-item')
    for (let i = 0; i < aItems.length; i++) {
      const el = aItems[i]
      el.addEventListener('click', this.onClickItem.bind(this))
    }
  }

  onClickItem(e: any) {
    // Using popbox to open modals
    // And closing the menu
    if (this.menu.classList.contains('open')) {
      this.menu.classList.remove('open')
    }
  }
}