import { Howl } from 'howler'

export default class AudioData {
  public src: string
  public loop: boolean // loop = 1, means sound played twice
  public loop_max: number | 0
  public loop_count: number | 0
  public howl?: Howl | null

  constructor(params: any) {
    this.src = params['src']
    this.loop = params['loop']
    this.loop_max = params['loop_max'] | 0
    this.loop_count = params['loop_count'] | 0
    this.howl = params['howl']
  }
} 