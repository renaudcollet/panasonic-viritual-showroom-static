import { VOLUME_DEFAULT } from '../../const'
import {Howl, Howler} from 'howler'
import AudioData from './audio-data'
import { gsap } from 'gsap'

export default class AudioPlayer {

  private _aFiles: Array<AudioData> = [
    new AudioData({
      src: window.theme_path + 'audio/Nymphea_short.mp3',
      loop: true,
      howl: null
    })
    // new AudioData({
    //   src: window.theme_path + '/audio/Terraneans-96kbps-loop.mp3',
    //   loop: true,
    //   loop_max: 1, // Only if loop: true
    //   loop_count: 0,
    //   howl: null
    // })
  ]

  private _aAudioFromVideo: Map<string, GainNode> = new Map()
  private _nVideoHighestVolume: number = 0
  private _nAmbiantVolume: number = VOLUME_DEFAULT
  private _ambiantSoundId: number = -1

  private _playingId: number = 0
  private _soundIsOff: Boolean = false
  private _snd1: Howl
  private _oVolumeTween: any


  constructor() {}

  init() {
    Howler.volume(VOLUME_DEFAULT)
    
    this._snd1 = new Howl({
      src: this._aFiles[0].src,
      loop: this._aFiles[0].loop,
      html5: true,
      volume: VOLUME_DEFAULT,
      sprite: {
        ambiant: [0, 80000 - 100]
      }
    })
    this._aFiles[0].howl = this._snd1
    
    // const _snd2 = new Howl({
    //   src: this._aFiles[1].src,
    //   loop: this._aFiles[1].loop,
    //   html5: true
    // })
    // this._aFiles[1].howl = _snd2

    this._oVolumeTween = {t: Howler.volume()}
    
    const btn = document.querySelector('#btn-sound')
    btn?.addEventListener('click', this.toggleSound.bind(this))

    // this.playNextSound()
  }

  addAudioFromVideo(video: HTMLMediaElement, name: string) {
    const gainNode = Howler.ctx.createGain()
    const source = Howler.ctx.createMediaElementSource(video)
    source.connect(gainNode)
    gainNode.connect(Howler.masterGain)
    gainNode.gain.setValueAtTime(0, Howler.ctx.currentTime)
    this._aAudioFromVideo.set(name, gainNode)
  }

  setVolumePopupOpened() {
    this._oVolumeTween = {t: Howler.volume()}
    gsap.to(this._oVolumeTween, {duration: 1, t: 0, onUpdate: () => {
      Howler.volume(this._oVolumeTween.t)
    }})
  }

  setVolumePopupClosed() {
    if (!this._soundIsOff) {
      this._oVolumeTween = {t: 0}
      gsap.to(this._oVolumeTween, {duration: 1, t: VOLUME_DEFAULT, onUpdate: () => {
        Howler.volume(this._oVolumeTween.t)
      }})
    }
  }

  setVolumeForVideo(name: string, volume: number) {
    // console.log(`${name} volume: ${volume}`)
    this._aAudioFromVideo.get(name)?.gain.setValueAtTime(volume, Howler.ctx.currentTime)
    // @ts-ignore
    // this._aAudioFromVideo.get(name)?.gain.value = volume

    this._nVideoHighestVolume = 0
    this._aAudioFromVideo.forEach((gainNode: GainNode, key: string) => {
      // console.log(`   Each (${key}) ${gainNode.gain.value}`)
      if (gainNode.gain.value > this._nVideoHighestVolume) {
        if (key === name) this._nVideoHighestVolume = volume // because gain is not updated right away
        else this._nVideoHighestVolume = gainNode.gain.value
      }
    })

    this._nAmbiantVolume = VOLUME_DEFAULT - this._nVideoHighestVolume
    // console.log(`Highest: ${this._nVideoHighestVolume}, Ambiant: ${this._nAmbiantVolume}`)
    // console.log(`   ambiant vol: ${this._nAmbiantVolume}, vid highest vol: ${this._nVideoHighestVolume}`)
    this._snd1.volume(this._nAmbiantVolume)
  }

  playNextSound() {
    // If more than one ambiant sound
    if (this._aFiles.length > 1) {
      this._playingId++
      if(this._playingId === this._aFiles.length) 
        this._playingId = 0
    }

    this.playSound()
  }

  playSound() {
    const btn = document.querySelector('#btn-sound')
    btn?.classList.add('show')

    this._aFiles[this._playingId].howl?.once('loaderror', (a: any) => {
      console.error('Sound load error', a)
    })

    this._aFiles[this._playingId].howl?.once('playerror', (a: any, b: any) => {
      console.error('Sound play error', a, b)
    })

    // If more than one ambiant sound
    if (this._aFiles.length > 1) {
      this._aFiles[this._playingId].howl?.on('end', () => {
        const _data: AudioData = this._aFiles[this._playingId]
        if (_data.loop) {
          if(_data?.loop_count < _data.loop_max) {
            _data.loop_count++
          } else {
            _data.howl?.off('loaderror')
            _data.howl?.off('playerror')
            _data.howl?.off('end')
            _data.howl?.stop()
            this.playNextSound()
          }
        } else {
          _data.howl?.off('loaderror')
          _data.howl?.off('playerror')
          _data.howl?.off('end')
          this.playNextSound()
        }
      })
    }

    if (this._snd1) {
      // this._ambiantSoundId = this._aFiles[this._playingId].howl.play()
      this._ambiantSoundId = this._snd1.play('ambiant')
    }
  }
  
  toggleSound() {
    this._soundIsOff = !this._soundIsOff
    if (this._soundIsOff) {
      Howler.volume(0)
      // Howler.stop() // To stop completly file reading, better perf
      document.querySelector('.btn-sound__spectre')?.classList.add('mute')

      // Howler.ctx
      // Howler.masterGain.gain.setValueAtTime(0, Howler.ctx.currentTime)

    } else {
      document.querySelector('.btn-sound__spectre')?.classList.remove('mute')
      // this.playSound()
      Howler.volume(VOLUME_DEFAULT)
      // Howler.masterGain.gain.setValueAtTime(VOLUME_DEFAULT, Howler.ctx.currentTime)
    }
  }

}