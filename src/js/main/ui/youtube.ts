/**
 * YOUTUBE
 * This initialize youtube iframe, then you can listen for events on window
 * Act like a singleton
 */


declare global {
  interface Window {
    yt_videoPlayer: any,
    yt_apiReady: boolean,
    initYoutube: any, // Function
    onYouTubeIframeAPIReady: any, // Function
    createPlayer: any // Function
  }
}

export default class Youtube {

  public idVideo: string
  public elPlayer: HTMLElement
  public yt_videoPlayer: YT.Player

  constructor() {
    if (window.yt_apiReady) {
      console.warn(`YT - api is already initialized ! You can create players`)
      return
    }
    
    window.yt_apiReady = false

    // console.log(`YT - Init youtube script iframe api`);
    
    // Add api script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.id = 'scriptApi'
    const firstScriptTag: HTMLScriptElement | null = document.getElementsByTagName('script')[0]
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    // Callback used by youtube
    window.onYouTubeIframeAPIReady = function () {
      // console.log(`YT - onYouTubeIframeAPIReady() `)
      window.yt_apiReady = true
    }
  }

  createPlayer(elPlayer: HTMLElement, id: string | '') {
    this.elPlayer = elPlayer
    this.idVideo = id !== '' ? id : '5B1rwNWOy0g'
    // const elPlayer: HTMLElement | null = document.getElementById('onlinePlayer')
    if (elPlayer) {
      const opt: any = {
        videoId: this.idVideo,
        playerVars: {
          playsinline: '0',
          modestbranding: '0',
          showinfo: '0',
          controls: '1',
          autoplay: 1,
          color: 'white',
          enablejsapi: '0',
          autohide: '1',
          rel: '0',
        },
        // events: {
        //   onReady: () => {
        //     console.log(`YT - ${id} onReady`)
        //     if (this.yt_videoPlayer && !this.yt_videoPlayer.isMuted()) {

        //       this.yt_videoPlayer.mute()
        //       console.log(`MUTE YOUTUBE`);
              
        //     }
        //     elPlayer.dispatchEvent(new CustomEvent('onPlayerReady'))
        //   },
        //   onError: function (e: any) {
        //     console.log(`YT - ${id} onError`, e)
        //     elPlayer.dispatchEvent(new CustomEvent('onPlayerError'))
        //   },
        //   onStateChange: (e: any) => {
        //     console.log(`YT - ${id} onStateChange`, e)        

        //     if (e.data == YT.PlayerState.PLAYING /* && !done */) {
        //       /* done = true */
        //       this.yt_videoPlayer.mute()
        //     }

        //     elPlayer.dispatchEvent(new CustomEvent('onPlayerStateChange'))
        //   },
        //   onPlaybackQualityChange: function () {
        //     elPlayer.dispatchEvent(new CustomEvent('onPlaybackQualityChange'))
        //   },
        // },
      }
      this.yt_videoPlayer = new YT.Player(elPlayer, opt)
      this.yt_videoPlayer.addEventListener('onReady', this.onReady.bind(this))
      this.yt_videoPlayer.addEventListener('onError', this.onError.bind(this))
      this.yt_videoPlayer.addEventListener('onStateChange', this.onStateChange.bind(this))
      
    } else {
      console.error(`Youtube - element is null`, elPlayer)
    }
  }

  
  onReady(e: any) {
    // console.log(`YT - ${this.idVideo} onReady`, e)
    e.target.mute()
    this.elPlayer.dispatchEvent(new CustomEvent('onPlayerReady'))
  }

  onError(e: any) {
    // console.log(`YT - ${this.idVideo} onError`, e)
    this.elPlayer.dispatchEvent(new CustomEvent('onPlayerError'))
  }

  onStateChange(e: any) {
    // console.log(`YT - ${this.idVideo} onStateChange`, e)        

    // if (e.data == YT.PlayerState.PLAYING /* && !done */) {
    //   /* done = true */
    //   this.yt_videoPlayer.mute()
    // }

    this.elPlayer.dispatchEvent(new CustomEvent('onPlayerStateChange'))
  }

  onPlaybackQualityChange() {
    this.elPlayer.dispatchEvent(new CustomEvent('onPlaybackQualityChange'))
  }

  start(idVideo: string) {
    if (this.yt_videoPlayer) {
      this.idVideo = idVideo
      this.yt_videoPlayer.loadVideoById(this.idVideo)
      this.play()
    }
  }

  play() {
    if (this.yt_videoPlayer) {
      this.yt_videoPlayer.playVideo()
    }
  }

  pause() {
    if (this.yt_videoPlayer) {
      this.yt_videoPlayer.pauseVideo()
    }
  }

  stop() {
    if (this.yt_videoPlayer && typeof this.yt_videoPlayer.stopVideo !== 'undefined') {
      this.yt_videoPlayer.stopVideo()
    }
  }
  
  destroy() {

  }

  destroyYoutube() {
    const elScript: HTMLElement | null = document.getElementById('scriptApi')
    if (elScript) {
      elScript.remove()
    }
    window.removeEventListener('onYouTubeIframeAPIReady', window.onYouTubeIframeAPIReady)
    window.onYouTubeIframeAPIReady = null
  }

  // Not used ?
  addListeners() {
    window.addEventListener('onPlayerReady', this.onPlayerReady)
    window.addEventListener('onPlayerStateChange', this.onPlayerStateChange)
    window.addEventListener('onPlayerError', this.onPlayerError)
    // window.addEventListener('resize', this.resizePlayer)
  }

  // Not used ?
  removeListeners() {
    window.removeEventListener('onPlayerReady', this.onPlayerReady)
    window.removeEventListener('onPlayerStateChange', this.onPlayerStateChange)
    window.removeEventListener('onPlayerError', this.onPlayerError)
    // window.removeEventListener('resize', this.resizePlayer)
    window.removeEventListener('onYouTubeIframeAPIReady', window.onYouTubeIframeAPIReady)
  }

  
  onPlayerReady() {
    console.info('▶▶  onPlayerReady ', this.yt_videoPlayer)
  }

  onPlayerStateChange(event: any) {
    console.info('▶▶  onPlayerStateChange', event)
  }

  onPlayerError(event: any) {
    console.warn('▶▶  onPlayerError', event)
  }
}