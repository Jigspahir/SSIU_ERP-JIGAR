import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetwork } from '../../context/NetworkContext';
import { THEME } from '../../constants/theme';

export const OfflineNotice: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetwork();

  if (isConnected && isInternetReachable !== false) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <WifiOff size={16} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.text}>
        You are currently offline. Showing cached academic records.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 999,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.medium,
  },
});
