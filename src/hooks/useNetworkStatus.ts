import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NetworkState } from '../types';

const INITIAL_STATE: NetworkState = { isConnected: true, isInternetReachable: true };

export function useNetworkStatus(): NetworkState {
  const [state, setState] = useState<NetworkState>(INITIAL_STATE);

  useEffect(() => {
    const apply = (s: { isConnected: boolean | null; isInternetReachable: boolean | null }) =>
      setState({ isConnected: s.isConnected ?? true, isInternetReachable: s.isInternetReachable });

    const unsubscribe = NetInfo.addEventListener(apply);
    NetInfo.fetch().then(apply);
    return () => unsubscribe();
  }, []);

  return state;
}
