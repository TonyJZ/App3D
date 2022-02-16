// opts = {
//     name:
//     div:
//     domElementID:
//     imgPath:
//     anchorType:APP3DLabelPosition(top,bottom or center of object
//     offset: 3DOffsetfrom from the anchor point
//     labelStartPxRelativeX: 2D offset from labels top-left to labels attching point
//     labelStartPxRelativeY: 2D offset from labels top-left to labels attching point
// }
import {AnchoredHTMLObject} from "./AnchoredHTMLObject.js";
import {Events} from "./Constants.js";

function ObjectIcon(opts, selectedObject = null, eventCallbacks = null) {
    AnchoredHTMLObject.call(this, selectedObject, opts);
    this.parentObject = selectedObject;

    // Maybe sometime in the future we can figure out how to combine these:
    this.icon;
    // To help with putting the label in the center of the object:

    this.iconStartPxRelativeX = opts.iconStartPxRelativeX === undefined ? 0 : opts.iconStartPxRelativeX;  // 20
    this.iconStartPxRelativeY = opts.iconStartPxRelativeY === undefined ? 0 : opts.iconStartPxRelativeY;  // 60

    // Initialize the fields:
    // The "main" portion containing the text
    this.icon = this.createIcon(opts, eventCallbacks);
    this.isTempHidden = false;
    // The "secondary" parts, consisting of a line and a dot:
}

ObjectIcon.prototype = Object.assign(Object.create(AnchoredHTMLObject.prototype), {

    constructor: ObjectIcon,

    createIcon: function(opts, eventCallbacks) {
        let div = null;
        if (opts.div === undefined || opts.div === null) {
            div = document.createElement("div");
            // The &nbsp; below are a hacky way of making room for the image next to the
            // text. We should find a proper way to do that in the future.
            div.id =                opts.id || "objectIcon";
            div.className =         "objectIconDefault";
            div.style.position =    "absolute";
            div.style.color =       "#fff";
            div.style.padding =     "10px";
            div.style.margin =      "0px";
            div.style.height =      "20px";
            div.style.width =       "20px";
            div.style.border =      "2px solid";
            div.style.cursor =      "pointer";
            div.style["border-style"] =     "solid";
            div.style["border-radius"] =    "50% 50% 2px 50%";
            div.style["font-family"] =      "Courier New";
            div.style["font-size"] =        "large";
            div.style["background-color"] = "rgb(34, 34, 34)";
            div.style["opacity"] = "0.8";
            div.style["user-select"] = "none";
            div.style.zIndex = 101;

            div.style.transform =   "rotate(45deg)";
            let pic = document.createElement("img");
            pic.style.position =    "absolute";
            pic.style.left =        "6px";
            pic.style.top =         "6px";
            pic.style.height =      "28px";

            pic.src = (opts.imgPath === null || opts.imgPath === undefined) ? this.parentObject.info.labelIconPath : opts.imgPath;
            pic.style.transform =   "rotate(-45deg)";
            div.style.visibility =   "hidden";
            div.appendChild(pic);

            let parentID = opts.domElementID || "container";
            document.getElementById(parentID).appendChild(div);

            this.iconStartPxRelativeX = parseInt(div.offsetWidth, 10) / 2;
            this.iconStartPxRelativeY = parseInt(div.offsetHeight, 10);
        } else {
            div = opts.div;
        }

        if (eventCallbacks !== null) {
            if (eventCallbacks[Events.MOUSE_CLICK] !== undefined && eventCallbacks[Events.MOUSE_CLICK] !== null) {
                div.onclick = eventCallbacks[Events.MOUSE_CLICK];
            }
            if (eventCallbacks[Events.MOUSE_ENTER] !== undefined && eventCallbacks[Events.MOUSE_ENTER] !== null) {
                div.onmouseenter = eventCallbacks[Events.MOUSE_ENTER];
            }
            if (eventCallbacks[Events.MOUSE_LEAVE] !== undefined && eventCallbacks[Events.MOUSE_LEAVE] !== null) {
                div.onmouseleave = eventCallbacks[Events.MOUSE_LEAVE];
            }
        }
        return {
            element: div,
            updatePosition: (icon, anchorPoint2D) => {
                icon.element.style.left = (anchorPoint2D.x - this.iconStartPxRelativeX) + "px";
                icon.element.style.top = (anchorPoint2D.y - this.iconStartPxRelativeY) + "px";
            }
        };
    },
    updatePosition: function(camera) {
        if (this.icon.element.style.visibility === "visible"
            || (this.icon.element.style.visibility === "hidden" && this.isTempHidden)) {
            let anchorPoint2D = this.getAnchorPoint2D(camera);
            this.icon.updatePosition(this.icon, anchorPoint2D);
        }
        if (this.icon.element.style.visibility === "visible") {
            if (!this.isInsideFrustum(camera)) {
                this.icon.element.style.visibility = "hidden";
                this.isTempHidden = true;
            }
        } else if (this.icon.element.style.visibility === "hidden" && this.isTempHidden) {
            if (this.isInsideFrustum(camera)) {
                this.icon.element.style.visibility = "visible";
                this.isTempHidden = false;
            }
        }
    },
    show: function() {
        this.icon.element.style.visibility = "visible";
    },
    hide: function() {
        this.icon.element.style.visibility = "hidden";
        this.isTempHidden = false;
    },
    remove: function() {
        this.icon.element.remove();
    },
    copy: function(source) {

        AnchoredHTMLObject.prototype.copy.call(this, source);

        this.iconStartPxRelativeX = source.iconStartPxRelativeX;
        this.iconStartPxRelativeY = source.iconStartPxRelativeY;

        // Initialize the fields:
        // The "main" portion containing the text
        this.icon = Object.assign({}, source.icon);

        return this;
    },
    clone: function() {
        return new this.constructor().copy(this);
    }
});

export {ObjectIcon};