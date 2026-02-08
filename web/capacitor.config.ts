import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'corevo.CartaoFidelidade',
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
