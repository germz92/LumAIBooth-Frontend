import React from 'react';
import {  SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { colors } from '../globalStyles';

const KeyboardAvoidingContainer = ({ children, style }) => {
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: colors.gray[300] }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: colors.gray[300] }}
            >
                <ScrollView 
                    contentContainerStyle={[styles.contentConatiner, style]}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    contentConatiner: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 32 : 32,
        backgroundColor: colors.gray[300],
    }
});

export default KeyboardAvoidingContainer;