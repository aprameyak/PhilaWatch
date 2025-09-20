import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import MapScreen from './src/screens/MapScreen';
import SearchScreen from './src/screens/SearchScreen';
import ReportScreen from './src/screens/ReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FilterScreen from './src/screens/FilterScreen';
import IncidentDetailsScreen from './src/screens/IncidentDetailsScreen';

// Types
import { RootStackParamList, MainTabParamList, AppFilters } from './src/types/navigation';
import { Incident, mockIncidents } from './src/data/mockData';

// Icons (you may need to adjust these based on your icon library)
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Report') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [userReports, setUserReports] = useState<Incident[]>([]);
  const [currentFilters, setCurrentFilters] = useState<AppFilters>({
    timeRange: '7d',
    crimeTypes: [],
    timeOfDay: [],
    dataSources: {
      official: true,
      community: true,
    },
    heatmapIntensity: [50],
    heatmapRadius: [30],
    showHeatmap: true,
    searchLocation: ''
  });

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then(value => {
      if (value == null) {
        AsyncStorage.setItem('hasLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  const handleReportSubmit = (report: any) => {
    const newReport: Incident = {
      ...report,
      id: Date.now(),
      time: new Date().toISOString(),
      source: 'community' as const,
      reportedBy: 'You (Anonymous)',
      status: 'open',
      lat: 39.9526 + (Math.random() - 0.5) * 0.01,
      lon: -75.1652 + (Math.random() - 0.5) * 0.01,
      distance: Math.random() * 2,
      neighborhood: 'Center City',
      address: report.location || 'Current Location',
      category: report.type === 'trash' ? 'quality-of-life' : 
               report.type === 'light' ? 'quality-of-life' : 
               report.type === 'vandalism' ? 'vandalism' : 'property'
    };
    
    setUserReports(prev => [...prev, newReport]);
    Alert.alert('Success', 'Your report has been submitted successfully!');
  };

  const handleApplyFilters = (filters: AppFilters) => {
    setCurrentFilters(filters);
  };

  if (isFirstLaunch === null) {
    return null; // Loading state
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isFirstLaunch ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : null}
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="IncidentDetails" 
            component={IncidentDetailsScreen}
            options={{ headerShown: true, title: 'Incident Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
