import obfuscatorPlugin from 'rollup-plugin-javascript-obfuscator'
import babel from "rollup-plugin-babel";
//import { uglify } from "rollup-plugin-uglify";
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
        }),
        
        obfuscatorPlugin({
            compact: true,
            debugProtection:true,
            stringArray: true,
            rotateStringArray: true,
            stringArrayThreshold: 0.75,
            transformObjectKeys:true,     //may cause some issues 
            disableConsoleOutput:true,
            //stringArrayEncoding:true
        })
    ],
    output: [
        {
            format: "umd",
            name: "APP3D",
            file: "build/app3d.min.js",
            indent: "\t"
        },
        {
            format: "umd",
            name: "APP3D",
            file: "tutorials/lib/app3d.min.js",
            indent: "\t"
        }
    ]
};
