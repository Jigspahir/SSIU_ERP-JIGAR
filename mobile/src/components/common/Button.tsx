import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { THEME } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: THEME.colors.primaryLight, borderWidth: 0 };
      case 'accent':
        return { backgroundColor: THEME.colors.accent, borderWidth: 0 };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: THEME.colors.primary };
      case 'danger':
        return { backgroundColor: THEME.colors.danger, borderWidth: 0 };
      case 'ghost':
        return { backgroundColor: 'transparent', borderWidth: 0 };
      default:
        return { backgroundColor: THEME.colors.primary, borderWidth: 0 };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return THEME.colors.primary;
    if (variant === 'accent') return '#78350F';
    if (variant === 'ghost') return THEME.colors.primary;
    return THEME.colors.textInverse;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getContainerStyle(),
        size === 'sm' && styles.btnSm,
        size === 'lg' && styles.btnLg,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  btnLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.semibold,
  },
  textSm: {
    fontSize: THEME.typography.sizes.sm,
  },
  textLg: {
    fontSize: THEME.typography.sizes.lg,
  },
});
