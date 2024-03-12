import { Euler, PerspectiveCamera, Vector2, Vector3 } from 'three'
import * as Optimizer from '../../utils/Optimizer'

export default class FirstPerson {

	private camera: PerspectiveCamera
	private domElement: any
	private game: any
	private moved: any

	public enabled: boolean = true
	public onMove: any
	public onPan: any

	// "target" sets the location of focus, where the object orbits around
	public target: Vector3 = new Vector3(0, 1, 0)

	private mousePosition: any 
	private offset: Vector3 = new Vector3()

	// Set to false to disable panning
	private panSpeed: number = 1.0

	private _shouldPan: boolean = false
	public isPanning: boolean = false

	private panStart = new Vector2()
	private panEnd = new Vector2()
	private panDelta = new Vector2()

	// current position in spherical coordinates
	// private quat: Quaternion

	
	constructor(domElement: any, camera: PerspectiveCamera, options: any) {
		this.camera = camera
		this.domElement = domElement // chip-container   (old: //window //thumb)
		this.onMove = options.onMove
		this.onPan = options.onPan || null
		this.game = options.game
		this.moved = false
		
		// so camera.up is the orbit axis
		// this.quat = new Quaternion().setFromUnitVectors( this.camera.up, new Vector3( 0, 1, 0 ) )
		// this.quatInverse = this.quat.clone().invert()

		/**
		 * This is only used for PAN and ROTATE,
		 * For the move to a point, see Game > onPointerUp
		 */

		if (this.domElement != undefined) {
			if ('ontouchstart' in window) {
				this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), {passive: true})
				this.domElement.addEventListener('touchend', this.up.bind(this), {passive: true})
			} else {
				this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
				// this.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this), {passive: true})
				this.domElement.addEventListener('wheel', Optimizer.throttle(this.onMouseWheel.bind(this)), {passive: true})
				// this.domElement.addEventListener('mouseup', this.up.bind(this))
				document.addEventListener('mouseup', this.up.bind(this))
			}
		}
	}

	/**
	 * Pinch
	 */
	private prevDiff = 0

	onTouchStart(e: any) {	
		// console.log(`TOUCH START`, e.TargetTouches);
		
    if (e.targetTouches && e.targetTouches.length > 1) {
			this._shouldPan = true
			this.isPanning = true
			
    } else {
			this._shouldPan = false
    }
		
		this.tap(e)
	}

	onMouseDown(e: any) {	
		// console.log(`FirstPerson - mousedown`, e.path)
		
		// Note: Might remove this for production
		// Check if other element is clicked, starting from end
		// Escaping the 4 last elements (window, doc, html, body)
		

		// Seems not needed anymore, listeners are on chip-container 
    /* if (e.target && (e.target as HTMLElement).matches('div.nav-rooms')) {
			console.log(`CLICKED NAV ROOMS`);
		}
		
    if (e.target && (e.target as HTMLElement).matches('div.dg')) {
			console.log(`CLICKED DAT.GUI`);
		}

		// Note: Check path on safari and firefox
		const n = e.path.length
		let c
		for (let i = n - 5; i > -1; --i) {
			// console.log(e.path[i])
			
			c = e.path[i].classList
			if (c.contains('nav-rooms'))
				return
			if (c.contains('dg'))
				return
		} */

		switch(e.button) {
			case 0: // left click
				this._shouldPan = false
				break
			case 1: // wheel click
				this._shouldPan = true
				this.panStart.set(e.clientX, e.clientY)
				break
			case 2: // right click
				// this._shouldPan = true
				this._shouldPan = false
				// this.panStart.set(e.clientX, e.clientY)
				break
			default:
				console.warn('Unknown clicked button', e)
		}
		this.tap(e)
	}

	getMousePosition(evt: any): any {
		let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
		let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
		return { x: clientX, y: clientY };
	}

	tap(evt: any) {
		evt = evt || window.event
		
		// get the mouse cursor position at startup:
		this.mousePosition = this.getMousePosition(evt)
		this.moved = false
		// console.log(`Start pan - camera:`, this.camera.position)
		
		if ('ontouchstart' in window) {
			if (this._shouldPan)
				this.domElement.ontouchmove = this.handleTouchPan.bind(this)
			else
				this.domElement.ontouchmove = this.move.bind(this)
			// this.domElement.ontouchend = this.up.bind(this)
		} else {
			if (this._shouldPan)
				this.domElement.onmousemove = this.handleMouseMovePan.bind(this)
			else 
				this.domElement.onmousemove = this.move.bind(this)
			// this.domElement.onmouseup = this.up.bind(this)
		}
	}

	move(evt: any) {
		if (!this.enabled)
			return

		// console.log(`FirstPerson - move()`)
		evt = evt || window.event
		const mouse = this.getMousePosition(evt)
		this.moved = true

		// calculate the cursor delta from where click started
		let left = mouse.x - this.mousePosition.x
		let top = mouse.y - this.mousePosition.y

    this.mousePosition = mouse
    
    // Normalize from center
    // const leftNormalize = mouse.x / window.innerWidth * 2 - 1
    // const topNormalize = -(mouse.y / window.innerHeight * 2 - 1)

    // Normalize from left
    const leftNormalize = left / window.innerWidth
    const topNormalize = top / window.innerHeight

		this.onMove.call(this.game, leftNormalize, topNormalize)
	}

	up(evt: any) {
		if ('ontouchstart' in window) {
			this.domElement.ontouchmove = null;
			this.domElement.ontouchend = null;
		} else {
			this.domElement.onmousemove = null;
			this.domElement.onmouseup = null;
		}

		this.prevDiff = 0

		if (this._shouldPan && evt.targetTouches && evt.targetTouches.length === 0) {
			this._shouldPan = false
			this.isPanning = false
		}

		if (!this.moved) {
			// this.moveToPoint(evt);
		}
		
		// this.onMove.call(this.game, 0, 0, 0);
	}


	/**
	 * PAN
	 */
	onMouseWheel(e: any) {
		if (!this.enabled)
			return
			
		this.pan( 0, e.deltaY / 10 )
		this.onPan.call(this.game, this.offset, true, e.deltaY < 0)
	}

	handleTouchPan( event: any ) {
		// Si deux pointeurs sont utilisés, vérifie le geste de pincement
		if (event.targetTouches && event.targetTouches.length > 1) {

			// Calcule la distance entre les deux pointeurs
			var curDiff = Math.abs(event.targetTouches[0].clientX - event.targetTouches[1].clientX)
			// console.log(`		curDiff`, curDiff)
			let delta = 0
	 
			// if (this.prevDiff > 0) {
				if (curDiff > this.prevDiff) {
					// La distance entre les deux pointeurs a augmenté
					// console.log('Pinch moving OUT -> Zoom in', event)
					delta = -10
				}
				if (curDiff < this.prevDiff) {
					// La distance entre les deux pointeurs a diminué
					// console.log('Pinch moving IN -> Zoom out', event)
					delta = 10
				}
			// }
	 
			// Met en cache la distance pour les événements suivants
			this.prevDiff = curDiff

			// console.log(`prevDiff`, this.prevDiff);
			
			this.pan( 0, delta )
			this.onPan.call(this.game, this.offset, true, delta < 0)

			// After one pinch, remove listener
			this.up.bind(this)
		}
	}

	handleMouseMovePan( event: any ) {
		this.panEnd.set( event.clientX, event.clientY )
		
		this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed )

		this.pan( -this.panDelta.x, -this.panDelta.y )

		this.panStart.copy( this.panEnd )

		this.onPan.call(this.game, this.offset)
	}

	pan( deltaX: number, deltaY: number ) {
		// console.log(`pan(${deltaX}, ${deltaY})`)		
		this.offset.copy( this.camera.position )

		let vDelta: Vector3 = new Vector3(deltaX, 0, deltaY)
		vDelta.applyEuler(new Euler(0, this.camera.rotation.y, 0))
		
		this.offset.add( vDelta )
	}


	/* 
		moveToPoint(evt) {
		const _mouse = this.getMousePosition(evt);
		console.log(`moveToPoint`, _mouse);
			
		const pos = this.game.player.object.position.clone();
		pos.y += 60;
		let dir = new THREE.Vector3();
		this.game.player.object.getWorldDirection(dir);

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(_mouse, this.game.camera);
		
		for (let box of this.game.environmentProxy.children) {
			const intersect = raycaster.intersectObject(box);
			if (intersect.length > 0) {
				console.log(`Click intersect with box`, intersect[0]);
				
				// const forward = -(top - this.origin.top + this.domElement.innerHeight / 2) / this.maxRadius;

				// Get the angle between player and intersection
				const _startV = this.game.player.object.position;
				const _endV = intersect[0].point;
				console.log(`Get angle between`, _startV, _endV);
				
				// Rotate player to angle
				// const _angle = _startV.angleTo(_endV);
				const _angle = Math.atan2(_endV.z - _startV.z, _endV.x - _startV.x);
				console.log(`Rotate to angle: ${_angle} (${_angle * 180/Math.PI}°)`);

				// // Translate player toward point
				// console.log(`Translate to ${intersect[0].}`) 

				const forward = 0;
				const turn = 0; //(left - this.origin.left + this.domElement.innerWidth / 2) / this.maxRadius;
				const pitch = 0;

				this.onMove.call(this.game, forward, turn, pitch);
				break;
			}
		}
	} 
	*/
}

