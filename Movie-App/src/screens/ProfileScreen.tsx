// screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SPACING } from '../theme/theme';

interface ProfileData {
  name: string;
  photo: string | null;
}

const ProfileScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme, toggleTheme, colors } = useTheme(); // Use toggleTheme instead of setTheme
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    photo: null,
  });
  const [tempProfileData, setTempProfileData] = useState<ProfileData>({
    name: '',
    photo: null,
  });

  React.useEffect(() => {
    loadProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      // Reset navigation stack to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('profileData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setProfileData(parsed);
        setTempProfileData(parsed);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const saveProfileData = async () => {
    try {
      await AsyncStorage.setItem('profileData', JSON.stringify(tempProfileData));
      setProfileData(tempProfileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempProfileData(prev => ({
        ...prev,
        photo: result.assets[0].uri,
      }));
    }
  };

  const renderEditMode = () => (
    <View style={[styles.editContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {tempProfileData.photo ? (
          <Image source={{ uri: tempProfileData.photo }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.border }]}>
            <Text style={[styles.photoPlaceholderText, { color: colors.text }]}>+</Text>
          </View>
        )}
        <Text style={[styles.changePhotoText, { color: colors.primary }]}>
          {t('profile.changePhoto')}
        </Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{t('profile.name')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          value={tempProfileData.name}
          onChangeText={text => setTempProfileData(prev => ({ ...prev, name: text }))}
          placeholder={t('profile.name')}
          placeholderTextColor={colors.secondaryText}
        />
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.settings')}</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.language')}</Text>
          <LanguageSwitcher />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.themeToggleContainer}>
            <Ionicons name={theme === 'light' ? 'sunny' : 'moon'} size={24} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text, marginLeft: 10 }]}>
              {theme === 'light' ? t('profile.lightMode') : t('profile.darkMode')}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={saveProfileData}
      >
        <Text style={[styles.saveButtonText, { color: colors.background }]}>
          {t('profile.save')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderViewMode = () => (
    <View style={[styles.viewContainer, { backgroundColor: colors.card }]}>
      <View style={styles.photoContainer}>
        {profileData.photo ? (
          <Image source={{ uri: profileData.photo }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.border }]}>
            <Ionicons name="person-outline" size={40} color={colors.text} />
          </View>
        )}
        <Text style={[styles.nameText, { color: colors.text }]}>
          {profileData.name || t('profile.name')}
        </Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.background }]}
          onPress={() => setIsEditing(true)}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="pencil" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              {t('profile.editProfile')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.background }]}
          onPress={() => navigation.navigate('TicketScreen')}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name="ticket" size={24} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              {t('profile.myTickets')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.menuItem, { backgroundColor: colors.background }]}>
          <View style={styles.menuItemContent}>
            <Ionicons 
              name={theme === 'light' ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.text} 
            />
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              {theme === 'light' ? t('profile.lightMode') : t('profile.darkMode')}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.primary }]} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.background} />
        <Text style={[styles.logoutText, { color: colors.background }]}>{t('profile.logout')}</Text>
      </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="arrow-back"
          header={t('common.profile')}
          action={() => navigation.goBack()}
        />
      </View>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {isEditing ? renderEditMode() : renderViewMode()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    margin: 16,
  },
  editContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    margin: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_16,
    marginBottom: SPACING.space_10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    height: 48,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ProfileScreen;