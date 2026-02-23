import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import GlobalStyles, { colors, fonts, spacing } from './globalStyles';
import QRCode from 'react-native-qrcode-svg';

export default function SuccessScreen() {
  const router = useRouter();
  const { eventID, fileID } = useLocalSearchParams();
  // console.log(`https://lumetrymedia.github.io/PhotoShare/#/aibooth/${eventID}/${fileID}`);

  // const handleDone = () => {
  //   setTimeout(() => {
  //     router.replace({
  //       pathname: '/CaptureImageScreen',
  //       params: { eventID: eventID },
  //     });
  //   }, 3000);
  // };

  const handleDone = () => {
    router.replace({
      pathname: '/CaptureImageScreen',
      params: { eventID: eventID },
    });
  };  

  return (
    <View style={styles.container}>
      <View style={styles.successIconContainer}>
        <FontAwesome name="check" size={64} color={colors.text} />
      </View>

      <Text style={{...fonts.display, fontSize: fonts.size_32}}>Success!</Text>
      <Text style={{...fonts.display, fontSize: fonts.size_24}}>
        Your photos are on the way
      </Text>
      <Text style={{...styles.subMessage, marginBottom: spacing.xl, marginTop: spacing.md}}>
        Thank you for using AiBooth!
      </Text>

      <TouchableOpacity style={{...GlobalStyles.button, width: 200}} onPress={handleDone}>
        <Text style={GlobalStyles.buttonText}>Done</Text>
      </TouchableOpacity>

      {fileID && eventID && (
        <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <QRCode
              value={`https://lumetrymedia.github.io/PhotoShare/#/aibooth/${eventID}/${fileID}`}
              size={200}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoText: {
    color: '#FFF',
    fontSize: 24,
    marginBottom: spacing.xl,
  },
  successIconContainer: {
    backgroundColor: '#333',
    borderRadius: 100,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  successIcon: {
    width: 64,
    height: 64,
  },
  title: {
    color: '#FFF',
    fontSize: 36,
    fontFamily: fonts.bold,
    marginBottom: spacing.md,
  },
  message: {
    color: '#FFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subMessage: {
    display: 'block',
    color: colors.lightGray,
    fontSize: 16,
    textAlign: 'center',
  },
});
