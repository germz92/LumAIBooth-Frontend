import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Dimensions, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';
import DateTimePicker from 'react-native-ui-datepicker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import { SERVER_LINK } from '@env';

import Logo from '../../assets/lumetry.svg';
import GlobalStyles, { borderRadius, colors, fonts, spacing } from './globalStyles';
import GradientButton from './components/GradientButton';

export default function EventsDisplay() {
  const router = useRouter();
  const navigation = useNavigation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [promptsList, setPromptsList] = useState([]);
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [newPrompt, setNewPrompt] = useState('');
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newNegativePrompt, setNewNegativePrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${SERVER_LINK}/events`);
        setEvents(response.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSaveNewEvent = async () => {
    // Ensure the event name is unique
    const existingEvent = events.find(event => event.event_name === newEventName);
    if (existingEvent) {
      Alert.alert('Error', 'Event name already exists');
      return;
    }

    const updatedPromptsList = [...promptsList, newPrompt];
    // console.log(updatedPromptsList);

    try {
      const randomBytes = await Crypto.getRandomBytesAsync(16);
      const uniqueId = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      const response = await axios.post(`${SERVER_LINK}/create-event`, {
        uniqueId: uniqueId,
        eventName: newEventName,
        eventDate: newEventDate.toISOString(),
        promptTitle: newPromptTitle,
        prompt: newPrompt,
        negativePrompt: newNegativePrompt,
        promptsList: updatedPromptsList
      });

      // console.log(response);

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Event created successfully');
        setEvents([...events, response.data.data]);
        toggleModal();
      } else {
        Alert.alert('Error', response.data.data);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const renderEventItem = (event) => {
    // Convert the event date from UTC to local time
    const eventDate = new Date(event.event_date);
    const localDateString = eventDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  
    return (
      <Pressable
        style={{ 
          ...GlobalStyles.eventCard, 
          flexBasis: dimensions.width > 600 ? '31.97%' : '100%' 
        }}
        key={event._id}
        onPress={() =>
          router.push({
            pathname: '/event-details',
            params: { eventID: event._id },
          })
        }
      >
        <Text 
          style={{...fonts.display, fontSize: fonts.size_18 }}
        >
          {event.event_name}
        </Text>
        <Text 
          style={{ 
            color: colors.lightGray,
            marginBottom: spacing.md,
          }}
        >
          {localDateString}
        </Text>
        <Text 
          style={{ 
            color: colors.text,
            fontSize: fonts.size_14,
          }}
        >
          {event.promptTitle}
          {/* Prompt title */}
        </Text>
      </Pressable>
    );
  };  

  const filteredEvents = (events || []).filter(event => 
    event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAddNewEvent = () => (
    <TouchableOpacity 
      style={{
        ...styles.addNewEvent,
        width: dimensions.width > 600 ? "31.97%" : "100%"
      }} 
      onPress={toggleModal}
    >
      <FontAwesome name="plus" size={48} color={colors.gray[100]} />
      <Text style={{...fonts.display, fontSize: fonts.size_18}}>Add New Event</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Logo width={300} height={80} style={{marginTop: spacing.lg}} />
      <Text style={{...fonts.wide, color: colors.lightGray, textAlign: "center", marginBottom: spacing.xl}}>AI Photo Booth</Text>

      <Text 
        style={{
          ...fonts.display, 
          fontSize: fonts.size_24,
          marginBottom: spacing.sm,
        }}>
          Select or create event
        </Text>

      <View style={{ 
        display: 'flex',
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
      }}>
        <TextInput
          style={{ ...GlobalStyles.textInput, width: "60%", marginBottom: 0 }}
          placeholder="Search Events"
          placeholderTextColor={colors.lightGray}
          onChangeText={text => setSearchQuery(text)}
          value={searchQuery}
        />
        <GradientButton 
          style={{ width: '40%', }}
          onPress={toggleModal}
        >
          <Text style={GlobalStyles.buttonText}>Add Event</Text>
        </GradientButton>
      </View>

      <ScrollView contentContainerStyle={{}}>
        <View style={{
          flex: dimensions.width > 600 ? 3 : 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: spacing.md,
          marginTop: spacing.xl,
        }}>
          {filteredEvents.map(renderEventItem)}
          {renderAddNewEvent()}
        </View>
      </ScrollView>

      {/* ADD EVENT MODAL */}
      <Modal isVisible={isModalVisible}>
        <View 
          style={{
            backgroundColor: colors.gray[300], 
            padding: spacing.lg, 
            borderRadius: borderRadius.lg
          }}
        >
          <Text style={{...fonts.display, fontSize: fonts.size_24, marginBottom: spacing.lg}}>Add New Event</Text>

          <TextInput
            style={GlobalStyles.textInput}
            placeholder="Event Name"
            placeholderTextColor={colors.lightGray}
            onChangeText={setNewEventName}
            value={newEventName}
          />

          <View style={{...GlobalStyles.textInput, display: 'flex', alignItems: 'start', paddingLeft: 0}}>
            <DateTimePicker
              mode="single"
              date={newEventDate}
              onChange={(params) => setNewEventDate(params.date)}
              selectedItemColor={colors.primary}
              headerButtonColor={colors.lightGray}
              calendarTextStyle={{color: colors.text}}
              headerTextStyle={{color: colors.text}}
              weekDaysTextStyle={{color: colors.text}}
              todayContainerStyle={{backgroundColor: colors.gray[200]}}
              todayTextStyle={{color: colors.text}}
            />
          </View>

          <TextInput
            style={GlobalStyles.textInput}
            placeholder="Prompt Title"
            placeholderTextColor={colors.lightGray}
            onChangeText={setNewPromptTitle}
            value={newPromptTitle}
          />
          
          <TextInput
            style={GlobalStyles.textInput}
            placeholder="Prompt"
            placeholderTextColor={colors.lightGray}
            onChangeText={setNewPrompt}
            value={newPrompt}
          />

          <TextInput
            style={GlobalStyles.textInput}
            placeholder="Negative Prompt"
            placeholderTextColor={colors.lightGray}
            onChangeText={setNewNegativePrompt}
            value={newNegativePrompt}
          />

          <View style={GlobalStyles.buttonContainer}>
            <TouchableOpacity style={{...GlobalStyles.button, width: '48%', backgroundColor: 'transparent'}} onPress={toggleModal}>
              <Text style={GlobalStyles.buttonText}>Back</Text>
            </TouchableOpacity>
            <GradientButton style={{ width: '48%'}} onPress={handleSaveNewEvent}>
              <Text style={GlobalStyles.buttonText}>Save</Text>
            </GradientButton>
          </View>

        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[300],
    justifyContent: 'center', // Center the loader
    alignItems: 'center', // Center the loader
    padding: spacing.md,
  },
  addNewEvent: {
    alignItems: 'center',
    backgroundColor: colors.gray[400],
    borderRadius: borderRadius.lg,
    borderColor: colors.gray[100],
    justifyContent: 'center',
    width: '31.97%',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  }
});