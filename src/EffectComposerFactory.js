import { ToneComposer } from "./composers/ToneComposer.js";
import { LutComposer } from "./composers/LutComposer.js";
import { BloomComposer } from "./composers/BloomComposer.js";
import { FinalComposer } from "./composers/FinalComposer.js";
import { BlankComposer } from "./composers/BlankComposer.js";
import { VignetteComposer } from "./composers/VignetteComposer.js";
import { GrainComposer } from "./composers/GrainComposer.js";
import { MotionBlurComposer } from "./composers/MotionBlurComposer.js";
import { LensDistortionComposer } from "./composers/LensDistortionComposer.js";
import { AutoExposureComposer } from "./composers/AutoExposureComposer.js";
import { MuxComposer } from "./composers/MuxComposer.js";
import { ChromaticAberrationComposer } from "./composers/ChromaticAberrationComposer.js";
import { RainyComposer } from "./composers/RainyComposer.js";


function EffectComposerFactory(name, parameters) {
    let composer = null;
    switch (name) {
        case "blank":
            composer = new BlankComposer(parameters);
            break;
        case "tone":
            composer = new ToneComposer(parameters);
            break;
        case "lut":
            composer = new LutComposer(parameters);
            break;
        case "bloom":
            composer = new BloomComposer(parameters);
            break;
        case "final":
            composer = new FinalComposer(parameters);
            break;
        case "vignette":
            composer = new VignetteComposer(parameters);
            break;
        case "grain":
            composer = new GrainComposer(parameters);
            break;
        case "motion":
            composer = new MotionBlurComposer(parameters);
            break;
        case "lensDistortion":
            composer = new LensDistortionComposer(parameters);
            break;
        case "autoExposure":
            composer = new AutoExposureComposer(parameters);
            break;
        case "mux":
            composer = new MuxComposer(parameters);
            break;
        case "chromaticAberration":
            composer = new ChromaticAberrationComposer(parameters);
            break;
        case "rainy":
            composer = new RainyComposer(parameters);
            break;

        default:
            console.log("Composer Not Found");
            break;
    }

    return composer;
}

EffectComposerFactory.prototype = Object.create(EffectComposerFactory.prototype);
EffectComposerFactory.prototype.constructor = EffectComposerFactory;
EffectComposerFactory.prototype.isEffectComposerFactory = true;

export { EffectComposerFactory };