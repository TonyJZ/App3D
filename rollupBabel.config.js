import babel from "rollup-plugin-babel";
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
        babel({
            exclude: "node_modules/**"
        })
    ],
    output: [
        {
            format: "umd",
            name: "APP3D",
            file: "build/app3d.es5.js",
            indent: "\t"
        }
    ]
};
