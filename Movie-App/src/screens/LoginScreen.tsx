import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../theme/theme';
import { login, LoginData } from '../api/authApi';

const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle input changes
  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.username.trim() || !formData.password.trim()) {
      setError(t('auth.errorRequired'));
      return false;
    }
    return true;
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData);
      console.log('Login successful:', response);
      
      // Ensure we have both token and user data
      if (response.token && response.user) {
        // Reset navigation state and navigate to Tab
        navigation.reset({
          index: 0,
          routes: [{ name: 'Tab' }],
        });
      } else {
        setError(t('auth.errorInvalidResponse'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Handle specific error responses from the backend
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat().join(', ');
        setError(errorMessages || t('auth.errorInvalidCredentials'));
      } else {
        setError(t('auth.errorNetwork')); // Generic network error
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.login')}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.username')}
            placeholderTextColor={COLORS.Grey}
            value={formData.username}
            onChangeText={(text) => handleInputChange('username', text)}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            placeholderTextColor={COLORS.Grey}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.White} />
          ) : (
            <Text style={styles.loginButtonText}>{t('auth.loginButton')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{t('auth.noAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>{t('auth.signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  content: {
    flex: 1,
    padding: SPACING.space_36,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.White,
    marginBottom: SPACING.space_36,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.space_16,
  },
  input: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: SPACING.space_12,
    padding: SPACING.space_16,
    color: COLORS.White,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: COLORS.Orange,
    padding: SPACING.space_16,
    borderRadius: SPACING.space_12,
    alignItems: 'center',
    marginTop: SPACING.space_16,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.Grey, // Dimmed color when disabled
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.White,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: SPACING.space_12,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.space_24,
  },
  registerText: {
    color: COLORS.Grey,
  },
  registerLink: {
    color: COLORS.Orange,
    fontWeight: 'bold',
  },
});

export default LoginScreen;