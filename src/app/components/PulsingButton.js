import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import GlobalStyles, { colors } from '../globalStyles';

const PulsingButton = ({ disableCapture, startCountdown }) => {
  // Create animated values for scale and color change
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!disableCapture) {
      // Function to start the pulsing animation
      const pulseScale = () => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start(() => pulseScale());
      };

      const pulseColor = () => {
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start(() => pulseColor());
      };

      pulseScale(); // Start the scaling animation
      pulseColor(); // Start the color animation
    } else {
      // Reset the animations when the button is disabled
      scaleAnim.setValue(1);
      colorAnim.setValue(0);
    }
  }, [disableCapture, scaleAnim, colorAnim]);

  // Interpolate the background color based on the animated value
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.lightGray], // Start and end colors
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Animated.View
        style={{
          backgroundColor, // Apply the interpolated background color
          borderRadius: 10,
          padding: 4,
        }}
      >
        <TouchableOpacity
          disabled={disableCapture}
          style={{
            ...GlobalStyles.button,
            width: 200,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}
          onPress={startCountdown}
        >
          <Text style={GlobalStyles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default PulsingButton;