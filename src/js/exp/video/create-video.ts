import { VOLUME_DEFAULT } from "../../const"

export default class CreateVideo {

  public elVideo
  public name: string

  constructor(file: string, poster: string, name: string) {
    console.log(`Create video el for ${name}`, file, poster)
    this.name = name
    this.elVideo = document.createElement('video')
    // elVideo.poster = poster // not used by threejs
    // elVideo.autoplay = true
    this.elVideo.loop = true
    this.elVideo.muted = false
    this.elVideo.preload = 'none'

    this.elVideo.playsInline = true
    this.elVideo.className = 'video-texture'
    this.elVideo.volume = VOLUME_DEFAULT

    const source = document.createElement('source')
    source.src = file //'http://pvs.local/data/uploads/2021/04/video-test.mp4'
    source.type = 'video/mp4'
    this.elVideo.appendChild(source)
    document.body.appendChild(this.elVideo)
  }
}