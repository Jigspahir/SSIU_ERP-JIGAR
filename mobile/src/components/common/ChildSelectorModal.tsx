import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Check, User, GraduationCap, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { THEME } from '../../constants/theme';
import { Student } from '../../types';

interface ChildSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChildSelectorModal: React.FC<ChildSelectorModalProps> = ({ visible, onClose }) => {
  const { linkedChildren, selectedChild, setSelectedChild } = useAuth();

  const handleSelect = (child: Student) => {
    setSelectedChild(child);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <GraduationCap size={22} color={THEME.colors.primary} />
                  <Text style={styles.title}>Select Child / Ward</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={THEME.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Choose which linked student profile you would like to view and manage.
              </Text>

              <FlatList
                data={linkedChildren}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedChild?.id === item.id;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSelect(item)}
                      style={[styles.childItem, isSelected && styles.selectedItem]}
                    >
                      <View style={styles.avatar}>
                        <User size={20} color={isSelected ? THEME.colors.primary : THEME.colors.textSecondary} />
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={[styles.childName, isSelected && styles.selectedText]}>
                          {item.name}
                        </Text>
                        <Text style={styles.childMeta}>
                          {item.enrollmentNo} • {item.programName || 'Degree Student'}
                        </Text>
                        <Text style={styles.childDept}>
                          {item.instituteName || 'Swarrnim University'}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkCircle}>
                          <Check size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 64, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.base,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
  },
  selectedItem: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#F0F7FF',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.text,
  },
  selectedText: {
    color: THEME.colors.primary,
  },
  childMeta: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  childDept: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
