import blissWallpaper from '../assets/images/Bliss Wallpaper.png';
import erdoganXpLoader from '../assets/images/ErdoganXP Loader.png';
import erdoganXpLogo from '../assets/images/ErdoganXP.png';
import loadingCubes from '../assets/images/Loading Cubes.png';
import linkedInPhoto from '../assets/images/LinkedIn Photo.png';
import { getSoundUrl, SOUNDS, type SoundKey } from '../constants/sounds';

const IMAGE_ASSETS = [erdoganXpLoader, loadingCubes, erdoganXpLogo, linkedInPhoto, blissWallpaper];

const PRELOAD_SOUNDS: SoundKey[] = [
  'startup',
  'logon',
  'shutdown',
  'error',
  'chord',
];

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function preloadSound(key: SoundKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(getSoundUrl(key));
    audio.preload = 'auto';
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject(new Error(`Failed to load sound: ${SOUNDS[key]}`));
    audio.load();
  });
}

export async function preloadAssets(): Promise<void> {
  await Promise.all([
    ...IMAGE_ASSETS.map(preloadImage),
    ...PRELOAD_SOUNDS.map(preloadSound),
  ]);
}
