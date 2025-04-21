import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text as PaperText } from 'react-native-paper';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from 'nativewind';
import Constants from 'expo-constants';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });

      if (error) throw error;

      // Force a refresh of the session to update the UI
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      setShowEditModal(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditProfile = () => {
    setNewName(user?.user_metadata?.full_name || '');
    setShowEditModal(true);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: handleEditProfile
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'log-out-outline',
      title: 'Sign Out',
      onPress: handleSignOut
    }
  ];

  const fullName = user?.user_metadata?.full_name || 'Anonymous';
  const email = user?.email || '';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.contentWrapper, Platform.OS === 'web' && styles.webContentWrapper]}>
          <View style={styles.header}>
            <PaperText 
              variant="headlineLarge" 
              style={[styles.name, isDark && styles.textLight]}
            >
              {fullName}
            </PaperText>
            <PaperText 
              variant="bodyLarge"
              style={[styles.email, isDark && styles.textMuted]}
            >
              {email}
            </PaperText>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                disabled={isUpdating}
                style={[
                  styles.menuItem,
                  isDark && styles.menuItemDark,
                  isUpdating && styles.disabled
                ]}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                    style={styles.menuIcon}
                  />
                  <Text style={[
                    styles.menuText,
                    isDark && styles.textLight
                  ]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[
            styles.version,
            isDark && styles.textMuted
          ]}>
            VibeCast v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[
            styles.modalContent,
            isDark && styles.modalContentDark
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                isDark && styles.textLight
              ]}>
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                disabled={isUpdating}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[
                styles.label,
                isDark && styles.textMuted
              ]}>
                Full Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark && styles.inputDark
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                value={newName}
                onChangeText={setNewName}
                autoCapitalize="words"
                editable={!isUpdating}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  isDark && styles.cancelButtonDark
                ]}
                onPress={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <Text style={[
                  styles.buttonText,
                  styles.cancelButtonText,
                  isDark && styles.cancelButtonTextDark
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  isUpdating && styles.disabled
                ]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <Text style={styles.buttonText}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  webContentWrapper: {
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
  },
  name: {
    fontSize: Platform.OS === 'web' ? 36 : 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1F2937',
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    ...Platform.select({
      web: {
        maxWidth: 480,
        alignSelf: 'center',
        width: '100%',
        margin: 24,
        borderRadius: 16,
      },
    }),
  },
  modalContentDark: {
    backgroundColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonDark: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#6B7280',
  },
  cancelButtonTextDark: {
    color: '#D1D5DB',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  disabled: {
    opacity: 0.7,
  },
  textLight: {
    color: '#F9FAFB',
  },
  textMuted: {
    color: '#9CA3AF',
  },
}); 