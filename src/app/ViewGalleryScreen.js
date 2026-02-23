import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity, Modal, TextInput } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { SERVER_LINK } from '@env';
import GlobalStyles, { borderRadius, colors, fonts, spacing } from './globalStyles';
import GradientButton from './components/GradientButton';
import EmailInput from './components/EmailInput';

export default function ViewGalleryScreen() {
  const router = useRouter();
  const { eventID, eventName } = useLocalSearchParams();
  const [eventGallery, setEventGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [sortOption, setSortOption] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchEventGallery = async () => {
      try {
        const response = await axios.get(`${SERVER_LINK}/events`);
        const events = response.data.data || [];
        const event = events.find(event => event._id === eventID);

        if (event && Array.isArray(event.event_gallery)) {
          setEventGallery(event.event_gallery);
          console.log(event.event_gallery);
        } else {
          Alert.alert('Error', 'No gallery found for this event.');
        }
      } catch (error) {
        console.error('Error fetching event gallery:', error);
        Alert.alert('Error', 'Failed to fetch event gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchEventGallery();
  }, [eventID]);

  const sortGallery = (gallery, option) => {
    switch(option) {
      case 'received':
        return gallery.filter(item => !item.sent || item.sent === 'received');
      case 'sent':
        return gallery.filter(item => item.sent === 'sent');
      case 'processing':
        return gallery.filter(item => item.sent === 'processing');
      default:
        return gallery;
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setEmail(image.email); // Set the email for the selected image
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setEmail('');
  };

  const sortedGallery = sortGallery(eventGallery.slice().reverse(), sortOption);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{...fonts.display, fontSize: fonts.size_24}}>Loading gallery...</Text>
      </View>
    );
  }

  const isMobile = dimensions.width < 600;

  return (
    <View style={styles.container}>
      <Text style={{...fonts.display, fontSize: fonts.size_24, textAlign: 'center'}}>Gallery for {eventName}</Text>
      
      {/* Dropdown for sorting */}
      {/* <Picker
        selectedValue={sortOption}
        style={{ height: 50, width: 150, marginBottom: spacing.md }}
        onValueChange={(itemValue) => setSortOption(itemValue)}
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="Received" value="received" />
        <Picker.Item label="Sent" value="sent" />
        <Picker.Item label="Processing" value="processing" />
      </Picker> */}

      <TouchableOpacity 
        style={{...GlobalStyles.button, backgroundColor: 'transparent', textAlign: 'center', marginBottom: spacing.lg}} 
        onPress={() => router.back()} >
        <Text style={GlobalStyles.buttonText}>Go back</Text>
      </TouchableOpacity>
      
      {sortedGallery.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {sortedGallery.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => openImageModal(item)}>
              <Image 
                source={{ uri: item.imageUrl }}
                style={{
                  width: dimensions.width / 5,
                  height: dimensions.width / 5,
                  borderRadius: borderRadius.md,
                }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={{...fonts.display, fontSize: fonts.size_24}}>There is nothing to display in the gallery.</Text>
      )}

      {/* Modal for viewing larger image */}
      {selectedImage && (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={{ ...styles.modalContent, width: isMobile ? '90%' : '60%' }}>
            <Image
              source={{ uri: selectedImage.imageUrl }}
              style={{
                width: 400,
                height: 500,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
              }}
            />
            {/* EmailInput that shows and updates the email */}
            {/* <EmailInput email={email} setEmail={setEmail} /> */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={{ ...GlobalStyles.buttonSecondaryLight, width: 'auto' }}
                onPress={closeModal}
              >
                <Text style={GlobalStyles.buttonText}>Back</Text>
              </TouchableOpacity>
              <GradientButton
                style={{ width: 'auto' }}
                size="small"
                onPress={() => {
                  // Logic for email input can be added here
                  closeModal();
                }}
              >
                <Text style={GlobalStyles.buttonText}>Send</Text>
              </GradientButton>
            </View>
          </View>
        </View>
      </Modal>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[300],
  },
  scrollView: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: colors.gray[300],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.md,
  },
});