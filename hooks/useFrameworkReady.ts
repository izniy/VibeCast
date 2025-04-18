import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Font from 'expo-font';
import { preventAutoHideAsync, hideAsync } from 'expo-splash-screen';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await preventAutoHideAsync();

        // Load fonts or other resources here
        await Font.loadAsync({
          // Add your custom fonts here
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await hideAsync();
      }
    }

    prepare();
  }, []);

  return isReady;
}
