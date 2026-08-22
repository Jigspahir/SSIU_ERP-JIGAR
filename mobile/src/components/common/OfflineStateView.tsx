import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WifiOff, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface OfflineStateViewProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  isCachedDataShown?: boolean;
  customMessage?: string;
}

export const OfflineStateView: React.FC<OfflineStateViewProps> = ({
  onRetry,
  isRetrying = false,
  isCachedDataShown = true,
  customMessage,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <WifiOff size={32} color={THEME.colors.accentDark} />
      </View>

      <Text style={styles.title}>No Internet Connection</Text>

      <Text style={styles.subtitle}>
        {customMessage ||
          (isCachedDataShown
            ? 'Displaying offline cached academic summaries. Official record updates require an active university network connection.'
            : 'Unable to reach Swarrnim University ERP servers. Please check your Wi-Fi or mobile data.')}
      </Text>

      {onRetry && (
        <Button
          title={isRetrying ? 'Reconnecting...' : 'Retry Connection'}
          onPress={onRetry}
          loading={isRetrying}
          icon={<RefreshCw size={16} color="#FFFFFF" />}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginVertical: 12,
    ...THEME.shadows.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: 16,
    minWidth: 180,
  },
});
