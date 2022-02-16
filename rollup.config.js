const glsl = () => {
    return {
        transform(code, id) {
            if (!/\.glsl$|\.vert$|\.frag$/.test(id)) {
                return;
            }
            return "export default " + JSON.stringify(
                code
                    .replace(/[ \t]*\/\/.*\n/g, "")
                    .replace(/[ \t]*\/\*[\s\S]*?\*\//g, "")
                    .replace(/\n{2,}/g, "\n")
            ) + ";";
        },
    };
};

export default {
    input: "src/index.js",

    plugins: [
        glsl(),
    ],

    output: [
        {
            format: "umd",
            name: "APP3D",
            file: "build/app3d.js",
            indent: "\t"
        },
        {
            format: "umd",
            name: "APP3D",
            file: "tutorials/lib/app3d.js",
            indent: "\t"
        },
        // ES format disabled
        /*
		{
			format: 'es',
			file: 'build/three.module.js',
			indent: '\t'
		}
        * */
    ]
};
