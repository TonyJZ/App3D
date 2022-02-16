// opts = {
//     name:
//     div:
//     domElementID:
//     anchorType:APP3DLabelPosition(top,bottom or center of object
//     imgPath:
//     labelText:
//     offset: 3DOffsetfrom from the anchor point
//     labelStartPxRelativeX: 2D offset from labels top-left to labels attching point
//     labelStartPxRelativeY: 2D offset from labels top-left to labels attching point
// }

import * as THREE from "../thirdParty/build/three.module.js";
import {AnchoredHTMLObject} from "./AnchoredHTMLObject.js";

function ObjectLabel(selectedObject, opts, onClick = null) {
    this.opts = opts;
    AnchoredHTMLObject.call(this, selectedObject, opts);
    this.parentObject = selectedObject;
    this.labelName = opts.name;
    // Fields:
    // Maybe sometime in the future we can figure out how to combine these:
    this.htmlElement;
    // this.line;
    // this.dot;
    // To help with putting the label in the center of the object:
    this.boundingBox = new THREE.Box3().setFromObject(selectedObject);
    this.boundingBoxHeight = this.boundingBox.max.y - this.boundingBox.min.y;
    this.labelStartPxRelativeX = opts.labelStartPxRelativeX === undefined ? 0 : opts.labelStartPxRelativeX;
    this.labelStartPxRelativeY = opts.labelStartPxRelativeY === undefined ? 0 : opts.labelStartPxRelativeY;
    // Initialize the fields:
    // The "main" portion containing the text
    this.htmlElement = this.createTextLabel(opts, onClick);
    this.isTempHidden = false;
}

ObjectLabel.prototype = Object.assign(Object.create(AnchoredHTMLObject.prototype), {

    constructor: ObjectLabel,

    createTextLabel: function(opts, onClick) {
        let div = null;
        if (opts.div === undefined || opts.div === null) {
            div = document.createElement("div");   // default label style
            // commonWrap.id = option.id || 'label';
            div.id =        opts.id || "objectLabel";
            div.className = "objectLabelDefault";
            div.style.cssText = "position:absolute;left:100px;top:200px";
            div.style.zIndex = 100;

            let dot = document.createElement("div");
            dot.className =  "dotDefault";
            dot.style.cssText = `
                width:10px;
                height:10px;
                border-radius: 50%;
                border:4px solid rgba(255,255,255,.2);
                background:#FFF;
                background-clip: padding-box;
                position: absolute;
                left:0;
                bottom:0;
            `;
            let dotBefore = document.createElement("span");
            dotBefore.style.cssText = `
            width:50px;
                transform: rotate(-60deg);
                transform-origin: left center;
                border-top:2px solid #FFF;
                position: absolute;
                left:6px;
                top:2px;
            `;
            let dotAfter = document.createElement("span");
            dotAfter.style.cssText = `
            content:'';
                width:30px;
                border-top:2px solid #FFF;
                position: absolute;
                left:30.6px;
                top:-41.5px;
            `;
            let common = document.createElement("div");
            common.className = "common";
            common.style.cssText = `
                padding:8px 15px;
                border-radius:6px;
                border:2px solid rgba(255,255,255,0.8);
                background: rgba(28,28,28,0.8);
                position: absolute;
                top:-67px;
                left:57px;
                color:#3BAA6E;
                white-space: nowrap;
            `;

            let commonAfter = document.createElement("span");
            commonAfter.style.cssText = `
            height:60%;
                width:5px;
                background: #FFF;
                border-radius:3px;
                position: absolute;
                top:20%;
                left:-3px;
            `;

            // div.onclick = onClick;
            let img = document.createElement("img");
            img.src = (opts.imgPath === null || opts.imgPath === undefined) ? this.parentObject.info.labelIconPath : opts.imgPath;
            img.style.cssText = `
                height:24px;
                margin-right: 4px;
                vertical-align: middle;
            `;

            let textBox = document.createElement("text-box");
            textBox.innerHTML = (opts.labelText == null  || opts.labelText === undefined) ? this.parentObject.info.label : opts.labelText;
            textBox.style.cssText = `
                color:#fff;
                vertical-align: middle;
            `;

            let parentID = opts.domElementID || "container";
            document.getElementById(parentID).appendChild(div);
            div.appendChild(dot);
            dot.appendChild(dotBefore);
            dot.appendChild(dotAfter);
            dot.appendChild(common);
            common.appendChild(img);
            common.appendChild(textBox);
            common.appendChild(commonAfter);

            div.style.visibility = "hidden";
        } else {
            div = opts.div;
        }

        if (onClick !== null) {
            div.onclick = onClick;
        }

        return {
            element: div,
            updatePosition: (label, anchorPoint2D) => {
                label.element.style.left = (anchorPoint2D.x + this.labelStartPxRelativeX) + "px";
                label.element.style.top = (anchorPoint2D.y - this.labelStartPxRelativeY) + "px";
            }
        };
    },
    setText: function(text) {
        let textBox = this.htmlElement.element.getElementsByTagName("text-box")[0];
        textBox.innerHTML = text;
        textBox.innerText = text;
    },
    updatePosition: function(camera) {
        let coords2D = this.getAnchorPoint2D(camera);
        this.htmlElement.updatePosition(this.htmlElement, coords2D);
        // if it is visible but out of frustum temporarily make it invisible
        if (this.htmlElement.element.style.visibility === "visible" || this.htmlElement.element.style.visibility === "") {
            if (!this.isInsideFrustum(camera)) {
                this.htmlElement.element.style.visibility = "hidden";
                this.isTempHidden = true;
            }
        } else if (this.htmlElement.element.style.visibility === "hidden" && this.isTempHidden) {
            if (this.isInsideFrustum(camera)) {
                this.htmlElement.element.style.visibility = "visible";
                this.isTempHidden = false;
            }
        }
        // this.line.updatePosition(this.line, coords2D);
        // this.dot.updatePosition(this.dot, coords2D);
    },
    show: function() {
        this.htmlElement.element.style.visibility = "visible";
        // this.dot.element.style.visibility = "visible";
        // this.line.element.style.visibility = "visible";

    },
    hide: function() {
        this.htmlElement.element.style.visibility = "hidden";
        // this.dot.element.style.visibility = "hidden";
        // this.line.element.style.visibility = "hidden";
        this.isTempHidden = false;

    },
    remove: function() {
        this.htmlElement.element.remove();
        // this.line.element.remove();
        // this.dot.element.remove();
    },
    copy: function(source) {

        AnchoredHTMLObject.prototype.copy.call(this, source);

        this.htmlElement = source.htmlElement;
        // this.line = source.line;
        // this.dot = source.dot;
        // To help with putting the label in the center of the object:
        this.boundingBox = source.boundingBox.clone();
        this.boundingBoxHeight = source.boundingBoxHeight;
        this.labelStartPxRelativeX = source.labelStartPxRelativeX;
        this.labelStartPxRelativeY = source.labelStartPxRelativeY;
        // Initialize the fields:
        // The "main" portion containing the htmlElement
        this.htmlElement = Object.assign({}, source.htmlElement);
        // The "secondary" parts, consisting of a line and a dot:
        // this.line = Object.assign({}, source.line);
        // this.dot = Object.assign({}, source.dot);

        return this;
    },
    clone: function() {
        return new this.constructor(this.parentObject, this.opts).copy(this, this.opts);
    }
});

export {ObjectLabel};
