import * as THREE from "../thirdParty/build/three.module.js";
import {Events} from "./Constants.js";
/*  EventManager
 *
 *  Once in here, we have the following 3 outcomes:
 *  1) It's the end of a single click (fire event 1)
 *  2) It's the end of a double click (fire event 2)
 *
 *  3) It's the end of a drag (do nothing) // --------- TODO: WILL IMPLEMENT LATER
 *  We allow a double-click to "keep" the first single click, as this will simply
 *  select the object, and flying into an object that's currently selected makes
 *  sense, but the second click in the double click will not fire a single-click
 *  event.
 *
 * */

function EventDispatcher(app) {
    this.container = app.container;
    this.app = app;

    // private
    this.timeSincelastMouseup = null;
    this.ignoreNextSingleClick = false;
    this.onDownPosition = new THREE.Vector2();
    this.onUpPosition = new THREE.Vector2();
    this.onDoubleClickPosition = new THREE.Vector2();
    this.lastPosition = new THREE.Vector2();

    // mouseHover timing
    this.timeSinceLastMouseMove = null;
    this.enableMouseMove = false;
    this.container.dom.addEventListener("mousedown", this.mouseDownCB.bind(this), false);
    this.container.dom.addEventListener("mouseup", this.mouseUpCB.bind(this), false);
    this.container.dom.addEventListener("mousemove", this.mouseMove.bind(this), false);
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);

}

EventDispatcher.prototype = Object.assign(Object.create(EventDispatcher.prototype), {


    constructor: EventDispatcher,

    getMousePosition: function(domElement, x, y) {
        var rect = domElement.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    },


    mouseDownCB: function(event) {
        var array = this.getMousePosition(this.container.dom, event.clientX, event.clientY);
        this.onDownPosition.fromArray(array);

        this.lastPosition.x = this.onDownPosition.x;
        this.lastPosition.y = this.onDownPosition.y;
    },

    mouseUpCB: function(event) {
        let array = this.getMousePosition(this.container.dom, event.clientX, event.clientY);
        this.onUpPosition.fromArray(array);

        let now = new Date();
        switch (event.button) {
            case 0:
                if (now - this.timeSinceLastMouseUp < 400) {
                    // Fire double click event:
                    this.ignoreNextSingleClick = true;
                    this.doubleClickEvent(event);
                }
                if (this.ignoreNextSingleClick !== true &&
                    this.onUpPosition.x === this.lastPosition.x &&
                    this.onUpPosition.y === this.lastPosition.y) {
                    // Fire single left click event:
                    this.singleLeftClickEvent(event);
                }
                this.ignoreNextSingleClick = false;
                this.timeSinceLastMouseUp = now;
                break;
            case 1:
                if (this.onUpPosition.x === this.lastPosition.x &&
                    this.onUpPosition.y === this.lastPosition.y) {
                    // Fire single wheel click event:
                }
                break;
            case 2:
                if (this.onUpPosition.x === this.lastPosition.x &&
                    this.onUpPosition.y === this.lastPosition.y) {
                    // Fire single right click event:
                    this.singleRightClickEvent(event);
                }
                break;
            default:
                break;
        }
        // this.mouseUp = now;
    },

    /*
     * Final mouse event functions
     * */

    singleLeftClickEvent: function(event) {
        var dispatchedEvent = this.findClickedObject(event);
        if (dispatchedEvent.object !== null) {
            if (dispatchedEvent.object.eventCallbacks[Events.MOUSE_LEFT] !== null && dispatchedEvent.object.eventCallbacks[Events.MOUSE_LEFT] !== undefined) {
                dispatchedEvent.object.eventCallbacks[Events.MOUSE_LEFT](dispatchedEvent);
            }
        } else {
            // Call the default app evencallback if no object is found
            if (this.app.eventCallbacks[Events.MOUSE_LEFT] !== null && this.app.eventCallbacks[Events.MOUSE_LEFT] !== undefined) {
                this.app.eventCallbacks[Events.MOUSE_LEFT](dispatchedEvent);
            }
        }
    },

    singleRightClickEvent: function(event) {
        var dispatchedEvent = this.findClickedObject(event);
        if (dispatchedEvent.object !== null) {
            if (dispatchedEvent.object.eventCallbacks[Events.MOUSE_RIGHT] !== null && dispatchedEvent.object.eventCallbacks[Events.MOUSE_RIGHT] !== undefined) {
                dispatchedEvent.object.eventCallbacks[Events.MOUSE_RIGHT](dispatchedEvent);
            }
        } else {
            // Call the default app evencallback if no object is found
            if (this.app.eventCallbacks[Events.MOUSE_RIGHT] !== null && this.app.eventCallbacks[Events.MOUSE_RIGHT] !== undefined) {
                this.app.eventCallbacks[Events.MOUSE_RIGHT](dispatchedEvent);
            }
        }
    },

    doubleClickEvent: function(event) {
        var dispatchedEvent = this.findClickedObject(event);
        if (dispatchedEvent.object !== null) {
            if (dispatchedEvent.object.eventCallbacks[Events.MOUSE_DOUBLE] !== undefined && dispatchedEvent.object.eventCallbacks[Events.MOUSE_DOUBLE] !== null) {
                dispatchedEvent.object.eventCallbacks[Events.MOUSE_DOUBLE](dispatchedEvent);
            }
        } else {
            if (this.app.eventCallbacks[Events.MOUSE_DOUBLE] !== undefined && this.app.eventCallbacks[Events.MOUSE_DOUBLE] !== null) {
                this.app.eventCallbacks[Events.MOUSE_DOUBLE](dispatchedEvent);
            }
        }

    },
    findClickedObject: function(event) {
        let mouse = new THREE.Vector2();
        mouse.x = ((event.clientX / this.container.dom.offsetWidth) * 2) - 1;
        mouse.y = (-(event.clientY / this.container.dom.offsetHeight) * 2) + 1;
        var clickedObject = this.rayCastObject(mouse);
        clickedObject.mouse = mouse;
        return clickedObject;
    },

    /*
     * Ray Casting events
     *
     * */
    rayCastObject: function(mouse) {
        // select the closest object
        var closestObject = this.rayCasting(mouse);
        if (closestObject !== null) {
            // Find parent group
            var parent = closestObject.object;
            while (parent !== null && !parent.isBaseObject) {
                parent = parent.parent;
            }
            return {object: parent, intersectPoint: closestObject.point, distance: closestObject.distance};
        } else {
            return {object: null, intersectPoint: null, distance: null};
        }
    },
    isTransparent: function(mesh) {
        if (mesh.material instanceof Array) {
            for (let i = 0; i < mesh.material.length;i++) {
                if (!mesh.material[i].transparent || (mesh.material[i].transparent && mesh.material[i].opacity > 0)) {
                    return false;
                }
            }
            return true;
        } else {
            if (!mesh.material.transparent || (mesh.material.transparent && mesh.material.opacity > 0)) {
                return false;
            }
            return true;
        }
    },
    rayCasting: function(mouse) {
        var camera = this.app.getCurrentCamera();
        // camera.updateProjectionMatrix();
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        let selectableMeshes =  [];

        // DFS
        let stack = [this.app.getCurrentScene()];
        while (stack.length !== 0) {
            let child = stack.pop();
            if (child.isBaseObject && !child.visible) {
                continue;
            }
            if (child.isMesh && child.isSelectable && child.visible &&  !this.isTransparent(child)) {
                selectableMeshes.push(child);
            }
            child.children.forEach((grandChildren) => {
                stack.push(grandChildren);
            });

        }
        var intersects = raycaster.intersectObjects(selectableMeshes);
        var closestObject = null;
        if (intersects.length > 0) {
            // find the clossest mesh
            var dist = Infinity;
            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].distance < dist) {
                    dist = intersects[i].distance;
                    closestObject = intersects[i];
                }
            }
        }
        return closestObject;
    },

    /* Mouse move event
     *
     */
    mouseMove: function(event) {
        // If mouse move is not enabled, return
        if (!this.enableMouseMove) {
            return;
        }

        let now = window.performance.now();
        if ((now - this.timeSinceLastMouseMove) > 100) {
            var dispatchedEvent = this.findClickedObject(event);
            if (dispatchedEvent.object !== null) {
                if (dispatchedEvent.object.eventCallbacks[Events.MOUSE_MOVE] !== null && dispatchedEvent.object.eventCallbacks[Events.MOUSE_MOVE] !== undefined) {
                    dispatchedEvent.object.eventCallbacks[Events.MOUSE_MOVE](dispatchedEvent);
                }
            } else {
                if (this.app.eventCallbacks[Events.MOUSE_MOVE] !== null && this.app.eventCallbacks[Events.MOUSE_MOVE] !== undefined) {
                    this.app.eventCallbacks[Events.MOUSE_MOVE](dispatchedEvent);
                }

            }
            this.timeSinceLastMouseMove = now;
        }
    },

    /* key events
     * */
    onKeyDown: function(event) {
        if (this.app.eventCallbacks[Events.KEY_DOWN] !== null && this.app.eventCallbacks[Events.KEY_DOWN] !== undefined) {
            this.app.eventCallbacks[Events.KEY_DOWN](event);
        }

    },

    onKeyUp: function(event) {
        if (this.app.eventCallbacks[Events.KEY_UP] !== null && this.app.eventCallbacks[Events.KEY_UP] !== undefined) {
            this.app.eventCallbacks[Events.KEY_UP](event);
        }

    },
    enableHover: function(bEnable) {
        this.enableMouseMove = bEnable;
    }

});


export {EventDispatcher};
