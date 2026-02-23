// GlobalStyles.js
import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#870000',
    primaryLight100: '#931a1a',
    primaryLight200: '#9f3333',
    gray: {
        400: '#111111',
        300: '#161616',
        200: '#1A1A1A',
        100: '#272727',
    },
    lightGray: '#a1a1a1',
    text: '#ffffff',
};

export const spacing = {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const fonts = {
    light: 'kanit-light',
    regular: 'kanit-regular',
    bold: 'kanit-bold',
    size_14: 14,
    size_18: 18,
    size_24: 24,
    size_32: 32,
    size_: 48,
    paragraph: {
        fontFamily: 'kanit-regular',
        color: colors.text,
        fontSize: 18,
    },
    display: {
        fontFamily: 'kanit-bold',
        letterSpacing: 1,
        color: colors.text,
    },
    wide: {
        fontSize: 16,
        textTransform: 'uppercase',
        fontFamily: 'kanit-light',
        marginLeft: 11,
        letterSpacing: 11,
        color: colors.lightGray,
    },
    inputLabelText: {
        fontSize: 16,
        fontFamily: 'kanit-light',
        marginLeft: 11,
        color: colors.lightGray,
        marginBottom: spacing.sm,
    },
    sectionHeading: {
        fontFamily: 'kanit-bold',
        letterSpacing: 1,
        color: colors.gray[100],
        fontSize: 24,
        marginBottom: spacing.lg,
    }
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
};

const baseButton = {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    width: '100%',
};

const GlobalStyles = StyleSheet.create({
    textInput: {
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: borderRadius.md,
        color: colors.text,
        fontSize: fonts.size_18,
        fontFamily: fonts.regular,
        marginBottom: spacing.md,
        padding: spacing.md,
        placeholderTextColor: colors.lightGray,
        width: '100%',  
    },
    eventCard: {
        backgroundColor: colors.gray[400],
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, 
        shadowRadius: 3.84, 
        elevation: 5,
    },
    button: {
        ...baseButton,
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        ...baseButton,
        backgroundColor: colors.gray[400],
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonSecondaryLight: {
        ...baseButton,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: colors.gray[100],
    },
    buttonText: {
        color: colors.text,
        fontSize: fonts.size_18,
        letterSpacing: 1,
        fontFamily: fonts.bold,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    divider: {
        marginBottom: spacing.xl,
        paddingBottom: spacing.xl,
        borderBottomColor: colors.gray[100],
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    optionButton: {
        backgroundColor: colors.gray[300],
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
});

export default GlobalStyles; 