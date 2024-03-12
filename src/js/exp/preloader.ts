import axios from "axios";

export default class Preloader {
  private assets: Array<object>;
  private onProgress: Function;
  private onComplete: Function;

  constructor(assets: Array<any>, onProgress: Function, onComplete: Function) {
    this.assets = []
    // console.groupCollapsed(`Preloader, ${assets.length} assets to load into cache`);
    this.onProgress = onProgress
    this.onComplete = onComplete

    for (const asset of assets) {
      // console.log(`   `, asset);
      this.assets[asset] = { loaded: 0, complete: false }
      this.load(asset)
    }
  }

  load(url: string) {
    axios
      .get(url, { onDownloadProgress: (e) => {
        const asset = this.assets[url]
        asset.loaded = e.loaded
        asset.total = e.total
        this.onProgress(this.progress)
      }})
      .then((response) => {
        // console.log(`Loaded `, response.config.url)
        this.assets[url].complete = true
        if (this.checkCompleted()) {
          this.onComplete(response)
        }
      })
      .catch((e) => {
        console.error(`Error`, e)
      });
  }

  checkCompleted() {
    let asset: any
    for (const prop in this.assets) {
      asset = this.assets[prop]
      if (!asset.complete) return false
    }
    // console.groupEnd()
    return true
  }

  get progress() :number {
    let total = 0
    let loaded = 0
    let asset: any
    // console.group('progress')
    for (const prop in this.assets) {
      asset = this.assets[prop]
      // console.log(asset)
      
      if (asset.total === undefined) {
        // loaded = 0
        asset.loaded = 0
        asset.total = 50000
        // break
      }
      loaded += asset.loaded
      total += asset.total
    }

    // console.log('progress', loaded / total)
    
    // console.groupEnd()

    return loaded / total
  }
}
