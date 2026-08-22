import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ArrowLeft, Send, Paperclip } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { DataService } from '../../services/dataService';

export const CreateRequestScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [category, setCategory] = useState<'ACADEMIC' | 'CERTIFICATE' | 'FEES' | 'HOSTEL' | 'TRANSPORT'>('CERTIFICATE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: Array<{ id: typeof category; label: string }> = [
    { id: 'CERTIFICATE', label: 'Bonafide / Certificate' },
    { id: 'ACADEMIC', label: 'Academic / Elective' },
    { id: 'FEES', label: 'Fee Query / Receipt' },
    { id: 'HOSTEL', label: 'Hostel & Mess' },
    { id: 'TRANSPORT', label: 'Bus / Transportation' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Incomplete Form', 'Please enter both a title and description for your request.');
      return;
    }

    setLoading(true);
    try {
      await DataService.createServiceRequest(category, title, description);
      Alert.alert('Request Submitted', 'Your request has been officially recorded and dispatched to the respective university office.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
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
        <Text style={styles.topTitle}>New Service Request</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Select Request Category</Text>
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catPill, category === c.id && styles.activeCatPill]}
              onPress={() => setCategory(c.id)}
            >
              <Text style={[styles.catPillText, category === c.id && styles.activeCatPillText]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Request Subject / Title"
          placeholder="e.g. Bonafide certificate for passport verification"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Detailed Description"
          placeholder="Provide complete details, purpose, and relevant reference numbers..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100 }}
        />

        <TouchableOpacity
          style={styles.attachmentBox}
          onPress={() => Alert.alert('Attachment', 'Select photo or document from your device storage to attach.')}
        >
          <Paperclip size={18} color={THEME.colors.primary} />
          <Text style={styles.attachmentText}>Attach Supporting Document (PDF / Image)</Text>
        </TouchableOpacity>

        <Button
          title="Submit Official Request"
          onPress={handleSubmit}
          loading={loading}
          icon={<Send size={16} color="#FFFFFF" />}
          style={{ marginTop: 16 }}
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
  },
  sectionLabel: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  catPill: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  activeCatPill: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.text,
  },
  activeCatPillText: {
    color: '#FFFFFF',
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    gap: 8,
    marginTop: 4,
  },
  attachmentText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primary,
  },
});
