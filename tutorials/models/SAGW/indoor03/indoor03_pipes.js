var style_blue = {
    color:              0xffffff,
    textureUrl:            "./models/arrows/arrows_blue.png",
    textureRotation:    0,
    speed:              10,
    radius:             0.2,
    textureUnitS:  2,
    textureUnitT:  2,
    routeType:           1,
    connectionRadius:   0.5
}
var style_red = {
    color:              0xffffff,
    textureUrl:            "./models/arrows/arrows_red.png",
    textureRotation:    0,
    speed:              10,
    radius:             0.2,
    textureUnitS:  2,
    textureUnitT:  2,
    routeType:           1,
    connectionRadius:   0.5
}
var style_green = {
    color:              0xffffff,
    textureUrl:            "./models/arrows/arrows_green.png",
    textureRotation:    0,
    speed:              10,
    radius:             0.2,
    textureUnitS:  2,
    textureUnitT:  2,
    routeType:           1,
    connectionRadius:   0.5
}

var PipelineParams = [
    {
        name: "Line377",
        Route: [
            [-17.0,-2.5,4.0],
            [-14.0,-2.5,4.0],
            [-14.0,-12.0,4.0],
        ],
        style: style_blue
    },
    {
        name: "Line378",
        Route: [
            [-17.0,-12.0,4.0],
            [3.0,-12.0,4.0],
            [3.0,21.0,4.0],
            [6.5,21.0,4.0]
        ],
        style: style_blue
    },
    {
        name: "Line379",
        Route: [
            [3.0,16.0,4.0],
            [11.0,16.0,4.0]
        ],
        style: style_blue
    },
    {
        name: "Line380",
        Route: [
            [3.0,11.0,4.0],
            [6.5,11.0,4.0]
        ],
        style: style_blue
    },
    {
        name: "Line381",
        Route: [
            [3.0,6.0,4.0],
            [11.0,6.0,4.0]
        ],
        style: style_blue
    },
    {
        name: "Line382",
        Route: [
            [3.0,1.0,4.0],
            [6.5,1.0,4.0]
        ],
        style: style_blue
    },
    {
        name: "Line383",
        Route: [
            [-17.0,-0.0,1.6],
            [-12.0,-0.0,1.6],
            [-12.0,-5.0,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line384",
        Route: [
            [-17.0,-10.0,1.6],
            [-12.0,-10.0,1.6],
            [-12.0,-5.0,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line384_1",
        Route: [
            [-12.0,-5.0,1.6],
            [-6.5,-5.0,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line385",
        Route: [
            [-10.0,-5.0,1.6],
            [-10.0,-0.0,1.6],
            [-6.5,-0.0,1.6],
        ],
        style: style_blue
    },
    {
        name: "Line386",
        Route: [
            [-3.5,0.0,1.6],
            [4.0,0.0,1.6],
            [4.0,20.5,1.6],
            [6.5,20.5,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line387",
        Route: [
            [4.0,15.5,1.6],
            [11.0,15.5,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line388",
        Route: [
            [4.0,10.5,1.6],
            [6.5,10.5,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line389",
        Route: [
            [4.0,5.5,1.6],
            [11.0,5.5,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line390",
        Route: [
            [4.0,0.5,1.6],
            [6.5,0.5,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line391",
        Route: [
            [-3.5,-5.0,1.6],
            [-2.0,-5.0,1.6],
            [-2.0,0.0,1.6]
        ],
        style: style_blue
    },
    {
        name: "Line392",
        Route: [
            [6.5,9.5,3.0],
            [2.0,9.5,3.0],
            [-20.0,9.5,3.0]
        ],
        style: style_red
    },
    {
        name: "Line393",
        Route: [
            [6.5,19.5,3.0],
            [2.0,19.5,3.0],
            [2.0,9.5,3.0]
        ],
        style: style_red
    },
    {
        name: "Line394",
        Route: [
            [11.0,14.5,3.0],
            [2.0,14.5,3.0]
        ],
        style: style_red
    },
    {
        name: "Line395",
        Route: [
            [6.5,-0.5,3.0],
            [2.0,-0.5,3.0],
            [2.0,9.5,3.0]
        ],
        style: style_red
    },
    {
        name: "Line396",
        Route: [
            [11.0,4.5,3.0],
            [2.0,4.5,3.0]
        ],
        style: style_red
    },
    {
        name: "Line397",
        Route: [
            [-20.0,20.0,1.6],
            [-6.5,20.0,1.6]
        ],
        style: style_red
    },
    {
        name: "Line398",
        Route: [
            [-10.0,20.0,1.6],
            [-10.0,15.0,1.6],
            [-6.5,15.0,1.6]
        ],
        style: style_red
    },
    {
        name: "Line399",
        Route: [
            [-3.5,20.0,1.6],
            [1.0,20.0,1.6],
            [1.0,20.0,0.6],
            [1.0,-1.0,0.6],
            [6.5,-1.0,0.6]
        ],
        style: style_red
    },
    {
        name: "Line400",
        Route: [
            [-3.5,15.0,1.6],
            [-1.0,15.0,1.6],
            [-1.0,20.0,1.6]
        ],
        style: style_red
    },
    {
        name: "Line401",
        Route: [
            [1.0,19.0,0.6],
            [6.5,19.0,0.6]
        ],
        style: style_red
    },
    {
        name: "Line402",
        Route: [
            [1.0,9.0,0.6],
            [6.5,9.0,0.6]
        ],
        style: style_red
    },
    {
        name: "Line403",
        Route: [
            [1.0,4.0,0.6],
            [11.0,4.0,0.6]
        ],
        style: style_red
    },
    {
        name: "Line404",
        Route: [
            [1.0,14.0,0.6],
            [11.0,14.0,0.6]
        ],
        style: style_red
    },
    {
        name: "Line405",
        Route: [
            [9.5,20.0,0.5],
            [24.5,20.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line406",
        Route: [
            [14.0,-5.0,0.5],
            [16.0,-5.0,0.5],
            [16.0,20.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line407",
        Route: [
            [14.0,15.0,0.5],
            [16.0,15.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line408",
        Route: [
            [9.5,10.0,0.5],
            [16.0,10.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line409",
        Route: [
            [14.0,5.0,0.5],
            [16.0,5.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line410",
        Route: [
            [9.5,0.0,0.5],
            [16.0,0.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line411",
        Route: [
            [23.0,20.0,0.5],
            [23.0,17.0,0.5],
            [24.5,17.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line412",
        Route: [
            [25.5,20.0,0.5],
            [33.0,20.0,0.5],
            [33.0,20.0,1.0],
            [33.0,11.0,1.0],
            [22.0,11.0,1.0],
            [22.0,9.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line413",
        Route: [
            [25.5,17.0,0.5],
            [27.0,17.0,0.5],
            [27.0,20.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line414",
        Route: [
            [24.44,11.0,1.0],
            [24.44,9.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line415",
        Route: [
            [26.88,11.0,1.0],
            [26.88,9.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line416",
        Route: [
            [29.32,11.0,1.0],
            [29.32,9.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line417",
        Route: [
            [31.76,11.0,1.0],
            [31.76,9.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line418",
        Route: [
            [24.44,7.0,1.0],
            [24.44,5.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line419",
        Route: [
            [26.88,7.0,1.0],
            [26.88,5.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line420",
        Route: [
            [29.32,7.0,1.0],
            [29.32,5.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line421",
        Route: [
            [22.0,7.0,1.0],
            [22.0,5.0,1.0]
        ],
        style: style_green
    },
    {
        name: "Line422",
        Route: [
            [31.76,7.0,1.0],
            [31.76,5.0,1.0],
            [21.0,5.0,1.0],
            [21.0,5.0,0.5],
            [21.0,-3.0,0.5],
            [24.5,-3.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line423",
        Route: [
            [21.0,0.0,0.5],
            [24.5,0.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line424",
        Route: [
            [25.5,0.0,0.5],
            [32.0,0.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line425",
        Route: [
            [25.5,-3.0,0.5],
            [27.0,-3.0,0.5],
            [27.0,0.0,0.5]
        ],
        style: style_green
    },
    {
        name: "Line426",
        Route: [
            [29.0,0.0,0.5],
            [29.0,-1.0,0.5],
            [32.0,-1.0,0.5]
        ],
        style: style_green
    }
];
