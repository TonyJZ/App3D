import { GlowingBandEffect } from "./shaders/GlowingBandEffect.js";
import { ElectricEffect } from "./shaders/ElectricEffect.js";
import { EternalWheelEffect } from "./shaders/EternalWheelEffect.js";
import { ExplosionEffect } from "./shaders/ExplosionEffect.js";
import { FireEffect } from "./shaders/FireEffect.js";
import { FlowingLineEffectPipe } from "./shaders/FlowingLineEffectPipe";
import { RadarEffect } from "./shaders/RadarEffect.js";
import { RippleEffect } from "./shaders/RippleEffect.js";
import { RippleEffect2 } from "./shaders/RippleEffect2.js";
import { StarNestEffect } from "./shaders/StarNestEffect.js";
import { WaterEffect } from "./shaders/WaterEffect.js";
import { WaterEffect2 } from "./shaders/WaterEffect2.js";
import { HeatmapEffect } from "./shaders/HeatmapEffect.js";
import { BloomEffect } from "./shaders/BloomEffect.js";
import { AnimatedPNGEffect } from "./shaders/AnimatedPNGEffect.js";

function ShaderFactory(name, parameters) {
    let effect = null;
    switch (name) {
        case "GlowingBandEffect":
            effect = new GlowingBandEffect(parameters);
            break;
        case "ElectricEffect":
            effect = new ElectricEffect(parameters);
            break;
        case "EternalWheelEffect":
            effect = new EternalWheelEffect(parameters);
            break;
        case "ExplosionEffect":
            effect = new ExplosionEffect(parameters);
            break;
        case "FireEffect":
            effect = new FireEffect(parameters);
            break;
        case "FlowingLineEffectPipe":
            effect = new FlowingLineEffectPipe(parameters);
            break;
        case "RadarEffect":
            effect = new RadarEffect(parameters);
            break;
        case "RippleEffect":
            effect = new RippleEffect(parameters);
            break;
        case "RippleEffect2":
            effect = new RippleEffect2(parameters);
            break;
        case "StarNestEffect":
            effect = new StarNestEffect(parameters);
            break;
        case "WaterEffect":
            effect = new WaterEffect(parameters);
            break;
        case "WaterEffect2":
            effect = new WaterEffect2(parameters);
            break;
        case "HeatmapEffect":
            effect = new HeatmapEffect(parameters);
            break;
        case "BloomEffect":
            effect = new BloomEffect(parameters);
            break;
        case "AnimatedPNGEffect":
            effect = new AnimatedPNGEffect(parameters);
            break;

        default:
            console.log("No Such Effect");
            break;
    }

    return effect;
}
ShaderFactory.prototype = Object.create(ShaderFactory.prototype);
ShaderFactory.prototype.constructor = ShaderFactory;
ShaderFactory.prototype.isShaderFactory = true;

export { ShaderFactory };