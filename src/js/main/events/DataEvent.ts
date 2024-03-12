export default class DataEvent extends Event {
  
  public static ON_DATA: string = 'ON_DATA'
  private _data: any
  private _target: any

  constructor(type: string, data: any) {
    super(type, undefined)
    this._data = data
  }

  public get data(): any {
    return this._data
  }

  public get target(): any {
    return this._target
  }

  public set target(t: any) {
    this._target = t
  }
}