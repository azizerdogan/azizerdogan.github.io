import chord from '../assets/sounds/(2001) Windows XP/chord.wav';
import balloon from '../assets/sounds/(2001) Windows XP/Windows XP Balloon.wav';
import error from '../assets/sounds/(2001) Windows XP/Windows XP Error.wav';
import logon from '../assets/sounds/(2001) Windows XP/Windows XP Logon Sound.wav';
import minimize from '../assets/sounds/(2001) Windows XP/Windows XP Minimize.wav';
import restore from '../assets/sounds/(2001) Windows XP/Windows XP Restore.wav';
import shutdown from '../assets/sounds/(2001) Windows XP/Windows XP Shutdown.wav';
import startup from '../assets/sounds/(2001) Windows XP/Windows XP Startup.wav';

export const SOUNDS = {
  startup,
  logon,
  shutdown,
  error,
  chord,
  restore,
  minimize,
  balloon,
} as const;

export type SoundKey = keyof typeof SOUNDS;

export function getSoundUrl(key: SoundKey): string {
  return SOUNDS[key];
}
