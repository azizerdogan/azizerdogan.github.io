import { useCallback, useRef } from 'react';
import { getSoundUrl, type SoundKey } from '../constants/sounds';

export function useSound(key: SoundKey) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(getSoundUrl(key));
    }

    const audio = audioRef.current;
    audio.volume = 1;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browsers may block autoplay until user interaction.
    });
  }, [key]);

  return play;
}
