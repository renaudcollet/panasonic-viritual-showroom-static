/**
 * https://github.com/oncebot/popbox.js
 */

/**
 * Renaud own implementation
 * By default the popbox not stackable
 * If you want to make a modal stackable, add `data-popbox-stackable`
 */

export default class Popbox {
  private currently_opened: any

  constructor(config = { blur: false }) {
    this.currently_opened = []
    if ('blur' in config) {
      if (config.blur) {
        var main_content = document.querySelector('.popbox_main_content')
        if (main_content) {
          main_content.classList.add('popbox_blur')
        }
      }
    }
    this.bindEvents()
  }

  bindEvents() {
    const triggers = document.querySelectorAll('[data-popbox-target]')
    const closers = document.querySelectorAll('[data-popbox-close]')
    const popboxs = document.querySelectorAll('[data-popbox-id]')
    let self = this
    if (triggers) {
      for (let i = 0; i < triggers.length; i++) {
        triggers[i].addEventListener('click', function (this: HTMLElement, e: any) {
            e.preventDefault()
            const popbox_id = this.getAttribute('data-popbox-target') || ''
            if (popbox_id) {
              self.clear()
              self.open(popbox_id)
            }
          },
          false
        )
      }
    }
    if (closers) {
      for (var i = 0; i < closers.length; i++) {
        closers[i].addEventListener(
          'click',
          function (this: HTMLElement, e: any) {
            e.preventDefault()
            var popbox_id = this.getAttribute('data-popbox-close')
            if (popbox_id) {
              self.close(popbox_id)
            }
          },
          false
        )
      }
    }
    if (popboxs) {
      for (var i = 0; i < popboxs.length; i++) {
        popboxs[i].addEventListener('click', function (this: HTMLElement, e: any) {
          var popbox_id = e.target.getAttribute('data-popbox-id')
          if (popbox_id) {
              e.preventDefault()
							self.close(popbox_id)
						}
					},
					false
        )
        popboxs[i].addEventListener('transitionend', function (this: HTMLElement, e: any) {
          if (
            this.classList.contains('opened') &&
            !this.classList.contains('visible')
          ) {
            this.classList.remove('opened')
          }
        })
      }
    }
    document.addEventListener('keyup', function (e) {
      if (self.current(true) && e.keyCode == 27) {
        self.close(self.current(true))
      }
    })
  }

  opened(popbox: HTMLElement) {
    if (popbox) {
      var event = new CustomEvent('popbox_opened', {
        bubbles: true,
        detail: { popbox: popbox },
      })
      popbox.dispatchEvent(event)
    }
  }

  opening(popbox: HTMLElement) {
    if (popbox) {
      var event = new CustomEvent('popbox_opening', {
        bubbles: true,
        detail: { popbox: popbox },
      });
      popbox.dispatchEvent(event);
    }
  }

  closing(popbox: HTMLElement) {
    if (popbox) {
      var event = new CustomEvent('popbox_closing', {
        bubbles: true,
        detail: { popbox: popbox },
      });
      popbox.dispatchEvent(event);
    }
  }

  closed(popbox: HTMLElement) {
    if (popbox) {
      var event = new CustomEvent('popbox_closed', {
        bubbles: true,
        detail: { popbox },
      });
      popbox.dispatchEvent(event);
    }
  }

  current(last = false) {
    if (last) {
      let current = null
      if (this.currently_opened.length) {
        current = this.currently_opened[this.currently_opened.length - 1]
      }
      return current
    } else {
      return this.currently_opened
    }
  }

  add(popbox: string) {
    var popbox_id = this.getId(popbox) || ''
    this.remove(popbox_id)
    this.currently_opened.push(popbox_id)
  }

  remove(popbox: string) {
    var popbox_id = this.getId(popbox)
    var index = this.currently_opened.indexOf(popbox_id)
    if (index > -1) {
      this.currently_opened.splice(index, 1)
    }
  }

  zIndex() {
    let zindex = 9999
    let last = this.current(true)
    if (last) {
      last = this.find(last)
      if (last) {
        zindex = parseInt(last.style.zIndex)
      }
		}
    return zindex
  }

  find(popbox_id: string) {
    var popbox = this.select(`[data-popbox-id="${popbox_id}"]`)
    // var popbox = this.select('[data-popbox-id="' + popbox_id + '"]')
    return popbox
  }

  select(selector: string): HTMLElement | null {
    return document.querySelector(selector)
  }

  clear() {
    var popboxes: NodeListOf<HTMLElement> = document.querySelectorAll(
      '[data-popbox-id].opened:not([data-popbox-stackable])'
    )
    for (var i = 0; i < popboxes.length; i++) {
      this.close(popboxes[i])
    }
    this.currently_opened = []
    const _html = this.select('html')
    if (_html) {
      _html.classList.remove('popbox_locked')
      _html.removeAttribute('popbox')
    }
  }

  close(popbox: HTMLElement | string) {
    const popbox_id = this.getId(popbox) || ''
    let _popbox = this.getpopbox(popbox)

    if (_popbox) {
      this.closing(_popbox)

      // Renaud added a setTimeout
      setTimeout(() => {
        this.remove(popbox_id)
        _popbox.classList.remove('visible')
        _popbox.style.zIndex = '-999'

        const _html = this.select('html')
        if (_html && this.currently_opened.length == 0) {
          _html.classList.remove('popbox_locked')
        }
        if (_html && this.current(true)) {
          _html.setAttribute('popbox', this.current(true))
        } else if (_html) {
          _html.removeAttribute('popbox')
        }
        this.closed(_popbox)
      }, 800)
    }
  }
	
  getpopbox(popbox: HTMLElement | string): HTMLElement {
    if (popbox instanceof HTMLElement) {
      return popbox;
    } else {
      return this.find(popbox) as HTMLElement;
    }
  }

  getId(popbox: any): string | null {
    if (popbox instanceof HTMLElement) {
      return popbox.getAttribute('data-popbox-id');
    } else {
      return popbox;
    }
  }

  open(popbox: string) {
    const popbox_id = this.getId(popbox) || ''
    let _popbox = this.getpopbox(popbox)

    if (_popbox) {
      this.opening(_popbox)
      _popbox.style.zIndex = `${this.zIndex() + 1}`
      _popbox.classList.add('opened')
      setTimeout(function () {
        _popbox.classList.add('visible')
      })
      const _html = this.select('html')
      if (_html) {
        _html.classList.add('popbox_locked')
        _html.setAttribute('popbox', popbox_id)
      }
      this.add(popbox_id)
      this.opened(_popbox)
    }
  }
}
