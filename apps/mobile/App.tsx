import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './app/lib/api';
import {
  validateMobileEmail,
  validateMobilePassword,
  validateMobileRegisterForm,
} from './app/lib/auth-validation';

type Screen = 'home' | 'login' | 'register' | 'dashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [loading, setLoading] = useState(false);

  // Shared auth state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cliente');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('itzalanAccessToken');
      if (token) {
        setScreen('dashboard');
        loadProfile(token);
      }
    })();
  }, []);

  async function handleLogin() {
    setError('');
    setSuccess('');

    const emailError = validateMobileEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validateMobilePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const data = await res.json();
        const message = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(message || 'Credenciales inválidas');
      }
      const data = await res.json();
      await AsyncStorage.setItem('itzalanAccessToken', data.accessToken);
      if (data.refreshToken) await AsyncStorage.setItem('itzalanRefreshToken', data.refreshToken);
      setScreen('dashboard');
      await loadProfile(data.accessToken);
      setSuccess('Sesión iniciada correctamente.');
    } catch (err: any) {
      setError(err.message || 'No se pudo conectar con la API');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError('');
    setSuccess('');

    const validationError = validateMobileRegisterForm({ name, email, password, role });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        const message = Array.isArray(data.message) ? data.message[0] : data.message;
        throw new Error(message || 'Error al registrar');
      }
      const data = await res.json();
      await AsyncStorage.setItem('itzalanAccessToken', data.accessToken);
      if (data.refreshToken) await AsyncStorage.setItem('itzalanRefreshToken', data.refreshToken);
      setScreen('dashboard');
      await loadProfile(data.accessToken);
      setSuccess('Cuenta creada correctamente.');
    } catch (err: any) {
      setError(err.message || 'No se pudo conectar con la API');
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile(accessToken: string) {
    try {
      const res = await apiFetch('/auth/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      setProfile(data);
      setError('');
    } catch {
      setProfile(null);
      setError('No se pudo cargar el perfil');
    }
  }

  async function handleLogout() {
    const refreshToken = await AsyncStorage.getItem('itzalanRefreshToken');
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore
      }
    }
    await AsyncStorage.removeItem('itzalanAccessToken');
    await AsyncStorage.removeItem('itzalanRefreshToken');
    setProfile(null);
    setError('');
    setSuccess('');
    setScreen('home');
  }

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>ITZALAN TECH – Automatización Legal</Text>
          <Text style={styles.text}>Solución móvil LegalTech para seguimiento de casos y expedientes.</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Accede a tu cuenta</Text>
            <TouchableOpacity style={styles.button} onPress={() => setScreen('login')}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.outline]} onPress={() => setScreen('register')}>
              <Text style={styles.outlineText}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('home')} style={{ marginTop: 12 }}>
            <Text style={styles.link}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Crear cuenta</Text>
          <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
          <View style={styles.roleRow}>
            {['cliente', 'abogado', 'asistente'].map((roleOption) => (
              <TouchableOpacity
                key={roleOption}
                style={[styles.rolePill, role === roleOption ? styles.rolePillActive : undefined]}
                onPress={() => setRole(roleOption)}
              >
                <Text style={role === roleOption ? styles.roleTextActive : styles.roleText}>{roleOption}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarme</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('home')} style={{ marginTop: 12 }}>
            <Text style={styles.link}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // dashboard
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dashboard móvil</Text>
        {profile ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{profile.name}</Text>
            <Text style={styles.cardText}>{profile.email}</Text>
            <Text style={styles.cardText}>Rol: {profile.role}</Text>
          </View>
        ) : (
          <Text style={styles.text}>Cargando perfil...</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0f172a',
  },
  text: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  cardText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0f172a',
    marginTop: 8,
  },
  outlineText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  link: {
    color: '#0f172a',
    textDecorationLine: 'underline',
  },
  error: {
    color: '#b91c1c',
    marginTop: 8,
  },
  success: {
    color: '#166534',
    marginTop: 8,
  },
  roleRow: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  rolePill: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  rolePillActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  roleText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
