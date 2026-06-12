import { AnimatePresence, motion } from 'framer-motion';
import { CrtOverlay } from './components/CrtOverlay/CrtOverlay';
import { ScreenFlowProvider } from './hooks/ScreenFlowProvider';
import { CrtProvider } from './hooks/CrtProvider';
import { VolumeProvider } from './hooks/VolumeProvider';
import { useScreenFlow } from './hooks/useScreenFlow';
import { BlackScreen } from './screens/BlackScreen';
import { BootScreen } from './screens/BootScreen';
import { DesktopScreen } from './screens/DesktopScreen';
import { LoginScreen } from './screens/LoginScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

const screenTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35 },
};

function AppContent() {
  const { screen, goTo } = useScreenFlow();
  const showNoiseOverlay = screen === 'black' || screen === 'boot';

  return (
    <>
    <AnimatePresence mode="wait">
      {screen === 'black' && (
        <motion.div key="black" {...screenTransition} style={{ width: '100%', height: '100%' }}>
          <BlackScreen onReady={() => goTo('boot')} />
        </motion.div>
      )}

      {screen === 'boot' && (
        <motion.div key="boot" {...screenTransition} style={{ width: '100%', height: '100%' }}>
          <BootScreen onBootComplete={() => goTo('login')} />
        </motion.div>
      )}

      {screen === 'login' && (
        <motion.div key="login" {...screenTransition} style={{ width: '100%', height: '100%' }}>
          <LoginScreen onLogin={() => goTo('welcome')} onRestart={() => goTo('black')} />
        </motion.div>
      )}

      {screen === 'welcome' && (
        <motion.div key="welcome" {...screenTransition} style={{ width: '100%', height: '100%' }}>
          <WelcomeScreen onComplete={() => goTo('desktop')} />
        </motion.div>
      )}

      {screen === 'desktop' && (
        <motion.div key="desktop" {...screenTransition} style={{ width: '100%', height: '100%' }}>
          <DesktopScreen />
        </motion.div>
      )}
    </AnimatePresence>
    {showNoiseOverlay && <CrtOverlay />}
    </>
  );
}

export default function App() {
  return (
    <VolumeProvider>
      <CrtProvider>
        <ScreenFlowProvider>
          <AppContent />
        </ScreenFlowProvider>
      </CrtProvider>
    </VolumeProvider>
  );
}
