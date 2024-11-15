import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const durations = [
    { title: "Blitz", time: "5 mins" },
    { title: "Rapid", time: "15 mins" },
    { title: "Classical", time: "60 mins" },
  ];

  const types = [
    { title: "Normal", type: "Standard" },
    { title: "Fischer", type: "Increment: +5 sec" },
    { title: "Bronstein", type: "Increment: +3 sec" },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-[#121212]">
      <div className="mt-0 space-y-2 flex flex-col items-center justify-center">
        <Image
          src={"/logo.png"}
          width={72}
          height={72}
          className="w-16"
          alt="logo"
        />
        <h2 className="text-lg font-bold text-white tracking-tighter font-unbounded">
          Chess Clock
        </h2>
      </div>

      <div className="mt-4 flex justify-center items-center w-full flex-col space-y-6">
        {/* Duration Section */}
        <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3">
          <h2 className="text-lg font-bold font-ubuntu">Duration</h2>
          <div className="grid grid-cols-3 gap-4 w-full justify-center items-center">
            {durations.map((duration, index) => (
              <button
                key={index}
                className="border border-neutral-800 hover:border-neutral-300 w-full flex flex-col items-center justify-center p-4 bg-primary hover:bg-green-500 rounded-lg transition-all duration-300 group cursor-pointer"
              >
                <span className="text-lg text-white font-bold group-hover:text-white transition-colors duration-300">
                  {duration.title}
                </span>
                <span className="text-xs text-neutral-400 group-hover:text-white transition-colors duration-300">
                  {duration.time}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Section */}
        <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3 border-t border-neutral-500">
          <h2 className="text-lg font-bold font-ubuntu">Type</h2>
          <div className="grid grid-cols-3 gap-4 w-full justify-center items-center">
            {types.map((typeItem, index) => (
              <button
                key={index}
                className="border border-neutral-800 hover:border-neutral-300 w-full flex flex-col items-center justify-center p-4 bg-primary hover:bg-green-500 rounded-lg transition-all duration-300 group cursor-pointer"
              >
                <span className="text-lg text-white font-bold group-hover:text-white transition-colors duration-300">
                  {typeItem.title}
                </span>
                <span className="text-xs text-neutral-400 group-hover:text-white transition-colors duration-300">
                  {typeItem.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center items-center w-full fixed bottom-4 left-0 right-0 px-8">
        <Button className="w-full mb-4 font-unbounded text-xl font-bold text-white bg-green-500 border border-neutral-300 py-6 hover:border-white hover:bg-green-600 transition-all duration-300 rounded-lg">
          Start Now
        </Button>
      </div>
    </main>
  );
}
