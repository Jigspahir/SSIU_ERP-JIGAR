import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ArrowLeft, Send, ShieldAlert, Paperclip, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { DataService } from '../../services/dataService';

export const CreateComplaintScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [complaintCategory, setComplaintCategory] = useState<'ACADEMIC' | 'EVALUATION' | 'FACILITY' | 'ADMINISTRATION'>('ACADEMIC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories: Array<{ id: typeof complaintCategory; label: string }> = [
    { id: 'ACADEMIC', label: 'Academic & Curriculum' },
    { id: 'EVALUATION', label: 'Evaluation / CIE Marks' },
    { id: 'FACILITY', label: 'Campus & Lab Facilities' },
    { id: 'ADMINISTRATION', label: 'Administrative Grievance' },
  ];

  const handleAttach = () => {
    Alert.alert('Attachment Selected', 'Attached: supporting_evidence.pdf (420 KB)');
    setAttachment('supporting_evidence.pdf (420 KB)');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Incomplete Form', 'Please describe your grievance completely.');
      return;
    }

    setLoading(true);
    try {
      await DataService.createServiceRequest('GRIEVANCE', title, `[${complaintCategory}] ${description}`, 'HIGH');
      Alert.alert(
        'Grievance Registered',
        'Your grievance ticket has been securely submitted to the University Grievance Redressal Committee. You can track progress in your Requests tab.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Lodge Official Grievance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <ShieldAlert size={20} color="#991B1B" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.bannerTitle}>University Grievance Redressal Cell</Text>
            <Text style={styles.bannerText}>
              All submitted grievances are handled with strict institutional confidentiality as mandated by UGC & SSIU University bylaws.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Select Grievance Category</Text>
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catPill, complaintCategory === c.id && styles.activeCatPill]}
              onPress={() => setComplaintCategory(c.id)}
            >
              <Text style={[styles.catPillText, complaintCategory === c.id && styles.activeCatPillText]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Grievance Title / Nature"
          placeholder="e.g. Discrepancy in continuous evaluation marks"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Detailed Statement"
          placeholder="State the exact issue, dates, faculty/department, and relief requested..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={{ height: 110 }}
        />

        <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
          <Paperclip size={16} color={THEME.colors.primary} />
          <Text style={styles.attachBtnText}>
            {attachment ? `Attached: ${attachment}` : 'Attach Evidence / Proof (PDF, Screenshot)'}
          </Text>
        </TouchableOpacity>

        <Button
          title="Submit Official Grievance"
          variant="danger"
          onPress={handleSubmit}
          loading={loading}
          icon={<Send size={16} color="#FFFFFF" />}
          style={{ marginTop: 14 }}
        />
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
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bannerTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  bannerText: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
    lineHeight: 15,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  activeCatPill: {
    backgroundColor: THEME.colors.danger,
    borderColor: THEME.colors.danger,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  activeCatPillText: {
    color: '#FFFFFF',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#93C5FD',
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  attachBtnText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primary,
  },
});
