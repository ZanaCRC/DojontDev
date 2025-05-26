
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
      <h2 className="text-5xl font-semibold  pb-12">Welcome to DOJON&apos;T</h2>
      <p className="text-xl font-light  pb-6">Step into Dojon’t — the ultimate arena where gaming meets the power of blockchain. Easily connect your Braavos or ArgentX wallet, stake your assets, and get ready to battle in intense, turn-based duels full of strategy and excitement.</p>

      <p className="text-xl font-light  pb-6">⚔️ Prove your skill, take smart risks, and win real rewards in this competitive web3-powered experience.</p>
      <p className="text-xl font-light  pb-6">¿Tienes lo que se necesita para dominar el dojo?
      Do you have what it takes to master the dojo? ¡Join the fight and claim your victory!</p>

      
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


