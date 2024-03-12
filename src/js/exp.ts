// import "../css/main.scss"

import Preloader from './exp/preloader'
import Game from './exp/game'
// import * as AssetsDecor from './assets-decors'
import { ObjectData } from './exp/objects/ObjectData'
import { Object3D } from 'three'
import ModalProduct from './main/modal/modal-product'

// For debugging game
declare global {
  interface Window {
    game:any,
    theme_path: string,
    lang_ip: string,
    get_home_url: string,
    uploads_path: string,
    products_in_exp: Array<string>,
    products_videos: Array<any>,
    products_rec_sessions: Array<any>,
    products_rec_session_id: string,
    current_id_product: string,
    is_preview: boolean,

    // Analytics
    gtag: Function,
    dataLayer: Array<object>,

    // Popup product
    modalProduct: ModalProduct,
    currentProduct: Object3D,
    currentProductUpdate: Function
  }
}

const urlParams = new URLSearchParams(window.location.search)

// Autostart
if (urlParams.has('start')) {
  // console.log(`Auto start experience 3d`)  
  document.addEventListener("DOMContentLoaded", () => {
    // console.log(`DOMContentLoaded - start loading assets`)
    loadDatas(null)
  })
}


/**
 * App - The 3d Exp (loader for the 3d exp)
 */
export const game = new Game()
// window.game = game //For debugging only


/**
 * Load JSON
 * Note: the json is the complete list of all the product models available in B.O.
 * We need to filter it
 */
export function loadDatas(cbkComplete: Function | null) {
  // Assets JSON
  const jsons = [`datas.json?${Math.round(Math.random() * 1000000)}`]
  let assets: Array<string> = []
  jsons.forEach((j) => { assets.push(`${window.get_home_url + '/'}${j}`) })

  // const elLoader :any = document.querySelector('#main-loader')
  // const elLoaderProgress :any = document.querySelector('#main-loader-progress')

  function onProgressLoader(e: any) { /* elLoaderProgress.style.width = `${e * 100}%` */ }
  function onCompleteLoader(e: any) {
    // elLoader.style.display = 'none'
    // console.log(`%cjson`, 'font-weight: bold', e.data)
    // loadModels(e.data.models, cbkComplete)
    
    // Gather objects to load
    const aModels: Array<object> = []
  
    Object.values(e.data.decors).forEach((model: any) => { 
      (<ObjectData>model).category = ObjectData.CATEGORY_DECOR
      aModels.push(model)
    });

    Object.values(e.data.products).forEach((model: any) => { 
      // Filter for products used in exp
      if (window.products_in_exp[model.id]) {
        (<ObjectData>model).category = ObjectData.CATEGORY_PRODUCT
        aModels.push(model)
      }
    })

    loadModels(aModels, cbkComplete)
  }

  /* const preloader =  */new Preloader(
    assets,
    onProgressLoader,
    onCompleteLoader
  )
}


/**
 * Load Models
 * @param aModels 
 * @param cbkComplete 
 */
export function loadModels(aModels: Array<object>, cbkComplete: Function | null) {
  
  const bMobile: boolean = window.matchMedia(`(max-width: 1025px)`).matches

  let assets: Array<string> = []
  let aModelsDevice: Array<object> = []
  aModels.forEach((model: any) => { 

    // Check if it should be loaded based on the device
    if (model.device === 'mobile' && !bMobile 
      || model.device === 'desktop' && bMobile) {
      console.log(`>>> Escaping asset for ${model.device}`, model.path);
      return false
    }
    
    console.log(`>>> Adding asset for ${model.device}`, model.path);
    // assets.push(model.path) 
    model.id = `${model.id}` // Need this because id should be a string

    if (model.device) {
      if (bMobile) model.texture = model['texture-small']
      // assets.push(model.texture)
    }

    // If modal has textures, load them too
    if (model.texture) {
      if (bMobile && model['texture-small'] !== false)  
        model.texture = model['texture-small']
      // assets.push(model.texture)
    }

    if (model.ao) {
      if (bMobile) model.ao = model['ao-small']
      // assets.push(model.ao)
    }

    if (model.bump) {
      if (bMobile) model.bump = model['bump-small']
      // assets.push(model.bump)
    }

    if (model.metalness) {
      if (bMobile) model.metalness = model['metalness-small']
      // assets.push(model.metalness)
    }

    if (model.roughness) {
      if (bMobile) model.roughness = model['roughness-small']
      // assets.push(model.roughness)
    }

    if (model.alpha) {
      if (bMobile) model.alpha = model['alpha-small']
      // assets.push(model.alpha)
    }

    aModelsDevice.push(model)

  })

  // const elLoader :any = document.querySelector('#main-loader')
  const elLoaderProgress :any = document.getElementById('main-loader-progress')
  const elLoaderPercent :any = document.getElementById('main-loader-percent')
  // const elLoaderPrepare :any = document.getElementById('main-loader-prepare')

  function onProgressLoader(e: any) { 
    elLoaderProgress.style.width = `${(e || 0) * 100}%` 
    elLoaderPercent.innerHTML = `${Math.round((e || 0) * 100)}%`
  }

  function onCompleteLoader() {
    // elLoader.style.display = 'none'
    // elLoaderPercent.style.display = 'none'
    // elLoaderPrepare.style.display = 'block'

    if (cbkComplete) {
      game.init(aModelsDevice /* aModels */, cbkComplete)
    } else {
      console.error('Models loaded, no callback assigned')
    }
    // game.animate()

    // Callback to hide loading screen
    // if (cbkComplete) {
    //   cbkComplete()
    // }
  }

  // We are escaping this preloader
  onCompleteLoader()
  return;

 /*  const preloader =  */new Preloader(
    assets,
    onProgressLoader,
    onCompleteLoader
  )
}

// window.onerror = function (error: any) {
//   console.error(JSON.stringify(error))
// }