import Image from "next/image";
import { TextShimmerWave } from "../ui/text-shimmer-wave";

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
     <TextShimmerWave
      className='[--base-color:#f8f8f8] [--base-gradient-color:#ffffff] text-lg font-bold tracking-wide font-unbounded'
      duration={1.75}
      spread={2}
      zDistance={12}
      scaleDistance={1.1}
      rotateYDistance={12}
    >
      Chess Ticks
    </TextShimmerWave>
  </div>
);

export default Header;
