
import { BorderBeam } from "../components/ShadcnComponents/BorderBeam";
import { Particles } from "./ShadcnComponents/Particles";
export function BorderBeamCard() {
  return (
    <section className="relative w-full h-full overflow-hidden text-neutral-300 z-50 rounded-xl p-12 bg-neutral-900/80 mb-20 mt-32 shadow-lg inner-shadow-lg shadow-black"
    style={{
      WebkitMaskImage:
      'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)',
    maskImage:
      'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    }}>
      

      <article className="flex flex-col justify-center items-center tracking-wide leading-tight">
      <h2 className="text-5xl font-semibold  pb-12">Bienvenido a DOJON&apos;T</h2>
      <p className="text-xl font-light  pb-6">Entra en Dojon’t, la arena definitiva donde el juego se une con el poder del blockchain. Conéctate fácilmente con tu wallet Braavos o ArgentX, apuesta tus activos y prepárate para luchar en intensas batallas por turnos llenas de táctica y emoción.</p>

      <p className="text-xl font-light  pb-6">⚔️ Demuestra tu habilidad, arriesga con inteligencia y gana premios reales en esta experiencia competitiva impulsada por tecnología web3.</p>
      <p className="text-xl font-light  pb-6">¿Tienes lo que se necesita para dominar el dojo?
      ¡Únete a la batalla y conquista tu victoria!</p>

      
      </article>
      <Particles 
      className="absolute inset-0 z-0"
      quantity={70}
      ease={80}
      color="#4F7CEC"
      refresh/>
      <BorderBeam duration={5} size={200} />
    </section>
  );
}


