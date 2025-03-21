import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../theme/theme';
import { register } from '../api/authApi';

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError(t('auth.errorRequired'));
      return false;
    }

    if (formData.password !== formData.password2) {
      setError(t('auth.errorPasswordMatch'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('auth.errorInvalidEmail'));
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigation.navigate('Login');
    } catch (err: any) {
      if (err.response?.data) {
        // Handle specific backend validation errors
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(t('auth.errorInvalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.register')}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.username')}
              placeholderTextColor={COLORS.Grey}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              placeholderTextColor={COLORS.Grey}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              placeholderTextColor={COLORS.Grey}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirmPassword')}
              placeholderTextColor={COLORS.Grey}
              value={formData.password2}
              onChangeText={(text) => setFormData({ ...formData, password2: text })}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.White} />
            ) : (
              <Text style={styles.registerButtonText}>{t('auth.registerButton')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.haveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollContent: {
    flexGrow: 1,
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
  registerButton: {
    backgroundColor: COLORS.Orange,
    padding: SPACING.space_16,
    borderRadius: SPACING.space_12,
    alignItems: 'center',
    marginTop: SPACING.space_16,
  },
  registerButtonText: {
    color: COLORS.White,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: SPACING.space_12,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.space_24,
  },
  loginText: {
    color: COLORS.Grey,
  },
  loginLink: {
    color: COLORS.Orange,
    fontWeight: 'bold',
  },
});

export { RegisterScreen };
export default RegisterScreen;
