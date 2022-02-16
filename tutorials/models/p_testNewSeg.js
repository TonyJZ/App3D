var style_segment_long = {
    routeType: 0,
    connectionRadius: 0,
    tubularSegments: 1,
    radialSegments: 8
};

var style_segment_turn = {
    routeType: 0,
    connectionRadius: 5,
    tubularSegments: 8,
    radialSegments: 8
};

var style_red_pipe = {
    color: 0xffffff,
    textureUrl: "./models/arrows/arrows_red.png",
    textureRotation: 0,
    speed: 10,
    radius: 0.2,
    textureUnitS: 2,
    textureUnitT: 2,
};

var style_green_pipe = {
    color: 0xffffff,
    textureUrl: "./models/arrows/arrows_green.png",
    textureRotation: 0,
    speed: 20,
    radius: 0.2,
    textureUnitS: 2,
    textureUnitT: 2,
};

var PipelineParams = [
    {
        name: "Line001",
        pipeStyle: style_red_pipe,
        routeArray: [
            {
                route: [[0, 0, 2],[0, 100, 2]],
                segStyle: style_segment_long
            },
            {
                route: [[0, 100, 2],[0, 101, 2],[1, 101, 2]],
                segStyle: style_segment_turn
            },
            {
                route: [[1, 101, 2],[101, 101, 2]],
                segStyle: style_segment_long
            }
        ],
    },
    {
        name: "Line002",
        pipeStyle: style_green_pipe,
        routeArray: [
            {
                route: [[0, 0, 2],[0, -20, 2]],
                segStyle: style_segment_long
            },
            {
                route: [[0, -20, 2],[0, -21, 2],[1, -21, 2]],
                segStyle: style_segment_turn
            },
            {
                route: [[1, -21, 2],[31, -21, 2]],
                segStyle: style_segment_long
            },
            {
                route: [[31, -21, 2],[36, -21, 2],[36, -15, 2]],
                segStyle: style_segment_turn
            },
            {
                route: [[36, -15, 2],[36, 50, 2]],
                segStyle: style_segment_long
            }
        ],
    },
];