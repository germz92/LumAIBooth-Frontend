import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../globalStyles';

const GradientButton = ({ onPress, children, disabled, style, size }) => {

const gradientColors = disabled
    ? [colors.gray[100], colors.gray[100]] // Colors for the disabled state
    : [colors.primary, colors.primaryLight200] // Colors for the enabled state
    

  return (
    <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled}
        style={{
            ...styles.button, 
            ...style,
        }}
    >
      <LinearGradient
        colors={gradientColors} // Define your gradient colors here
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{...styles.gradient, padding: size === 'small' ? spacing.md : spacing.lg,}}
      >
        <Text style={styles.buttonText}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden', // Ensure the gradient stays within the rounded corners
  },
  gradient: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  buttonText: { 
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GradientButton;