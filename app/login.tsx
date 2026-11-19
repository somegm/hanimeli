import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/auth/AuthTextField';
import { AnimatedFadeIn } from '@/components/ui/AnimatedFadeIn';
import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, shadows, spacing } from '@/theme';
import type { AuthMode } from '@/types/auth';
import {
  AUTH_LIMITS,
  validateDisplayName,
  validateEmail,
  validateLoginPassword,
  validateSignupPassword,
} from '@/utils/authValidation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleGuestContinue = useCallback(() => {
    void continueAsGuest().then(() => {
      router.replace('/(tabs)' as Href);
    });
  }, [continueAsGuest, router]);

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;
    const trimmedName = displayName.trim();

    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (mode === 'signup') {
      const nameError = validateDisplayName(trimmedName);
      if (nameError) {
        setError(nameError);
        return;
      }

      const passwordError = validateSignupPassword(trimmedPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    } else {
      const passwordError = validateLoginPassword(trimmedPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const result =
      mode === 'login'
        ? await login(trimmedEmail, trimmedPassword)
        : await signup(trimmedEmail, trimmedPassword, trimmedName);

    if (result) {
      setError(result);
    } else {
      router.replace('/(tabs)' as Href);
    }

    setIsSubmitting(false);
  }, [email, password, displayName, mode, login, signup, router]);

  const isLogin = mode === 'login';

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AnimatedFadeIn direction="up">
              <View style={styles.hero}>
                <View style={styles.logoCircle}>
                  <Ionicons name="restaurant" size={36} color={colors.primary} />
                </View>
                <Text style={styles.title}>Hanımeli</Text>
                <Text style={styles.subtitle}>
                  Tarifler, indirimler ve alışveriş listeleri tek yerde.
                </Text>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn index={1}>
              <GlassCard style={styles.card}>
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => switchMode('login')}
                accessibilityRole="button"
                accessibilityLabel="Giriş yap"
              >
                <Text style={[styles.tabLabel, isLogin && styles.tabLabelActive]}>
                  Giriş Yap
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => switchMode('signup')}
                accessibilityRole="button"
                accessibilityLabel="Kayıt ol"
              >
                <Text style={[styles.tabLabel, !isLogin && styles.tabLabelActive]}>
                  Kayıt Ol
                </Text>
              </Pressable>
            </View>

            {!isLogin ? (
              <>
                <AuthTextField
                  label="Ad Soyad"
                  placeholder="Adınız Soyadınız"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  maxLength={AUTH_LIMITS.MAX_DISPLAY_NAME_LENGTH}
                />
                <Text style={styles.fieldHint}>
                  En fazla {AUTH_LIMITS.MAX_DISPLAY_NAME_LENGTH} karakter
                </Text>
              </>
            ) : null}

            <AuthTextField
              label="E-posta"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              maxLength={AUTH_LIMITS.MAX_EMAIL_LENGTH}
              autoCapitalize="none"
            />

            <View style={styles.passwordField}>
              <AuthTextField
                label="Şifre"
                placeholder={isLogin ? 'Şifreniz' : 'En az 8 karakter'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType={isLogin ? 'password' : 'newPassword'}
                style={styles.passwordInput}
                maxLength={AUTH_LIMITS.MAX_PASSWORD_LENGTH}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={togglePasswordVisibility}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {!isLogin ? (
              <Text style={styles.fieldHint}>
                En az 8 karakter, bir büyük harf ve bir noktalama işareti içermelidir.
              </Text>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              label={isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
              onPress={handleSubmit}
              disabled={isSubmitting}
            />

            {isSubmitting ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : null}
              </GlassCard>
            </AnimatedFadeIn>

            <AnimatedFadeIn index={2}>
              <Pressable
                style={styles.guestLink}
                onPress={handleGuestContinue}
                accessibilityRole="button"
                accessibilityLabel="Misafir olarak devam et"
              >
                <Text style={styles.guestLinkText}>Misafir olarak devam et</Text>
              </Pressable>
            </AnimatedFadeIn>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.glow,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  card: {
    padding: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surfaceHighlight,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  passwordField: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing.xl + spacing.md,
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md + 2,
    padding: spacing.xs,
  },
  error: {
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  loader: {
    marginTop: spacing.md,
  },
  guestLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  guestLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
});
