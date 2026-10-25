import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";
import { useCrime } from "../hooks/useIncidents";
import { apiService } from "../services/api";

const { width, height } = Dimensions.get("window");

const MapScreen = () => {
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [crimeData, setCrimeData] = useState<any[]>([]);
  const { incidents, loading: incidentsLoading, error: incidentsError } = useCrime();
  const [currentFilters] = useState({
    timeRange: "7d",
    crimeTypes: [],
    showHeatmap: true,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (incidents && incidents.length > 0) {
      const mapData = apiService.convertToMapData(incidents);
      setCrimeData(mapData);
    }
  }, [incidents]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleReportPress = () => {
    navigation.navigate("SnapShot");
  };

  const handleSearchPress = () => {
    Alert.alert("Search", "Search functionality would open here");
  };

  const handleFilterPress = () => {
    Alert.alert("Filters", "Filter functionality would open here");
  };


  const createMapHTML = () => {
    const crimeDataJson = JSON.stringify(crimeData);
    const userLocationJson = userLocation
      ? JSON.stringify(userLocation)
      : "null";

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
      
      <script src="${process.env.EXPO_PUBLIC_DECKGL_CDN_URL || 'https://unpkg.com/deck.gl@^8.9.0/dist.min.js'}"></script>
      <script>
        let map;
        let deckOverlay;
        
        const crimeData = ${crimeDataJson};
        const userLocation = ${userLocationJson};
        
        const RADIUS_METERS = 200; // Constant radius for incident queries
        let tooltipTimeout;
        
        console.log('Loading map with', crimeData.length, 'crime incidents');
        
        function calculateDistance(lat1, lng1, lat2, lng2) {
          const R = 6371000; // Earth's radius in meters
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c; // Distance in meters
        }
        
        function queryIncidentsInRadius(lat, lng, radiusMeters) {
          return crimeData.filter(incident => {
            const distance = calculateDistance(lat, lng, incident.latitude, incident.longitude);
            return distance <= radiusMeters;
          });
        }
        
        function hideTooltip() {
          const existingTooltip = document.getElementById('tap-tooltip');
          if (existingTooltip) {
            existingTooltip.remove();
          }
          if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
          }
        }
        
        function showTooltip(incidents, latLng, event) {
          hideTooltip();
          
          const tooltip = document.createElement('div');
          tooltip.id = 'tap-tooltip';
          
          const crimeTypes = {};
          incidents.forEach(incident => {
            const type = incident.crime_type || 'Unknown';
            crimeTypes[type] = (crimeTypes[type] || 0) + 1;
          });
          
          const crimeTypeList = Object.entries(crimeTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type, count]) => \`• \${type} (\${count})\`)
            .join('<br>');
          
          tooltip.innerHTML = \`
            <div style="
              background: rgba(0,0,0,0.9);
              color: white;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 14px;
              pointer-events: none;
              z-index: 1000;
              max-width: 250px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              <strong>\${incidents.length} incidents</strong><br>
              <span style="color: #ccc;">Within \${RADIUS_METERS}m radius</span>
              \${incidents.length > 0 ? \`
                <br><br>
                <strong>Crime Types:</strong><br>
                \${crimeTypeList}
                \${Object.keys(crimeTypes).length > 3 ? \`<br>... and \${Object.keys(crimeTypes).length - 3} more types\` : ''}
              \` : ''}
            </div>
          \`;
          
          const mapDiv = document.getElementById('map');
          const rect = mapDiv.getBoundingClientRect();
          tooltip.style.position = 'absolute';
          tooltip.style.left = (event.pixel.x + 10) + 'px';
          tooltip.style.top = (event.pixel.y - 10) + 'px';
          
          const tooltipRect = tooltip.getBoundingClientRect();
          if (event.pixel.x + 250 > rect.width) {
            tooltip.style.left = (event.pixel.x - 260) + 'px';
          }
          if (event.pixel.y - 100 < 0) {
            tooltip.style.top = (event.pixel.y + 20) + 'px';
          }
          
          mapDiv.appendChild(tooltip);
          
          tooltipTimeout = setTimeout(hideTooltip, 4000);
        }
        
        function addTapTooltipFunctionality() {
          map.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            console.log('Map tapped at:', lat, lng);
            
            const incidents = queryIncidentsInRadius(lat, lng, RADIUS_METERS);
            
            console.log('Found', incidents.length, 'incidents within', RADIUS_METERS, 'meters');
            
            showTooltip(incidents, event.latLng, event);
          });
          
          console.log('Tap tooltip functionality added');
        }
        
        function initMap() {
          try {
            console.log('Initializing Google Maps...');
            
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
            
            const heatmapData = crimeData.map(incident => ({
              longitude: incident.longitude,
              latitude: incident.latitude,
              weight: incident.severity || 1
            }));
            
            console.log('Heatmap data processed:', heatmapData.length, 'points');
            
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
            
            deckOverlay = new deck.GoogleMapsOverlay({
              layers: [heatmapLayer]
            });
            deckOverlay.setMap(map);
            
            console.log('Deck.gl overlay added to map');
            
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
            
            
            addTapTooltipFunctionality();
            
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
        
        
        function loadGoogleMaps() {
          console.log('Loading Google Maps API...');
          const script = document.createElement('script');
          script.src = \`https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap\`;
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

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case "mapReady":
          setIsLoading(false);
          console.log("✅ Map loaded successfully:", message.message);
          break;
        case "error":
          setIsLoading(false);
          console.error("❌ Map error:", message.message);
          break;
        default:
          console.log("Unknown message from WebView:", message);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Text>
            {" "}
            <Ionicons name={"menu-outline"} size={25} />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PhillyWatch</Text>
          <Text>
            {" "}
            <Ionicons name={"person-circle-outline"} size={25} />
          </Text>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>
            {" "}
            <Ionicons name={"search-outline"} size={20} />
          </Text>
          <TextInput
            placeholder="Search Philadelphia neighborhoods, streets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            editable={false}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>{currentFilters.timeRange}</Text>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>
            {incidentsLoading ? 'Loading...' : `${crimeData.length} incidents`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterPress}
        >
          <Text style={styles.filterButtonText}>
            {" "}
            <Ionicons name={"filter-outline"} size={15} />
          </Text>
          <Text style={styles.filterButtonText}> Filters </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {(isLoading || incidentsLoading) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              {incidentsLoading ? 'Loading incident data...' : 'Loading Philadelphia Crime Map...'}
            </Text>
            {incidentsError && (
              <Text style={styles.errorText}>
                Error: {incidentsError}
              </Text>
            )}
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
            console.error("WebView error: ", nativeEvent);
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView HTTP error: ", nativeEvent);
          }}
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleReportPress}>
        <Text style={styles.fabText}>
          {" "}
          <Ionicons name={"camera-outline"} size={25} color={"#54585e"} />{" "}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#387bb5",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
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
    color: "#1C1C1E",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  filterChip: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    flexDirection: "row",
    gap: 8,
    color: "#007AFF",
    marginLeft: 5,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 9,
    width: 56,
    height: 56,
    backgroundColor: "#fafcff",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
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
