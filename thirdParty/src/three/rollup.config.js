function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl$/.test( id ) === false ) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
					.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};

		}

	};

}

export default {
	input: 'extra/index.js',
	plugins: [
		glsl()
	],
    external : ['THREE'],
	// sourceMap: true,
	output: [
		/*{
			format: 'umd',
			name: 'EXTRA',
			file: 'build/extra.js',
			indent: '\t'
		},*/
		{
            
			format: 'es',
			file: '../../build/extra.module.js',
			indent: '\t',
            banner:"import * as THREE from './three.module.js';"
		}
	]
};
