import { FloatingParticles } from './FloatingParticles';
/** A lavender twilight sky, dust clouds and independently shimmering stars. */
export function StardustLayers() {
  return <>
    <div className="noxi-stardust-cloud noxi-stardust-cloud--a" />
    <div className="noxi-stardust-cloud noxi-stardust-cloud--b" />
    <div className="noxi-stardust-glimmer noxi-stardust-glimmer--a" />
    <div className="noxi-stardust-glimmer noxi-stardust-glimmer--b" />
    <FloatingParticles />
  </>;
}
