import Popbox from '../ui/popbox'
import ModalBase from './modal-base'

export default class ModalLanguage extends ModalBase {

  public language: string | undefined

  constructor(id: string, popbox: Popbox, onStartCallback: Function) {
    super(id, popbox)

    // Start button
    const modal: HTMLElement | null = popbox.find(this.id)
    if (modal) {
      const btnStart: HTMLElement | null = modal?.querySelector('.js-btn-start')
      btnStart?.addEventListener('click', this.onClickStart.bind(this, onStartCallback))

      // Select dropdown
      this.initDropdown(modal)
    }
  }

  onClickStart(cbk: Function) {
    cbk(this.language)
  }

  init(open : boolean = false) {
    super.init(open)

    if (open) {
      // Hide close button, we are in the homepage / language
      this.popbox.find(this.id)?.querySelector('.btn-close')?.classList.add('hide')
    }
  }

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
      eventLabel: 'Language'  // name of the clicked navigation item 
    })
  }

  onClosed() {
    super.onClosed()
    // console.log(`Closed About`)
    // Hide close button
    this.popbox.find(this.id)?.querySelector('.btn-close')?.classList.remove('hide')
  }

  /**
   * Dropdown
   */
  initDropdown(modal: HTMLElement) {    

    // Get custom dropdown
    const dropdown = modal.querySelector('.custom-select-wrapper')
    if (dropdown) {
      dropdown.addEventListener('click', function() {
        dropdown.querySelector('.custom-select')?.classList.toggle('open')
      })
    }

    // Select option
    for (const option of modal.querySelectorAll('.custom-option')) {
      // Add click events
      option.addEventListener('click', (e: any) => {
        if (!e.target.classList.contains('selected')) {
          e.target.parentNode.querySelector('.custom-option.selected').classList.remove('selected')
          e.target.classList.add('selected')
          e.target.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = e.target.textContent
          this.language = e.target.dataset.value
        }
      })
      // Show the selected option
      if (option && option.classList.contains('selected')) {
        const custom = option.closest('.custom-select')
        const span = custom?.querySelector('.custom-select__trigger span')
        this.language = (option as HTMLElement).dataset.value
        if(span)
          span.textContent = option.textContent
      }
    }
  
    // Close dropdowns when click outside
    window.addEventListener('click', function(e: any) {
      const select = modal.querySelector('.custom-select')
      if (!select?.contains(e.target)) {
        select?.classList.remove('open')
      }
    })
  }
  
}