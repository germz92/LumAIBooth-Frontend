import React from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Dimensions
} from "react-native";
import GlobalStyles, { colors, fonts, spacing } from "../globalStyles";

const EmailInput = ({ email, setEmail, customStyles }) => {
    // The list of available email domains
    const domains = [
        "gmail.com",
        "outlook.com",
        "yahoo.com",
        "icloud.com",
        "hotmail.com",
    ];

    const isMobile = Dimensions.get("window").width < 768;

    const handleSelectDomain = (domain) => {
        const [username] = email.split("@");
        setEmail(`${username}@${domain}`);
    };

    return (
        <View style={{...customStyles, width: "100%"}}>
            <TextInput
                style={{
                    ...GlobalStyles.textInput,
                    padding: isMobile ? spacing.md : spacing.xl,
                    fontSize: fonts.size_32,
                    marginBottom: spacing.lg,
                }}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoComplete="off" // Disables autocomplete for privacy
                autoCorrect={false} // Disables autocorrect
                value={email}
                onChangeText={(text) => setEmail(text)}
            />

            <View style={styles.buttonContainer}>
                {domains.map((domain) => (
                    <TouchableOpacity
                        key={domain}
                        style={styles.domainButton}
                        onPress={() => handleSelectDomain(domain)}
                    >
                        <Text style={styles.domainText}>@{domain}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
        justifyContent: "space-between",
        width: "100%",
        marginBottom: spacing.lg,
    },
    domainButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderRadius: 4,
        backgroundColor: colors.gray[100],
    },
    domainText: {
        color: colors.lightGray,
        fontSize: 14,
    },
});

export default EmailInput;
