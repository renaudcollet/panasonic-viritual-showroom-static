import { ObjectData } from '../objects/ObjectData'

export default class ObjectsModel {
  private static instance: ObjectsModel

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() { } 

  public static getInstance(): ObjectsModel {
      if (!ObjectsModel.instance) {
          ObjectsModel.instance = new ObjectsModel()
      }

      return ObjectsModel.instance
  }

  private _aObjects: Array<ObjectData> = []
  private _aObjectsDict: Array<ObjectData> = []
  private _aObjectsPathDict: Array<ObjectData> = []

  public add(obj: ObjectData) {
    this._aObjects.push(obj)
    this._aObjectsDict[obj.id] = this._aObjects.length - 1
    this._aObjectsPathDict[obj.path] = this._aObjects.length - 1
  }

  public get():Array<ObjectData> {
    return this._aObjects
  }

  public getObjectById(id: string): ObjectData {
    return this._aObjects[this._aObjectsDict[id]]
  }

  public getObjectByPath(path: string): ObjectData {
    return this._aObjects[this._aObjectsPathDict[path]]
  }
}