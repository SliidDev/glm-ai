import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SplashScreen as SplashScreenView } from '../src/screens/SplashScreen';
import { getHasOnboarded } from '../src/storage/settingsStorage';
import { Routes } from '../src/navigation/routes';

export default function IndexRoute() {
  const router = useRouter();
  const [dataReady, setDataReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    void (async () => {
      const onboarded = await getHasOnboarded();
      setHasOnboarded(onboarded);
      setDataReady(true);
    })();
  }, []);

  // Navigate only once BOTH the splash's own minimum-display animation
  // has finished AND the onboarding check has resolved — whichever of
  // the two happens to finish first just waits for the other, so a
  // slow first-launch storage read can never leave this screen stuck.
  useEffect(() => {
    if (animationDone && dataReady) {
      router.replace(hasOnboarded ? Routes.home : Routes.onboarding);
    }
  }, [animationDone, dataReady, hasOnboarded, router]);

  return <SplashScreenView onFinished={() => setAnimationDone(true)} />;
}
