import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AuthService } from '../../services/authService';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      const res = await AuthService.requestPasswordReset(identifier);
      setMessage(res.message);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          {submitted ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={48} color={THEME.colors.success} />
              <Text style={styles.successTitle}>Request Submitted</Text>
              <Text style={styles.successDesc}>{message}</Text>
              <Button
                title="Return to Login"
                onPress={() => navigation.navigate('Login')}
                style={{ marginTop: 20 }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Reset Your Password</Text>
              <Text style={styles.desc}>
                Enter your university enrollment number, faculty employee ID, or registered email. We will send password reset instructions to your verified mailbox.
              </Text>

              <Input
                label="University ID / Official Email"
                placeholder="e.g. 24010101001 or user@swarrnim.edu.in"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={THEME.colors.textSecondary} />}
              />

              <Button
                title="Send Reset Instructions"
                onPress={handleSubmit}
                loading={loading}
                icon={<Send size={18} color="#FFFFFF" />}
                style={{ marginTop: 8 }}
              />
            </>
          )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.medium,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    ...THEME.shadows.lg,
  },
  title: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
  },
  desc: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    marginBottom: THEME.spacing.base,
    lineHeight: 18,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    marginTop: 12,
  },
  successDesc: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
