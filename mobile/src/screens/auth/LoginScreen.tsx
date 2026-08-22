import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ShieldCheck, User, Lock, ArrowRight, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CONFIG } from '../../constants/config';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your University ID or registered Email.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
      const result = await login(identifier, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Login failed. Please check credentials.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (roleId: string, rolePass: string = 'Student@123') => {
    setIdentifier(roleId);
    setPassword(rolePass);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Header & Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.logoCircle}>
            <ShieldCheck size={36} color={THEME.colors.accent} />
          </View>
          <Text style={styles.brandTitle}>SWARRNIM</Text>
          <Text style={styles.brandSubtitle}>STARTUP & INNOVATION UNIVERSITY</Text>
          <View style={styles.goldBadge}>
            <Sparkles size={12} color="#78350F" />
            <Text style={styles.goldBadgeText}>Official ERP Mobile App</Text>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.loginHeading}>Sign In to Your Portal</Text>
          <Text style={styles.loginDesc}>
            Enter your university credentials to access attendance, results, diary, and services.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Input
            label="University ID / Registered Email"
            placeholder="e.g. 24010101001, student, parent"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setErrorMessage('');
            }}
            autoCapitalize="none"
            leftIcon={<User size={18} color={THEME.colors.textSecondary} />}
          />

          <Input
            label="Password"
            placeholder="Enter your secure password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage('');
            }}
            isPassword
            leftIcon={<Lock size={18} color={THEME.colors.textSecondary} />}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In to ERP"
            onPress={handleLogin}
            loading={loading}
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={styles.submitBtn}
          />
        </View>

        {/* Quick Demo Credentials Selector */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Demo Account Selector</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={[styles.demoPill, identifier === 'student' && styles.activeDemoPill]}
              onPress={() => setDemoAccount('student', 'Student@123')}
            >
              <Text style={styles.demoPillText}>Student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, identifier === 'parent' && styles.activeDemoPill]}
              onPress={() => setDemoAccount('parent', 'Parent@123')}
            >
              <Text style={styles.demoPillText}>Parent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, identifier === 'faculty' && styles.activeDemoPill]}
              onPress={() => setDemoAccount('faculty', 'Faculty@123')}
            >
              <Text style={styles.demoPillText}>Faculty</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, identifier === 'mentor' && styles.activeDemoPill]}
              onPress={() => setDemoAccount('mentor', 'Faculty@123')}
            >
              <Text style={styles.demoPillText}>Mentor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, identifier === 'admin' && styles.activeDemoPill]}
              onPress={() => setDemoAccount('admin', 'Admin@123')}
            >
              <Text style={styles.demoPillText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Protected by Swarrnim 256-bit Encrypted University Security Engine
          </Text>
          <Text style={styles.versionText}>{CONFIG.VERSION}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.primaryLight,
    borderWidth: 2,
    borderColor: THEME.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...THEME.shadows.md,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: THEME.typography.weights.black,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    marginTop: 8,
    gap: 4,
  },
  goldBadgeText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: '#78350F',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    ...THEME.shadows.lg,
  },
  loginHeading: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  loginDesc: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    marginBottom: THEME.spacing.base,
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: THEME.colors.dangerLight,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.danger,
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: THEME.typography.weights.medium,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.primary,
    fontWeight: THEME.typography.weights.semibold,
  },
  submitBtn: {
    marginTop: 4,
  },
  demoSection: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  demoTitle: {
    fontSize: 11,
    color: THEME.colors.accentLight,
    fontWeight: THEME.typography.weights.bold,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  demoPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
  },
  activeDemoPill: {
    backgroundColor: THEME.colors.accent,
  },
  demoPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
  versionText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
});
