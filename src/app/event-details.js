import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView, Dimensions} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from 'react-native-ui-datepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AWS from 'aws-sdk';
import * as Crypto from 'expo-crypto';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, REGION_S3, BUCKET_NAME_S3, ACCESS_KEY_ID_S3, SECRET_ACCESS_KEY_S3, SERVER_LINK } from '@env';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import * as Linking from 'expo-linking';

import GlobalStyles, { sectionHeading, colors, fonts, spacing } from './globalStyles';
import KeyboardAvoidingContainer from './components/keyboardAvoidingContainer';
import PromptManager from './components/PromptManager';
import GradientButton from './components/GradientButton';

// Configure the AWS SDK
const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID_S3,
  secretAccessKey: SECRET_ACCESS_KEY_S3,
  region: REGION_S3,
});

export default function CreateEvents() {
  const router = useRouter();
  const { eventID } = useLocalSearchParams();

  const [eventid, seteventID] = useState(null);
  const [eventNameInput, setEventNameInput] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [promptsList, setPromptsList] = useState([]);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [uniqueID, setUniqueID] = useState('');
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [eventLogoUrl, setEventLogoUrl] = useState('');
  const [logoPlacement, setLogoPlacement] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${SERVER_LINK}/events`);
        const events = response.data.data || [];
        const event = events.find(event => event._id === eventID);

        if (event) {
          seteventID(event._id);
          setEventNameInput(event.event_name);
          setEventDate(new Date(event.event_date));
          setPromptTitle(event.promptTitle);
          setPrompt(event.prompt);
          setPromptsList(event.promptsList || []);
          setNegativePrompt(event.negative_prompt);
          setUniqueID(event.unique_id)
          setLogoUrl(event.branding_logo);
          setEventLogoUrl(event.event_logo);
          setLogoPlacement(event.logo_placement);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        Alert.alert('Error', 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventID]);

  const isMobile = Dimensions.get('window').width < 600

  const uploadImageToCloudinary = async (photoUri) => {
    const data = new FormData();
    data.append('file', photoUri);
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error.response ? error.response.data : error.message);
      throw new Error('Failed to upload image');
    }
  };

  const uploadImageToS3 = async (photoUri) => {

    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const hexFileName = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const params = {
      Bucket: BUCKET_NAME_S3,
      Key: `${hexFileName}.png`,
      Body: blob,
      ContentType: 'image/png',
    };
  
    try {
      const data = await s3.upload(params).promise();
      return data.Location; // The URL of the uploaded file
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${SERVER_LINK}/update-event`, {
        eventID: eventid,
        eventName: eventNameInput,
        eventDate,
        promptTitle,
        prompt,
        negativePrompt,
        event_logo: eventLogoUrl,
        branding_logo: logoUrl,
        logo_placement: logoPlacement,
        promptsList: promptsList,
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Event updated successfully');
      } else {
        Alert.alert('Error', response.data.data);
      }
      setLoading(false)
      setCalOpen(false); 
    } catch (error) {
      setLoading(false)
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update event');
    }
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to access the media library.');
      return;
    }
  
    // Open image picker and allow the user to select an image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      try {
        setLogoUrl(result.assets[0].uri);
        setLoading(true);
        const secureUrl = await uploadImageToS3(result.assets[0].uri);
        setLogoUrl(secureUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    }    
  };

  // New function to pick and upload branding logo
  const pickBrandingLogo = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to access the media library.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setEventLogoUrl(result.assets[0].uri);
        setLoading(true);
        const secureUrl = await uploadImageToS3(result.assets[0].uri);
        setEventLogoUrl(secureUrl);
      } catch (error) {
        console.error('Error uploading branding logo:', error);
        Alert.alert('Error', 'Failed to upload branding logo. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartEvent = () => {
    handleSave();
    router.push({
      pathname: '/CaptureImageScreen',
      params: { eventID: eventid,  event_logo: logoUrl},
    });
  };  

  const handleViewGallery = () => {
    const url = `https://lumetrymedia.github.io/PhotoShare/#/${uniqueID}`;
    Linking.openURL(url).catch((err) => 
      console.error("Failed to open URL:", err)
    );
    // router.push({
    //   pathname: '/ViewGalleryScreen',
    //   params: { eventID: eventid, eventName: eventNameInput },
    // });    
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const ButtonControls = (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={{...GlobalStyles.buttonSecondary, padding: spacing.lg, width: 'auto'}} onPress={() => router.back()}>
        <Text style={GlobalStyles.buttonText}>Back</Text>
      </TouchableOpacity>

      <View style={{display: 'flex', flexDirection: 'row', gap: spacing.md}}>
        <GradientButton style={{ width: 'auto'}} onPress={handleSave}>
          <Text style={GlobalStyles.buttonText}>Save</Text>
        </GradientButton>
        <GradientButton style={{width: 'auto'}} onPress={handleStartEvent}>
          <Text style={GlobalStyles.buttonText}>Start Event</Text>
        </GradientButton>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingContainer>
      <StatusBar style="light" />

      {logoUrl ? (
        <Image 
          source={{ uri: logoUrl }} 
          style={{ 
            width: 100, 
            height: 64, 
            borderRadius: 10, 
            marginRight: 'auto', 
            marginLeft: 'auto', 
            resizeMode: 'contain',
          }} 
        />
      ) : null}
      <Text style={styles.logo}>{eventNameInput}</Text>

      {ButtonControls}

      <View style={GlobalStyles.divider} />

      <Text style={fonts.sectionHeading}>Event Details</Text>

      {/* Event Name */}
      <Text style={fonts.inputLabelText}>Event name</Text>
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Event Name"
        placeholderTextColor={colors.lightGray}
        onChangeText={setEventNameInput}
        value={eventNameInput}
        editable={false}
      />

      {/* Event date */}
      <Text style={fonts.inputLabelText}>Event date</Text>
      <TouchableOpacity style={GlobalStyles.textInput} onPress={() => setCalOpen(!calOpen)}>
        <Text style={{color: colors.text, fontSize: fonts.size_18}}>
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(eventDate)}
        </Text>
      </TouchableOpacity>
      {calOpen && (
        <View style={{...GlobalStyles.textInput, display: 'flex', alignItems: 'start', paddingLeft: 0}}>
          <DateTimePicker
            mode="single"
            date={eventDate}
            onChange={(params) => setEventDate(params.date)} 
            selectedItemColor={colors.primary}
            headerButtonColor={colors.lightGray}
            calendarTextStyle={{color: colors.text}}
            headerTextStyle={{color: colors.text}}
            weekDaysTextStyle={{color: colors.text}}
            todayContainerStyle={{backgroundColor: colors.gray[200]}}
            todayTextStyle={{color: colors.text}}
          />
        </View>
      )}
      
      {/* Event theme description */}
      <Text style={fonts.inputLabelText}>Event theme description</Text>
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Prompt title"
        placeholderTextColor={colors.lightGray}
        onChangeText={setPromptTitle}
        value={promptTitle}
      />

      <View style={GlobalStyles.divider} />

      <Text style={fonts.sectionHeading}>Generative Prompts</Text>

      {/* AI generative prompt */}
      <PromptManager currentPrompt={prompt} setCurrentPrompt={setPrompt} promptList={promptsList} setPromptList={setPromptsList} />

      {/* Negative prompt */}
      <Text style={fonts.inputLabelText}>Negative prompt</Text>
      <TextInput
        style={GlobalStyles.textInput}
        placeholder="Negative Prompt"
        placeholderTextColor={colors.lightGray}
        onChangeText={setNegativePrompt}
        value={negativePrompt}
      />

      <View style={GlobalStyles.divider} />

      {/* Add an event logo */}
      <View style={!isMobile && {...styles.buttonContainer, alignItems: "flex-start"}}>
        <View>
          <Text style={fonts.sectionHeading}>Add an event logo</Text>
          <TouchableOpacity 
            style={{ 
              ...GlobalStyles.buttonSecondaryLight, 
              marginBottom: spacing.md, 
              width: '100%'
            }} 
            onPress={pickImage}
            >
            <Text style={GlobalStyles.buttonText}>Upload logo</Text>
          </TouchableOpacity>
        </View>

        {/* Add a branding logo */}
        <View>
          <Text style={fonts.sectionHeading}>Add a bradning logo</Text>
          <TouchableOpacity 
            style={{ 
              ...GlobalStyles.buttonSecondaryLight, 
              marginBottom: spacing.md, 
              width: '100%'
            }} 
            onPress={pickBrandingLogo}
            >
            <Text style={GlobalStyles.buttonText}>Upload logo</Text>
          </TouchableOpacity>
        </View>
    
        <View style={{
          width: isMobile ? '100%' : '48%',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md
        }}>
          <Text style={{...fonts.sectionHeading, marginBottom: spacing.sm}}>Select logo placement</Text>
          {/* top */}
          <TouchableOpacity 
            style={logoPlacement === 'TF' ? GlobalStyles.buttonSecondary : GlobalStyles.buttonSecondaryLight} 
            onPress={() => setLogoPlacement('TF')}
          >
            <Text style={GlobalStyles.buttonText}>Top Full</Text>
          </TouchableOpacity>
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity 
              style={[logoPlacement === 'TL' ? GlobalStyles.buttonSecondary : GlobalStyles.buttonSecondaryLight, {width: 'auto'}]} 
              onPress={() => setLogoPlacement('TL')}
            >
              <Text style={GlobalStyles.buttonText}>Top Left</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[logoPlacement === 'TR' ? GlobalStyles.buttonSecondary : GlobalStyles.buttonSecondaryLight, {width: 'auto'}]}  
              onPress={() => setLogoPlacement('TR')}
            >
              <Text style={GlobalStyles.buttonText}>Top Right</Text>
            </TouchableOpacity>
          </View>
          {/* Bottom */}
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity 
              style={[logoPlacement === 'BL' ? GlobalStyles.buttonSecondary : GlobalStyles.buttonSecondaryLight, {width: 'auto'}]} 
              onPress={() => setLogoPlacement('BL')}
            >
              <Text style={GlobalStyles.buttonText}>Bottom Left</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[logoPlacement === 'BR' ? GlobalStyles.buttonSecondary : GlobalStyles.buttonSecondaryLight, {width: 'auto'}]} 
              onPress={() => setLogoPlacement('BR')}
            >
              <Text style={GlobalStyles.buttonText}>Bottom Right</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={logoPlacement === 'BF' ? GlobalStyles.buttonSecondary : GlobalStyles.buttonSecondaryLight} 
            onPress={() => setLogoPlacement('BF')}
          >
            <Text style={GlobalStyles.buttonText}>Bottom Full</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{...GlobalStyles.button, backgroundColor: 'transparent'}} 
            onPress={() => setLogoPlacement('')}
          >
            <Text style={GlobalStyles.buttonText}>Disable</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={GlobalStyles.divider} />

      <GradientButton style={{marginBottom: spacing.md}} onPress={handleStartEvent}>
        <Text style={GlobalStyles.buttonText}>Start Event</Text>
      </GradientButton>

      <TouchableOpacity style={GlobalStyles.buttonSecondary} onPress={handleViewGallery}>
        <Text style={GlobalStyles.buttonText}>View Gallery</Text>
      </TouchableOpacity>
    </KeyboardAvoidingContainer>
  );
}
  
const styles = StyleSheet.create({
  logo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    ...GlobalStyles.buttonContainer,
  },
});
