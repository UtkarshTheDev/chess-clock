declare module "use-sound" {
  export default function useSound(
    src: string,
    options?: {
      volume?: number;
      playbackRate?: number;
      interrupt?: boolean;
      soundEnabled?: boolean;
      sprite?: Record<string, [number, number]>;
      // Add other options as needed
    }
  ): [() => void, { sound: HTMLAudioElement }];
}
