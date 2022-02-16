/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */
import {LineSegmentsGeometry} from "./LineSegmentsGeometry.js";
function WireframeGeometry2 ( geometry ) {

	LineSegmentsGeometry.call( this );

	this.type = 'WireframeGeometry2';

	this.fromWireframeGeometry( new THREE.WireframeGeometry( geometry ) );

	// set colors, maybe

};

WireframeGeometry2.prototype = Object.assign( Object.create( LineSegmentsGeometry.prototype ), {

	constructor: WireframeGeometry2,

	isWireframeGeometry2: true,

	copy: function ( source ) {

		// todo

		return this;

	}

} );

export { WireframeGeometry2 };