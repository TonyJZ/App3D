var style_segment_open = {
    radius: 0.5,
    tubularSegments: 50,
    radialSegments: 8,
    close: false,
};

var style_segment_close = {
    radius: 0.5,
    tubularSegments: 50,
    radialSegments: 8,
    close: true,
};

var lineStyle1 = {
    headPosition: 0.5,
    glowColor: 0xff00ff, 
    headLength: 0.02,
    tailLength: 0.02,
    duration: 10.0,
    accPeriod: 2.0,
    maxAcc: 0.5,
    direction: 1.0,
    circle: 0.0,
};

var lineStyle2 = {
    headPosition: 0.5,
    glowColor: 0xffff00, 
    headLength: 0.2,
    tailLength: 0.1,
    duration: 5.0,
    accPeriod: 2.0,
    maxAcc: 0.3,
    direction: 0.0,
    circle: 1.0,
};

var lineStyles = {
    "line001": lineStyle1,
    "line002": lineStyle2,
}

var pipelinePath = [
    {
        name: "line001",
        routeArray: [
            {
                route: [[0, 0, 5], [0, 100, 5], [100, 100, 5]],
                segStyle: style_segment_close
            },
        ],
    },
    {
        name: "line002",
        routeArray: [
            {
                route: [[0, 0, 20], [0, -20, 20], [20, -20, 20], [20, -20, 30], [20, 10, 30], [20, 10, 20], [0, 10, 20], [0, 8, 20], [0, 0, 20]],
                segStyle: style_segment_close
            },
        ],
    },
];