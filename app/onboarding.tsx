import React from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { setHasOnboarded } from '../src/storage/settingsStorage';
import { Routes } from '../src/navigation/routes';

export default function OnboardingRoute() {
  const router = useRouter();

  const handleDone = () => {
    void setHasOnboarded(true);
    router.replace(Routes.home);
  };

  return <OnboardingScreen onDone={handleDone} />;
}
