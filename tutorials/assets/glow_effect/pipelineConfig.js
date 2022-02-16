var style_segment = {
    routeType: 0,
    connectionRadius: 0,
    tubularSegments: 150
};
var style_blue1 = {
    color:              0xffff00,
    textureUrl:            "./assets/glow_effect/SanFran_roadDiffuse_repeat.jpg",
    textureRotation:    0,
    speed:              2,
    radius:             0.4,
    textureUnitS:  3,
    textureUnitT:  3,
};
var style_blue2 = {
    color:              0xffffff,
    textureUrl:            "./assets/glow_effect/SanFran_roadDiffuse_repeat.jpg",
    textureRotation:    0,
    speed:              2,
    radius:             0.4,
    textureUnitS:  3,
    textureUnitT:  3,
};

var style_yellow1 = {
    color:              0xffffff,
    textureUrl:            "./assets/glow_effect/SanFran_roadDiffuse_repeat.jpg",
    textureRotation:    0,
    speed:              2,
    radius:             0.4,
    textureUnitS:  3,
    textureUnitT:  3,
};

var style_green1 = {
    color:              0xffffff,
    textureUrl:            "./assets/glow_effect/SanFran_roadDiffuse_repeat.jpg",
    textureRotation:    0,
    speed:              2,
    radius:             0.4,
    textureUnitS:  3,
    textureUnitT:  3,
};

var PipelineParams = [
    {
        name: "Line001",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-35.127, 62.2, 6],[-35.127, 52.142, 6],[-35.127, 52.142, 3.5]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line002",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-27.74, 62.2, 6],[-27.74, 52.142, 6],[-27.74, 52.142, 3.5]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line003",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-27.74, 51.82, 2.266],[-27.74, 44, 2.266]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line004",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-35.12, 52, 2.266],[-35.12, 44, 2.266],[-26, 44, 2.266],[-26, 44, 5.6],[-23.5, 44, 5.6]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line005",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-18.192, 51, 2.535],[-18.192, 45, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line006",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-9.174, 51, 2.535],[-9.174, 45, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line007",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-5.334, 51, 2.535],[-5.334, 45, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line008",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-22.073, 42.5, 2.535],[-22.073, 39.495, 2.535],[-36.1, 39.495, 2.535],[-36.1, 39.495, 1.595],[-36.1, 29.421, 1.595],[-35.2, 29.421, 1.595]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line009",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-18.217, 42.5, 2.535],[-18.217, 36.431, 2.535],[-26.208, 36.431, 2.535],[-26.208, 36.431, 1.595],[-26.208, 29.421, 1.595],[-25.3, 29.421, 1.595]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line010",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-15.301, 44, 5.6],[-15.301, 44, 1.595],[-15.301, 29.421, 1.595],[-14.5, 29.421, 1.595]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line011",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-9.174, 42.5, 2.535],[-9.174, 36.828, 2.535],[-4.494, 36.828, 2.535],[-4.494, 36.828, 1.595],[-4.494, 29.421, 1.595],[-3.6, 29.421, 1.595]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line012",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-5.317, 42.5, 2.535],[-5.317, 39.984, 2.535],[5.114, 39.984, 2.535],[5.114, 39.984, 1.595],[5.114, 29.421, 1.595],[6, 29.421, 1.595]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line013",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-21, 44, 5.6],[-6, 44, 5.6]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line014",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-31.243, 24.794, 1.635],[5.979, 24.794, 1.635]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line015",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-33.5, 29.39, 1.635],[-32.572, 29.39, 1.635],[-32.572, 24.794, 1.635],[-31.243, 24.794, 1.635]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line016",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-23.632, 29.416, 1.635],[-19.437, 29.416, 1.635],[-19.437, 24.794, 1.635]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line017",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-12.8, 29.416, 1.635],[-10.405, 29.416, 1.635],[-10.405, 24.794, 1.635]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line018",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-2, 29.416, 1.635],[1.763, 29.416, 1.635],[1.763, 24.794, 1.635]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line019",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[7.6, 29.416, 1.635],[10.03, 29.416, 1.635],[10.03, 24.794, 1.635],[5.979, 24.794, 1.635]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line020",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-31.243, 24.794, 1.635],[-31.243, 24.794, 0.822],[-35.3, 24.794, 0.822],[-35.3, 13.124, 0.822]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line021",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-21.38, 24.794, 1.635],[-21.38, 24.794, 0.822],[-21.38, 14, 0.822]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line022",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-8.43, 24.794, 1.635],[-8.43, 24.794, 0.822],[-8.43, 14, 0.822]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line023",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[5.979, 24.794, 1.635],[5.979, 24.794, 0.822],[5.979, 14, 0.822]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line024",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-33.323, 14, 0.896],[-33.323, 22.766, 0.896],[-33.323, 22.765, 2.535],[15.069, 22.765, 2.535],[15.069, 41.7, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line025",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-19.716, 14, 0.896],[-19.716, 21.024, 0.896],[-19.716, 21.024, 2.535],[18.935, 21.024, 2.535],[18.935, 41.7, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line026",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-6.398, 14, 0.896],[-6.398, 19.641, 0.896],[-6.398, 19.641, 2.535],[25.105, 19.641, 2.535],[25.105, 41.7, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line027",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[7.789, 14, 0.896],[7.789, 17.269, 0.896],[7.789, 17.269, 2.535],[28.952, 17.269, 2.535],[28.952, 41.7, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line028",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[15.068, 45, 2.535],[15.068, 51, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line029",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[18.89, 45, 2.535],[18.89, 51, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line030",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[25.111, 45, 2.535],[25.111, 51, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line031",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[29.007, 45, 2.535],[29.007, 51, 2.535]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line032",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[16, 44, 5.6],[28, 44, 5.6]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line033",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[45, 15, 1.72],[14.187, 15, 1.72],[14.187, 11.2, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line034",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[34.57, 28, 6],[34.57, 20.6, 6],[34.57, 20.6, 3.5]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line035",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[40.71, 28, 6],[40.71, 20.6, 6],[40.71, 20.6, 3.5]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line036",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[34.57, 20, 2.259],[34.57, 15, 2.259],[34.57, 15, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line037",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[40.71, 20, 2.259],[40.71, 15, 2.259],[40.71, 15, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line038",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[19.175, 15, 1.72],[19.175, 11.2, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line039",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[24.153, 15, 1.72],[24.153, 11.2, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line040",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[19.182, 8, 1.72],[19.182, 5.65, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line041",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[19.182, 5.65, 1.72],[14.2, 5.65, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line042",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[19.182, 5.65, 1.72],[24.145, 5.65, 1.72]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line043",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[14.2, 8, 1.72],[14.2, 5.65, 1.72],[14.2, 5.65, 0.397],[14.2, 3.868, 0.397],[-16.039, 3.868, 0.397],[-16.039, 13.771, 0.397],[-16.039, 13.771, 3.097],[-20, 13.771, 3.097]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line044",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[24.145, 8, 1.72],[24.145, 5.65, 1.72],[24.145, 5.65, 0.397],[24.145, 1.759, 0.397],[-28.858, 1.759, 0.397],[-28.858, 13.829, 0.397],[-28.858, 13.829, 3.097],[-34, 13.829, 3.097]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line045",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-32.822, 13.135, 3.284],[-30.281, 13.135, 3.284],[-30.281, 0, 3.284],[29.178, 0, 3.284],[29.178, 12, 3.284],[45, 12, 3.284]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line046",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-18.7, 13.035, 3.284],[-17.332, 13.035, 3.284],[-17.332, 0, 3.284]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line047",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-33.481, 7, 1.342],[-33.481, -6.833, 1.342],[-31.232, -6.833, 1.342],[-31.232, -25.61, 1.342],[33, -25.61, 1.342]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line048",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-19.612, 7, 1.342],[-19.612, -35.076, 1.342],[33, -35.076, 1.342]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line049",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-6.606, 7, 1.342],[-6.606, -2.482, 1.342],[33, -2.482, 1.342]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line050",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[7.772, 7, 1.342],[7.772, -6.938, 1.342],
                        [33, -6.938, 1.342]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line051",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[33, -37.497, 3.907],[-39.1, -37.497, 3.907],[-39.1, -22.151, 3.907],[-39.1, -22.151, 1.486],[-37.737, -22.151, 1.486]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line052",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[33, -32.809, 3.907],[-6.812, -32.809, 3.907],[-6.812, -22.151, 3.907],[-6.812, -22.151, 1.486],[-4.79, -22.151, 1.486]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line053",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-28.731, -37.497, 3.907],[-28.731, -22.151, 3.907],[-28.731, -22.151, 1.486],[-26.356, -22.151, 1.486]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line054",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-17.49, -37.497, 3.907],[-17.49, -22.151, 3.907],[-17.49, -22.151, 1.486],[-15.293, -22.151, 1.486]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line055",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[3.49, -32.809, 3.907],[3.49, -22.151, 3.907],[3.49, -22.151, 1.486],[5.469, -22.151, 1.486]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line056",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[7.44, -18, 2.422],[7.44, -11.626, 2.422],[-35.288, -11.626, 2.422]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line057",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-35.288, -18, 2.422],[-35.288, -11.626, 2.422],[-35.288, -11.626, 0.829],[-35.288, 6.468, 0.829]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line058",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-24.496, -18, 2.422],[-24.496, -11.626, 2.422]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line059",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-13.77, -18, 2.422],[-13.77, -11.626, 2.422]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line060",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-3.01, -18, 2.422],[-3.01, -11.626, 2.422]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line061",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-21.358, -11.626, 2.422],[-21.358, -11.626, 0.829],[-21.358, 6.5, 0.829]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line062",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[-8.385, -11.626, 2.422],[-8.385, -11.626, 0.829],[-8.385, 6.5, 0.829]],
                segStyle: style_segment
            }
        ],
    },
    {
        name: "Line063",
        pipeStyle: style_blue1,
        routeArray: [ {   
                route: [[6.012, -11.626, 2.422],[6.012, -11.626, 0.829],[6.012, 6.5, 0.829]],
                segStyle: style_segment
            }
        ],
    }
];
