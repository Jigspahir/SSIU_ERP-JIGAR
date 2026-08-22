import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Clock, Bell, ExternalLink, ShieldCheck, Share2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const NotificationDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const notification = route?.params?.notification || {
    id: 'notif-1',
    title: 'University Notice',
    message: 'Detailed announcement information.',
    module: 'NOTICE',
    type: 'INFO',
    createdAt: 'Today',
  };

  const handleDeepLink = () => {
    const mod = (notification.module || '').toUpperCase();
    if (mod.includes('ATTENDANCE')) {
      navigation.navigate('StudentAttendance');
    } else if (mod.includes('EXAM') || mod.includes('RESULT')) {
      navigation.navigate('StudentExam');
    } else if (mod.includes('PTM')) {
      navigation.navigate('ParentPTM');
    } else if (mod.includes('REQUEST') || mod.includes('COMPLAINT') || mod.includes('GRIEVANCE')) {
      navigation.navigate('StudentRequests');
    } else if (mod.includes('FEE')) {
      navigation.navigate('ParentFees');
    } else if (mod.includes('DOC')) {
      navigation.navigate('StudentDocuments');
    } else {
      Alert.alert('Notice Details', 'Viewing full university circular content.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notification Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Badge label={notification.module} variant="primary" size="sm" />
            <View style={styles.timeRow}>
              <Clock size={12} color={THEME.colors.textMuted} />
              <Text style={styles.timeText}>{notification.createdAt}</Text>
            </View>
          </View>

          <Text style={styles.title}>{notification.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.message}>{notification.message}</Text>

          {/* Deep Linking Navigation Button */}
          <Button
            title={`Open Related ${notification.module} Screen`}
            onPress={handleDeepLink}
            icon={<ExternalLink size={16} color="#FFFFFF" />}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  topBar: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: THEME.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  topTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: THEME.spacing.base,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.text,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 14,
  },
  message: {
    fontSize: THEME.typography.sizes.base,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
});
