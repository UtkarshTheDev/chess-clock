import Image from "next/image";
import ShinyText from "../../TextAnimations/ShinyText/ShinyText";

const Header = () => (
  <div className="mt-0 space-y-2 flex flex-col items-center justify-center">
    <Image
      src={"/logo.png"}
      width={72}
      height={72}
      className="w-16"
      alt="ChessTicks - Professional Chess Timer and Tournament Clock Logo"
      priority
    />
    <ShinyText text="Chess Ticks" disabled={false} speed={3} className='text-lg font-bold text-white tracking-normal font-unbounded' />
  </div>
);

export default Header;
