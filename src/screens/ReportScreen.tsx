import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface ReportData {
  type: string;
  location: string;
  useCurrentLocation: boolean;
  photos: string[];
  description: string;
  severity: string;
  anonymous: boolean;
  contact: string;
}

const reportTypes = [
  { id: 'trash', icon: 'trash', label: 'Trash Pile', description: 'Illegal dumping or excessive litter' },
  { id: 'light', icon: 'bulb', label: 'Broken Streetlight', description: 'Non-functioning street lighting' },
  { id: 'vandalism', icon: 'warning', label: 'Vandalism', description: 'Property damage or graffiti' },
  { id: 'suspicious', icon: 'eye', label: 'Suspicious Activity', description: 'Concerning behavior or activity' },
];

const severityLevels = [
  { id: 'low', label: 'Low', description: 'Minor issue, not urgent' },
  { id: 'medium', label: 'Medium', description: 'Moderate concern' },
  { id: 'high', label: 'High', description: 'Serious issue requiring attention' },
];

const ReportScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [reportData, setReportData] = useState<ReportData>({
    type: '',
    location: '',
    useCurrentLocation: true,
    photos: [],
    description: '',
    severity: 'medium',
    anonymous: true,
    contact: ''
  });

  const progress = (step / 4) * 100;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    const report = {
      ...reportData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'open'
    };
    
    Alert.alert('Success', 'Your report has been submitted successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return reportData.type !== '';
      case 2: return reportData.location !== '' || reportData.useCurrentLocation;
      case 3: return reportData.description.trim() !== '';
      case 4: return true;
      default: return false;
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setReportData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri]
      }));
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (address[0]) {
          const formattedAddress = `${address[0].street || ''} ${address[0].name || ''}, ${address[0].city || 'Philadelphia'}`;
          setReportData(prev => ({ ...prev, location: formattedAddress }));
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are you reporting?</Text>
            <Text style={styles.stepSubtitle}>Select the type of issue you want to report to Law Enforcement or the Department of Public Works at Philadelphia. </Text>
            
            <View style={styles.optionsContainer}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionCard,
                    reportData.type === type.id && styles.selectedOption
                  ]}
                  onPress={() => setReportData({ ...reportData, type: type.id })}
                >
                  <View style={[
                    styles.optionIcon,
                    reportData.type === type.id && styles.selectedOptionIcon
                  ]}>
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={reportData.type === type.id ? 'white' : '#007AFF'} 
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{type.label}</Text>
                    <Text style={styles.optionDescription}>{type.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Where is this happening?</Text>
            <Text style={styles.stepSubtitle}>Set the location for your report</Text>
            
            <View style={styles.locationOptions}>
              <TouchableOpacity
                style={[
                  styles.locationOption,
                  reportData.useCurrentLocation && styles.selectedLocationOption
                ]}
                onPress={() => {
                  setReportData({ ...reportData, useCurrentLocation: true });
                  getCurrentLocation();
                }}
              >
                <Ionicons name="location" size={20} color="#007AFF" />
                <Text style={styles.locationOptionText}>Use current location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.locationOption,
                  !reportData.useCurrentLocation && styles.selectedLocationOption
                ]}
                onPress={() => setReportData({ ...reportData, useCurrentLocation: false })}
              >
                <Ionicons name="create" size={20} color="#007AFF" />
                <Text style={styles.locationOptionText}>Enter address manually</Text>
              </TouchableOpacity>
            </View>

            {!reportData.useCurrentLocation && (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter address or intersection"
                  value={reportData.location}
                  onChangeText={(text) => setReportData({ ...reportData, location: text })}
                  style={styles.textInput}
                />
              </View>
            )}

            {reportData.useCurrentLocation && reportData.location && (
              <View style={styles.locationConfirm}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.locationConfirmText}>Location: {reportData.location}</Text>
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Add details</Text>
            <Text style={styles.stepSubtitle}>Help others understand the issue</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos (optional)</Text>
              <View style={styles.photosContainer}>
                {reportData.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity 
                      style={styles.removePhoto}
                      onPress={() => setReportData(prev => ({
                        ...prev,
                        photos: prev.photos.filter((_, i) => i !== index)
                      }))}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                {reportData.photos.length < 3 && (
                  <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={24} color="#007AFF" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description *</Text>
              <TextInput
                placeholder="Describe the issue in detail..."
                value={reportData.description}
                onChangeText={(text) => setReportData({ ...reportData, description: text })}
                style={styles.textArea}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Severity</Text>
              <View style={styles.severityContainer}>
                {severityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.severityOption,
                      reportData.severity === level.id && styles.selectedSeverity
                    ]}
                    onPress={() => setReportData({ ...reportData, severity: level.id })}
                  >
                    <Text style={[
                      styles.severityLabel,
                      reportData.severity === level.id && styles.selectedSeverityText
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={[
                      styles.severityDescription,
                      reportData.severity === level.id && styles.selectedSeverityText
                    ]}>
                      {level.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        );

      case 4:
        const selectedType = reportTypes.find(t => t.id === reportData.type);
        return (
          <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Review your report</Text>
            <Text style={styles.stepSubtitle}>Make sure everything looks correct</Text>
            
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Ionicons name={selectedType?.icon as any} size={24} color="#007AFF" />
                <Text style={styles.reviewTitle}>{selectedType?.label}</Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: reportData.severity === 'high' ? '#FF3B30' : 
                    reportData.severity === 'medium' ? '#FF9500' : '#34C759' }
                ]}>
                  <Text style={styles.severityBadgeText}>{reportData.severity}</Text>
                </View>
              </View>
              
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Location</Text>
                <Text style={styles.reviewValue}>
                  {reportData.useCurrentLocation ? 'Current location' : reportData.location}
                </Text>
              </View>
              
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Description</Text>
                <Text style={styles.reviewValue}>{reportData.description}</Text>
              </View>
              
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Photos</Text>
                <Text style={styles.reviewValue}>{reportData.photos.length} photo(s)</Text>
              </View>
              
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Anonymous report</Text>
                <Text style={styles.reviewValue}>{reportData.anonymous ? 'Yes' : 'No'}</Text>
              </View>
            </View>

            <View style={styles.warningCard}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Safety Reminder</Text>
                <Text style={styles.warningText}>
                  If this is an immediate emergency, call 911. This report will be visible to the community and may take time to address.
                </Text>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Report Issue</Text>
          <Text style={styles.headerSubtitle}>Step {step} of 4</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderStep()}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {step < 4 ? (
          <TouchableOpacity
            style={[styles.button, !canProceed() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.buttonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.buttonText}>Submit Report</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E5E7',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F0F8FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  selectedOptionIcon: {
    backgroundColor: '#007AFF',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  locationOptions: {
    gap: 16,
    marginBottom: 24,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLocationOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  locationOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
  },
  inputContainer: {
    marginTop: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  locationConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  locationConfirmText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  severityContainer: {
    gap: 12,
  },
  severityOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSeverity: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  severityDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedSeverityText: {
    color: '#007AFF',
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginLeft: 12,
  },
  severityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  reviewSection: {
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  warningCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default ReportScreen;