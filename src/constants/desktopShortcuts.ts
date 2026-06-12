import aboutMeIcon from '../assets/icons/About Me Icon.png';
import contactMeIcon from '../assets/icons/Contact Me Icon.png';
import projectsIcon from '../assets/icons/Projects Icon.png';
import resumeIcon from '../assets/icons/Resume Icon.png';

export const DESKTOP_SHORTCUTS = [
  { id: 'about', label: 'About Me', icon: aboutMeIcon },
  { id: 'resume', label: 'My Resume', icon: resumeIcon },
  { id: 'projects', label: 'My Projects', icon: projectsIcon },
  { id: 'contact', label: 'Contact Me', icon: contactMeIcon },
] as const;

export type ShortcutId = (typeof DESKTOP_SHORTCUTS)[number]['id'];

export type DesktopShortcut = (typeof DESKTOP_SHORTCUTS)[number];
