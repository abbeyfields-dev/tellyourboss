import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TellYourBossScreen } from './src/screens/TellYourBossScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TellYourBossScreen />
    </SafeAreaProvider>
  );
}
