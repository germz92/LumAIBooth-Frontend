import React, { useState } from 'react';
import { Dimensions, View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { SERVER_LINK } from '@env';

import Logo from '../../assets/lumetry.svg';
import GlobalStyles, { colors, fonts, spacing } from './globalStyles';
import KeyboardAvoidingContainer from './components/keyboardAvoidingContainer';
import GradientButton from './components/GradientButton';

function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isMobile = Dimensions.get('window').width < 600;

    const showError = (message) => {
        setErrorMessage(message);
        if (Platform.OS !== 'web') {
            Alert.alert('Login Failed', message);
        }
    };

    const handleLogin = () => {
        setErrorMessage('');

        if (!username.trim() || !password.trim()) {
            showError('Please enter both username and password.');
            return;
        }

        const userData = {
            username: username,
            password: password,
        };
        setLoading(true);
        axios.post(`${SERVER_LINK}/login-user`, userData)
            .then(res => {
                if (res.data.status === 'ok') {
                    router.push('/events'); // Navigate using the router from expo-router
                } else {
                    showError(res.data.data || 'Login failed. Please check your credentials.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Unable to connect to the server. Please make sure the backend is running.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <KeyboardAvoidingContainer style={{...styles.container, width: isMobile ? '100%' : 450,}}>
            <Logo width={300} height={80} />
            <Text style={{
                ...fonts.wide, 
                color: colors.lightGray, 
                textAlign: "center", 
                marginBottom: spacing.xl
            }}>
                AI Photo Booth
            </Text>
            <TextInput
                style={GlobalStyles.textInput}
                placeholder="Username"
                onChangeText={setUsername}
                value={username}
                placeholderTextColor={colors.lightGray}
            />
            <TextInput
                style={GlobalStyles.textInput}
                placeholder="Password"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                placeholderTextColor={colors.lightGray}
            />
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <GradientButton 
                disabled={loading}
                onPress={handleLogin}
            >
                {!loading ? 'Login' : '...Logging in'}
            </GradientButton>
        </KeyboardAvoidingContainer>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    margin: 'auto',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: 'kanit-regular',
  },
});

export default LoginPage;