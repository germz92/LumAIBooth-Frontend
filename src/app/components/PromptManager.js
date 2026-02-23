import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';

import GlobalStyles, { colors, spacing, fonts, divider, borderRadius } from "../globalStyles";
import GradientButton from "./GradientButton";

const PromptManager = ({ currentPrompt, setCurrentPrompt, promptList, setPromptList }) => {
    const [prompts, setPrompts] = useState([]);
    const [promptSelectionOpen, setPromptSelectionOpen] = useState(false);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [newPrompt, setNewPrompt] = useState("");

    const isMobile = Dimensions.get("window").width < 768;

     // Initialize prompts from the promptList when the component mounts
    useEffect(() => {
        if (promptList && promptList.length > 0) {
            setPrompts(promptList.map((text, index) => ({ text, id: index })));
        }
    }, [promptList]);

    // Function to add a new prompt to the list and update promptList
    const addNewPrompt = () => {
        if (newPrompt.trim()) {
            const newPromptObj = { text: newPrompt, id: Date.now() };
            const updatedPrompts = [...prompts, newPromptObj];
            setPrompts(updatedPrompts);
            setPromptList(updatedPrompts.map(p => p.text)); // Update the external promptList
            setNewPrompt("");
        }
    };

    // Function to update a specific prompt in the list and reflect it in promptList
    const savePrompt = (id, newText) => {
        const updatedPrompts = prompts.map((p) => (p.id === id ? { ...p, text: newText } : p));
        setPrompts(updatedPrompts);
        setPromptList(updatedPrompts.map(p => p.text)); // Update the external promptList
    };

    // Function to set the active prompt
    const setActivePrompt = (id) => {
        const selectedPrompt = prompts.find((p) => p.id === id);
        if (selectedPrompt) {
            setCurrentPrompt(selectedPrompt.text);
        }
    };

    return (
        <View>
            <Text style={fonts.inputLabelText}>AI generative prompt</Text>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: spacing.md,
                    marginBottom: spacing.md,
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        flexGrow: 1,
                        maxWidth: isMobile ? "60%" : "80%",
                    }}
                >
                    <TextInput
                        style={{
                            ...GlobalStyles.textInput,
                            width: "auto",
                            marginBottom: 0,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                        }}
                        multiline={true}
                        placeholder="Select a prompt"
                        placeholderTextColor={colors.lightGray}
                        onChangeText={(text) => {
                            setCurrentPrompt(text);
                            // Update the corresponding prompt in the list
                            const currentPromptObj = prompts.find(p => p.text === currentPrompt);
                            if (currentPromptObj) {
                                savePrompt(currentPromptObj.id, text); // Save the updated prompt
                            }
                        }}
                        value={currentPrompt}
                        editable={isEditingPrompt}
                    />
                    <TouchableOpacity
                        style={{ 
                            ...GlobalStyles.buttonSecondary, 
                            width: "auto",
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderRightWidth: 0,
                            borderTopWidth: 0,
                            borderBottomWidth: 0,
                            borderColor: colors.lightGray,
                            backgroundColor: colors.gray[100],
                        }}
                        onPress={() => setIsEditingPrompt(!isEditingPrompt)}
                    >
                        <Text style={GlobalStyles.buttonText}>
                            {isEditingPrompt ? "Save" : "Edit"}
                        </Text>
                    </TouchableOpacity>
                </View>
                <GradientButton
                    style={{
                        width: "auto",
                    }}
                    onPress={() => setPromptSelectionOpen(!promptSelectionOpen)}
                    size="small"
                >
                    <Text style={GlobalStyles.buttonText}>Add</Text>
                </GradientButton>
            </View>

            {promptSelectionOpen && (
                <View style={styles.promptContainer}>
                    {/* Input to add a new prompt */}
                    <View style={{ display: 'flex', flexDirection: 'row', gap: spacing.md }}>
                        <TextInput
                            style={{
                                ...GlobalStyles.textInput,
                                flexGrow: 1,
                                width: 'auto',
                            }}
                            placeholder="Add new prompt"
                            placeholderTextColor={colors.lightGray}
                            onChangeText={setNewPrompt}
                            value={newPrompt}
                        />
                        <GradientButton
                            style={{
                                marginBottom: spacing.md,
                                width: 'auto',
                            }}
                            size="small"
                            onPress={addNewPrompt}
                        >
                            <Text style={GlobalStyles.buttonText}>
                                {isMobile ? <FontAwesome style={{color: colors.buttonText}} name="check" size={32} color={colors.gray[100]} /> : "Save New Prompt"}
                            </Text>
                        </GradientButton>
                    </View>

                    <View style={GlobalStyles.divider} />

                    {/* List of existing prompts */}
                    {prompts.map((p) => (
                        <View key={p.id} style={styles.promptItem}>
                            <TextInput
                                style={{ ...GlobalStyles.textInput, flex: 1, marginBottom: 0 }}
                                placeholder="Edit prompt"
                                placeholderTextColor={colors.lightGray}
                                value={p.text}
                                onChangeText={(text) => savePrompt(p.id, text)}
                                editable={currentPrompt !== p.text} // Disable editing if this prompt is active
                            />
                            <TouchableOpacity
                                style={{
                                    ...styles.activeButton,
                                    ...(currentPrompt === p.text && styles.activeButtonSelected),
                                    width: "auto",
                                }}
                                onPress={() => setActivePrompt(p.id)}
                            >
                                <Text 
                                    style={{    
                                        ...GlobalStyles.buttonText,
                                        color: currentPrompt !== p.text ? colors.gray[100] : colors.text,
                                    }}
                                >
                                    Active
                                </Text>
                            </TouchableOpacity>
                            {/* We are already updating savePrompt while onChange */}
                            {/* <GradientButton
                                style={{
                                    width: "auto",
                                }}
                                size="small"
                                onPress={() => savePrompt(p.id, p.text)}
                            >
                                <Text style={GlobalStyles.buttonText}>
                                    Save
                                </Text>
                            </GradientButton> */}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    promptContainer: {
        padding: spacing.lg,
        borderColor: colors.lightGray,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    promptItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    activeButton: {
        ...GlobalStyles.buttonSecondaryLight,
    },
    activeButtonSelected: {
        ...GlobalStyles.buttonSecondary,
    },
});

export default PromptManager;
