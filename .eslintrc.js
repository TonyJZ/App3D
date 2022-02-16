module.exports = {
    "env": {
        "es6":  true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "globals": {
        "document": true,
        "window":   true,
        "THREE":    true,
        "Stats":    true,
        "signals":  true,
        "UI":       true,
        "Viewport": true,
        "APP3D":    true
    },
    "rules": {
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-mixed-spaces-and-tabs": "off",
        "no-case-declarations": "off",
        "space-before-function-paren": [ "error", "never" ],
        "func-call-spacing": [ "error", "never" ],
        "no-console": "off",
        "no-useless-escape": "off",
        "no-fallthrough": "off",
        "keyword-spacing": "error",
        "no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "next|resp|reject"
            }
        ],
        "key-spacing": [
            "error", {
                "mode": "minimum"
            }
        ],
        "space-infix-ops": [
            "error"
        ],
        "space-unary-ops": [
            "error"
        ],
        "space-in-parens": [
            "error",
            "never"
        ],
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        "comma-spacing": [
            "error",
            {
                "before":   false,
                "after":    true
            }
        ],
        "spaced-comment": [
            "error",
            "always"
        ],
        "brace-style": [
            "error"
        ],
        "no-trailing-spaces": [
            "error"
        ],
        "space-before-blocks": [
            "error"
        ],
        "arrow-spacing": [
            "error"
        ],
        // NOTE: We want arrow functions with brackets around the function parameters, except
        // when they are simple, single-line "compact arrow functions", e.g.: we want
        //
        //     let theOnesYouWant = arrayName.filter(ea => ea.x === "someValue");
        //
        // ...instead of:
        //
        //     let theOnesYouWant = arrayName.filter((ea) => { return ea.x === "someValue" });
        //
        // So to make an exception for any single-line arrow function you write, add the
        // following comment at the end of that line:
        //
        //     // eslint-disable-line arrow-parens
        //
        "arrow-parens": [
            "error",
            "always"
        ],
        "curly": [
            "error",
            "all"
        ],
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ]
    }
};
