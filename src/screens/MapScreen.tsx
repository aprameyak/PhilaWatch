import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Hardcoded Philadelphia crime data
const phillyCrimeData = [
  { id: 1, latitude: 39.9526, longitude: -75.1652, crime_type: 'robbery', severity: 3, date: '2025-01-15', address: '1500 Market St', neighborhood: 'Center City' },
  { id: 2, latitude: 39.9794, longitude: -75.1652, crime_type: 'burglary', severity: 2, date: '2025-01-14', address: '2000 N Broad St', neighborhood: 'North Philadelphia' },
  { id: 3, latitude: 39.9311, longitude: -75.1719, crime_type: 'assault', severity: 4, date: '2025-01-13', address: '1200 S Broad St', neighborhood: 'South Philadelphia' },
  { id: 4, latitude: 39.9526, longitude: -75.2063, crime_type: 'theft', severity: 1, date: '2025-01-12', address: '4000 Chestnut St', neighborhood: 'West Philadelphia' },
  { id: 5, latitude: 40.0379, longitude: -75.0782, crime_type: 'vandalism', severity: 1, date: '2025-01-11', address: '8000 Roosevelt Blvd', neighborhood: 'Northeast' },
  { id: 6, latitude: 39.9700, longitude: -75.1351, crime_type: 'drug', severity: 2, date: '2025-01-10', address: '1500 Frankford Ave', neighborhood: 'Fishtown' },
  { id: 7, latitude: 39.9526, longitude: -75.1441, crime_type: 'robbery', severity: 4, date: '2025-01-09', address: '400 Market St', neighborhood: 'Old City' },
  { id: 8, latitude: 39.9680, longitude: -75.1580, crime_type: 'assault', severity: 5, date: '2025-01-08', address: '1800 N Broad St', neighborhood: 'Temple Area' },
  { id: 9, latitude: 39.9440, longitude: -75.1900, crime_type: 'burglary', severity: 2, date: '2025-01-07', address: '2500 Girard Ave', neighborhood: 'Brewerytown' },
  { id: 10, latitude: 39.9629, longitude: -75.1399, crime_type: 'theft', severity: 1, date: '2025-01-06', address: '1000 Spring Garden', neighborhood: 'Northern Liberties' },
  // Add more sample data to make heatmap visible
  { id: 11, latitude: 39.9520, longitude: -75.1650, crime_type: 'robbery', severity: 3, date: '2025-01-05', address: '1400 Market St', neighborhood: 'Center City' },
  { id: 12, latitude: 39.9530, longitude: -75.1655, crime_type: 'assault', severity: 4, date: '2025-01-04', address: '1600 Market St', neighborhood: 'Center City' },
  { id: 13, latitude: 39.9790, longitude: -75.1650, crime_type: 'burglary', severity: 2, date: '2025-01-03', address: '2100 N Broad St', neighborhood: 'North Philadelphia' },
  { id: 14, latitude: 39.9800, longitude: -75.1655, crime_type: 'theft', severity: 3, date: '2025-01-02', address: '2200 N Broad St', neighborhood: 'North Philadelphia' },
  { id: 15, latitude: 39.9315, longitude: -75.1720, crime_type: 'vandalism', severity: 1, date: '2025-01-01', address: '1300 S Broad St', neighborhood: 'South Philadelphia' }
];

const MapScreen = () => {
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentFilters] = useState({
    timeRange: '7d',
    crimeTypes: [],
    showHeatmap: true
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleReportPress = () => {
    Alert.alert('Report Crime', 'Report functionality would open here');
  };

  const handleSearchPress = () => {
    Alert.alert('Search', 'Search functionality would open here');
  };

  const handleFilterPress = () => {
    Alert.alert('Filters', 'Filter functionality would open here');
  };

  const handleProfilePress = () => {
    Alert.alert('Profile', 'Profile functionality would open here');
  };

  // Single HTML file with everything embedded
  const createMapHTML = () => {
    const crimeDataJson = JSON.stringify(phillyCrimeData);
    const userLocationJson = userLocation ? JSON.stringify(userLocation) : 'null';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>PhillySafe Crime Heatmap</title>
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script src="https://unpkg.com/deck.gl@^8.9.0/dist.min.js"></script>
      <script>
        let map;
        let deckOverlay;
        
        // Hardcoded Philadelphia crime data
        const crimeData = ${crimeDataJson};
        const userLocation = ${userLocationJson};
        
        console.log('Loading map with', crimeData.length, 'crime incidents');
        
        function initMap() {
          try {
            console.log('Initializing Google Maps...');
            
            // Create Google Map centered on Philadelphia
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: 39.9526, lng: -75.1652 },
              zoom: 12,
              mapTypeId: 'roadmap',
              styles: [
                { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
              ]
            });
            
            console.log('Map created, processing crime data...');
            
            // Convert crime data for Deck.gl heatmap
            const heatmapData = crimeData.map(incident => ({
              longitude: incident.longitude,
              latitude: incident.latitude,
              weight: incident.severity || 1
            }));
            
            console.log('Heatmap data processed:', heatmapData.length, 'points');
            
            // Create Deck.gl heatmap layer
            const heatmapLayer = new deck.HeatmapLayer({
              id: 'philadelphia-crime-heatmap',
              data: heatmapData,
              getPosition: d => [d.longitude, d.latitude],
              getWeight: d => d.weight,
              radiusPixels: 60,
              intensity: 1.5,
              threshold: 0.03,
              colorRange: [
                [0, 255, 0, 120],      // Green - Safe areas
                [255, 255, 0, 160],    // Yellow - Low crime  
                [255, 165, 0, 200],    // Orange - Medium crime
                [255, 69, 0, 240],     // Red-orange - High crime
                [255, 0, 0, 255]       // Red - Dangerous areas
              ],
              aggregation: 'SUM',
              weightsTextureSize: 2048
            });
            
            console.log('Creating Deck.gl overlay...');
            
            // Create Deck.gl overlay on Google Maps
            deckOverlay = new deck.GoogleMapsOverlay({
              layers: [heatmapLayer]
            });
            deckOverlay.setMap(map);
            
            console.log('Deck.gl overlay added to map');
            
            // Add user location marker if available
            if (userLocation && userLocation !== null) {
              new google.maps.Marker({
                position: { lat: userLocation.lat, lng: userLocation.lng },
                map: map,
                title: 'Your Location',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#0066FF',
                  fillOpacity: 0.8,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 3
                }
              });
              console.log('User location marker added');
            }
            
            
            // Notify React Native that map is ready
            setTimeout(function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'mapReady',
                  incidentCount: crimeData.length,
                  message: 'Philadelphia crime heatmap loaded successfully'
                }));
              }
              console.log('Map initialization complete');
            }, 1000);
            
          } catch (error) {
            console.error('Map initialization error:', error);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: error.message
              }));
            }
          }
        }
        
        
        // Load Google Maps API with hardcoded key
        function loadGoogleMaps() {
          console.log('Loading Google Maps API...');
          const script = document.createElement('script');
          script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD76ShbpMOEu02aheDb3n2gATANFZc1hgM&callback=initMap';
          script.onerror = function() {
            console.error('Failed to load Google Maps API');
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Failed to load Google Maps API. Check internet connection.'
              }));
            }
          };
          document.head.appendChild(script);
        }
        
        // Initialize when page loads
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadGoogleMaps);
        } else {
          loadGoogleMaps();
        }
      </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'mapReady':
          setIsLoading(false);
          console.log('✅ Map loaded successfully:', message.message);
          break;
        case 'error':
          setIsLoading(false);
          console.error('❌ Map error:', message.message);
          break;
        default:
          console.log('Unknown message from WebView:', message);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Text>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PhillySafe</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleProfilePress}>
          <Text>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search Philadelphia neighborhoods, streets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            editable={false}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>{currentFilters.timeRange}</Text>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>{phillyCrimeData.length} incidents</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Text style={styles.filterButtonText}>⚙️ Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Map WebView */}
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading Philadelphia Crime Map...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: createMapHTML() }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          allowsFullscreenVideo={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
          }}
        />
      </View>

      {/* Report Crime FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleReportPress}>
        <Text style={styles.fabText}>📝</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  filterChip: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#FF9500',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
  },
});

export default MapScreen;