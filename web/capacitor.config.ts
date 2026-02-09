import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'corevo.CorePlus',
  appName: 'Core+',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'localhost'
  }
};

export default config;
