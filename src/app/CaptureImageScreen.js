import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Modal,
    Dimensions,
    TextInput,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AWS from "aws-sdk";
import * as Crypto from "expo-crypto";
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
    REGION_S3,
    BUCKET_NAME_S3,
    ACCESS_KEY_ID_S3,
    SECRET_ACCESS_KEY_S3,
    SERVER_LINK,
} from "@env";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import GlobalStyles, {
    colors,
    fonts,
    spacing,
    borderRadius,
} from "./globalStyles";
import PulsingButton from "./components/PulsingButton";
import EmailInput from "./components/EmailInput";

const { width } = Dimensions.get("window");
const imageSize = width * 0.8;
const isMobile = width < 600;

// Configure the AWS SDK
const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID_S3,
    secretAccessKey: SECRET_ACCESS_KEY_S3,
    region: REGION_S3,
});

export default function CaptureImageScreen() {
    const [facing, setFacing] = useState("front");
    const [permission, requestPermission] = useCameraPermissions();
    const [photoUri, setPhotoUri] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [cameraRef, setCameraRef] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [qr, setQr] = useState("");
    const [activeSendMethod, setActiveSendMethod] = useState("");
    const [secureUrl, setSecureUrl] = useState(null);
    const [fileID, setFileID] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [logoPlacement, setLogoPlacement] = useState("");
    const [loading, setLoading] = useState(true);
    const [disableCapture, setDisableCapture] = useState(false);
    const router = useRouter();
    const { eventID } = useLocalSearchParams();

    const [countdown, setCountdown] = useState(3);
    const [isCounting, setIsCounting] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${SERVER_LINK}/events`);
                const events = response.data.data || [];
                const event = events.find((event) => event._id === eventID);

                if (event) {
                    setLogoUrl(event.branding_logo);
                    setLogoPlacement(event.logo_placement);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                Alert.alert("Error", "Failed to fetch event details");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [eventID]);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View
                style={{ ...styles.container, flex: 1, alignItems: "center" }}
            >
                <Text style={{ ...fonts.display, textAlign: "center" }}>
                    We need your permission to show the camera
                </Text>
                <TouchableOpacity
                    style={{ ...GlobalStyles.button, width: "auto" }}
                    onPress={requestPermission}
                >
                    <Text style={GlobalStyles.buttonText}>
                        Grant Permission
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing((current) => (current === "front" ? "back" : "front"));
    };

    const startCountdown = async () => {
        setDisableCapture(true);
        setIsCounting(true);
        let counter = countdown;

        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
            counter -= 1;

            if (counter === 0) {
                clearInterval(timer);
                setIsCounting(false);
                takePicture();
            }
        }, 1000);
    };

    const takePicture = async () => {
        if (cameraRef) {
            const photo = await cameraRef.takePictureAsync({ base64: true });
            setPhotoUri(photo.uri);
            const source = photo.base64;
            let base64Img = `data:image/jpg;base64,${source}`;
            setPhoto(base64Img);
            setDisableCapture(false);
            setCountdown(3); // resset countdown
            setModalVisible(true); //open email modal
        }
    };

    const retakePicture = () => {
        setPhotoUri(null);
    };

    const handleContinue = () => {
        setModalVisible(true);
    };

    const uploadImageToS3 = async (photoUri) => {
        const randomBytes = await Crypto.getRandomBytesAsync(16);
        const hexFileName = Array.from(randomBytes, (byte) =>
            byte.toString(16).padStart(2, "0")
        ).join("");

        const response = await fetch(photoUri);
        const blob = await response.blob();

        const params = {
            Bucket: BUCKET_NAME_S3,
            Key: `${hexFileName}.jpg`,
            Body: blob,
            ContentType: "image/jpeg",
        };

        try {
            const data = await s3.upload(params).promise();
            return {
                location: data.Location, // The URL of the uploaded file
                fileName: hexFileName, // The generated hex file name
            };
        } catch (error) {
            console.error("Error uploading image to S3:", error);
            throw new Error("Failed to upload image");
        }
    };

    const uploadImageToCloudinary = async (photoUri) => {
        const data = new FormData();
        data.append("file", photo);
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data.secure_url;
        } catch (error) {
            console.error(
                "Error uploading image to Cloudinary:",
                error.response ? error.response.data : error.message
            );
            throw new Error("Failed to upload image");
        }
    };

    const handleSubmit = async () => {
        if (!phoneNumber && !email && !qr) {
            Alert.alert(
                "Error",
                "Please enter either a phone number or an email or select QR code option."
            );
            return;
        }

        try {
            setLoading(true);
            // Upload the image to S3
            const { location: secureUrl, fileName } = await uploadImageToS3(
                photoUri
            );
            setSecureUrl(secureUrl);
            setFileID(fileName);
            const generated_url = `https://lumetrymedia.github.io/PhotoShare/#/aibooth/${eventID}/${fileName}`;

            // Prepare the data to be sent to the backend
            const photoData = {
                fileID: fileName,
                eventID: eventID,
                imageUrl: secureUrl,
                phoneNumber: phoneNumber || null,
                email: email || null,
                qr: qr || null,
                generated_url: generated_url,
            };

            // Send the photo data to the backend
            const response = await axios.post(
                `${SERVER_LINK}/add-photo`,
                photoData
            );

            if (response.data.status === "ok") {
                // Alert.alert('Success', 'Photo added to event gallery successfully.');
                router.replace({
                    pathname: "/SuccessScreen",
                    params: { eventID: eventID, fileID: fileName },
                });
            } else {
                Alert.alert("Error", response.data.data);
            }

            setModalVisible(false);
        } catch (error) {
            console.error("Error submitting details:", error);
            Alert.alert("Error", "Failed to submit details");
        } finally {
            setLoading(false);
        }
    };

    const optionButton = (icon, size, text, onPress) => (
        <TouchableOpacity
            style={{
                ...GlobalStyles.optionButton,
            }}
            onPress={() => {
                onPress();
                if (text === "QR") {
                    setQr("selected");
                } else {
                    setQr("");
                }
            }}
        >
            <View
                style={{
                    width: isMobile ? 75 : 150,
                    height: isMobile ? 75 : 150,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: isMobile ? 0 : spacing.lg,
                }}
            >
                <FontAwesome
                    name={icon}
                    size={size}
                    color={
                        text === activeSendMethod
                            ? colors.lightGray
                            : colors.gray[100]
                    }
                    style={{ marginHorizontal: "auto" }}
                />
            </View>
            {!isMobile && (
                <Text
                    style={{
                        ...fonts.display,
                        color:
                            text === activeSendMethod
                                ? colors.text
                                : colors.lightGray,
                        fontSize: fonts.size_24,
                        textAlign: "center",
                    }}
                >
                    {text}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {photoUri ? (
                <View style={styles.preview}>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        {logoUrl ? (
                        <Image
                            source={{ uri: logoUrl }}
                            style={{
                                width: 64,
                                height: 64,
                            }}
                        />
                    ) : null}
                        <Text
                            style={{
                                ...fonts.display,
                                fontSize: fonts.size_24,
                            }}
                        >
                            Photo Preview
                        </Text>
                    </View>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: photoUri }}
                            style={styles.imagePreview}
                        />
                    </View>
                    <View style={GlobalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={{
                                ...GlobalStyles.button,
                                backgroundColor: "transparent",
                                width: "auto",
                            }}
                            onPress={retakePicture}
                        >
                            <Text
                                style={{
                                    ...GlobalStyles.buttonText,
                                    color: colors.lightGray,
                                }}
                            >
                                Retake
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ ...GlobalStyles.button, width: 200 }}
                            onPress={handleContinue}
                        >
                            <Text style={GlobalStyles.buttonText}>
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    ref={(ref) => setCameraRef(ref)}
                    className="camera-view"
                >
                    {logoUrl ? (
                        <View
                            style={{
                                ...GlobalStyles.buttonContainer,
                                padding: spacing.lg,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                width: "100%",
                            }}
                        >
                            <Image
                                source={{ uri: logoUrl }}
                                style={{
                                    width: 100,
                                    height: 64,
                                    zIndex: 1,
                                    margin: "auto",
                                    resizeMode: "contain",
                                }}
                            />
                        </View>
                    ) : null}

                    <Text style={{ ...fonts.display, fontSize: 240 }}>
                        {isCounting && countdown}
                    </Text>

                    <View
                        style={{
                            ...GlobalStyles.buttonContainer,
                            padding: spacing.lg,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            width: "100%",
                        }}
                    >
                        <TouchableOpacity
                            style={{ width: "auto" }}
                            onPress={() => router.back()}
                        >
                            <FontAwesome
                                name="arrow-left"
                                size={24}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                        <PulsingButton
                            disableCapture={disableCapture}
                            startCountdown={startCountdown}
                        />
                        <TouchableOpacity
                            style={{ width: "auto" }}
                            onPress={toggleCameraFacing}
                        >
                            <FontAwesome
                                name="refresh"
                                size={24}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </CameraView>
            )}

            {/* Modal for phone number or email input */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text
                            style={{
                                ...fonts.display,
                                fontSize: 40,
                            }}
                        >
                            Share Your Photos
                        </Text>
                        <Text
                            style={{
                                ...fonts.paragraph,
                                marginBottom: 48,
                            }}
                        >
                            How would you like to receive your photos?
                        </Text>

                        {/* CHOOSE METHOD */}
                        <View
                            style={{
                                ...GlobalStyles.buttonContainer,
                                marginBottom: 24,
                            }}
                        >
                            {optionButton(
                                "envelope", // icon
                                isMobile ? 75 : 150, // size
                                "Email", // text
                                () => setActiveSendMethod("Email") // onPress
                            )}
                            {optionButton(
                                "qrcode",
                                isMobile ? 85 : 170,
                                "QR",
                                () => setActiveSendMethod("QR")
                            )}
                            {optionButton(
                                "mobile-phone",
                                isMobile ? 80 : 160,
                                "Text",
                                () => setActiveSendMethod("Text")
                            )}
                        </View>

                        {activeSendMethod === "Text" && (
                            <TextInput
                                style={{
                                    ...GlobalStyles.textInput,
                                    padding: isMobile ? spacing.md : spacing.xl,
                                    fontSize: fonts.size_32,
                                    marginBottom: 56,
                                    color: colors.text,
                                }}
                                placeholder="+1 Phone Number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                value={phoneNumber.startsWith("+1") ? phoneNumber : `+1${phoneNumber}`}
                                onChangeText={(text) => {
                                    // Ensure the input always starts with +1
                                    if (text.startsWith("+1")) {
                                        setPhoneNumber(text);
                                    } else {
                                        setPhoneNumber(`+1${text.replace(/^\+1/, "")}`);
                                    }
                                }}
                            />
                        )}
                        {activeSendMethod === "Email" && (
                            <EmailInput
                                email={email}
                                setEmail={setEmail}
                                customStyles={{ marginBottom: 24 }}
                            />
                        )}
                        <View style={{...GlobalStyles.buttonContainer}}>
                            <TouchableOpacity
                                style={{
                                    ...GlobalStyles.buttonSecondary,
                                    paddingVertical: isMobile
                                        ? spacing.md
                                        : spacing.xl,
                                    backgroundColor: "transparent",
                                    width: "50%",
                                }}
                                onPress={() => setModalVisible(false)}
                                >
                                <Text style={GlobalStyles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            {(activeSendMethod === "Email" ||
                                activeSendMethod === "Text"  || activeSendMethod === "QR") && (
                                    <TouchableOpacity
                                    disabled={loading}
                                    style={{
                                        ...GlobalStyles.button,
                                        width: "50%",
                                        paddingVertical: isMobile
                                        ? spacing.md
                                        : spacing.xl,
                                        backgroundColor: loading
                                        ? colors.gray[100]
                                        : colors.primary,
                                    }}
                                    onPress={handleSubmit}
                                    >
                                    <Text style={GlobalStyles.buttonText}>
                                        {loading ? "Sending" : "Submit"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
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
        justifyContent: "center", // Center the loader
    },
    camera: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
    preview: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: spacing.lg,
    },
    imageContainer: {
        width: imageSize,
        height: imageSize,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: borderRadius.xxl,
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.90)",
    },
    modalView: {
        width: isMobile ? "100%" : "80%",
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalSubText: {
        color: colors.lightGray,
        fontSize: 16,
        textAlign: "center",
        marginBottom: spacing.md,
    },
});
