// Mock data for Philadelphia crime incidents and community reports
export interface Incident {
  id: number;
  type: string;
  location: string;
  address: string;
  neighborhood: string;
  time: string;
  distance: number;
  lat: number;
  lon: number;
  source: 'official' | 'community';
  severity: 'low' | 'medium' | 'high';
  caseNumber?: string;
  description?: string;
  photos?: string[];
  status?: 'open' | 'in-progress' | 'resolved';
  reportedBy?: string;
  category: 'violent' | 'property' | 'vehicle' | 'drug' | 'vandalism' | 'quality-of-life';
}

export const mockIncidents: Incident[] = [
  // Center City
  {
    id: 1,
    type: 'Robbery',
    location: '15th & Market St',
    address: '1500 Market Street',
    neighborhood: 'Center City',
    time: '2025-01-19T02:21:00Z',
    distance: 0.3,
    lat: 39.9526,
    lon: -75.1652,
    source: 'official',
    severity: 'high',
    caseNumber: 'CC-2025-001234',
    description: 'Armed robbery at convenience store',
    category: 'violent'
  },
  {
    id: 2,
    type: 'Broken Streetlight',
    location: 'Broad & Pine St',
    address: '1400 South Broad Street',
    neighborhood: 'Center City',
    time: '2025-01-18T18:30:00Z',
    distance: 0.5,
    lat: 39.9500,
    lon: -75.1667,
    source: 'community',
    severity: 'medium',
    description: 'Streetlight has been out for 3 days, making the area unsafe at night',
    status: 'open',
    reportedBy: 'Anonymous',
    category: 'quality-of-life'
  },
  
  // South Philadelphia
  {
    id: 3,
    type: 'Burglary',
    location: '2nd & Christian St',
    address: '200 Christian Street',
    neighborhood: 'South Philadelphia',
    time: '2025-01-18T14:15:00Z',
    distance: 1.2,
    lat: 39.9413,
    lon: -75.1500,
    source: 'official',
    severity: 'medium',
    caseNumber: 'SP-2025-005678',
    description: 'Residential burglary, electronics stolen',
    category: 'property'
  },
  {
    id: 4,
    type: 'Trash Pile',
    location: '9th & Passyunk Ave',
    address: '900 Passyunk Avenue',
    neighborhood: 'South Philadelphia',
    time: '2025-01-18T09:45:00Z',
    distance: 1.5,
    lat: 39.9380,
    lon: -75.1580,
    source: 'community',
    severity: 'low',
    description: 'Large pile of trash dumped illegally, attracting rats',
    status: 'in-progress',
    reportedBy: 'Local Resident',
    category: 'quality-of-life'
  },

  // Northern Liberties
  {
    id: 5,
    type: 'Vehicle Theft',
    location: '2nd & Brown St',
    address: '200 Brown Street',
    neighborhood: 'Northern Liberties',
    time: '2025-01-17T23:30:00Z',
    distance: 2.1,
    lat: 39.9661,
    lon: -75.1419,
    source: 'official',
    severity: 'medium',
    caseNumber: 'NL-2025-002345',
    description: 'Honda Civic stolen from street parking',
    category: 'vehicle'
  },
  {
    id: 6,
    type: 'Vandalism',
    location: '3rd & Poplar St',
    address: '300 Poplar Street',
    neighborhood: 'Northern Liberties',
    time: '2025-01-17T20:15:00Z',
    distance: 2.3,
    lat: 39.9650,
    lon: -75.1400,
    source: 'community',
    severity: 'low',
    description: 'Graffiti on building wall, offensive language',
    status: 'open',
    reportedBy: 'Business Owner',
    category: 'vandalism'
  },

  // Fishtown
  {
    id: 7,
    type: 'Drug Activity',
    location: 'Frankford & Girard Ave',
    address: '1200 Frankford Avenue',
    neighborhood: 'Fishtown',
    time: '2025-01-17T16:45:00Z',
    distance: 2.8,
    lat: 39.9703,
    lon: -75.1350,
    source: 'official',
    severity: 'high',
    caseNumber: 'FT-2025-003456',
    description: 'Drug dealing observed, multiple arrests made',
    category: 'drug'
  },
  {
    id: 8,
    type: 'Suspicious Activity',
    location: 'Belgrade & Marlborough St',
    address: '1100 Belgrade Street',
    neighborhood: 'Fishtown',
    time: '2025-01-17T12:20:00Z',
    distance: 3.0,
    lat: 39.9720,
    lon: -75.1320,
    source: 'community',
    severity: 'medium',
    description: 'Individual looking into car windows, possibly casing vehicles',
    status: 'open',
    reportedBy: 'Concerned Neighbor',
    category: 'property'
  },

  // University City
  {
    id: 9,
    type: 'Assault',
    location: '40th & Spruce St',
    address: '4000 Spruce Street',
    neighborhood: 'University City',
    time: '2025-01-16T22:10:00Z',
    distance: 3.5,
    lat: 39.9550,
    lon: -75.2000,
    source: 'official',
    severity: 'high',
    caseNumber: 'UC-2025-004567',
    description: 'Physical altercation between two individuals',
    category: 'violent'
  },
  {
    id: 10,
    type: 'Broken Streetlight',
    location: '38th & Walnut St',
    address: '3800 Walnut Street',
    neighborhood: 'University City',
    time: '2025-01-16T19:30:00Z',
    distance: 3.2,
    lat: 39.9530,
    lon: -75.1980,
    source: 'community',
    severity: 'medium',
    description: 'Multiple streetlights out on block, students feel unsafe',
    status: 'in-progress',
    reportedBy: 'Student',
    category: 'quality-of-life'
  },

  // Rittenhouse Square
  {
    id: 11,
    type: 'Theft',
    location: '18th & Walnut St',
    address: '1800 Walnut Street',
    neighborhood: 'Rittenhouse Square',
    time: '2025-01-16T15:45:00Z',
    distance: 0.8,
    lat: 39.9500,
    lon: -75.1720,
    source: 'official',
    severity: 'low',
    caseNumber: 'RS-2025-005678',
    description: 'Purse snatching in busy shopping area',
    category: 'property'
  },
  {
    id: 12,
    type: 'Vandalism',
    location: 'Rittenhouse Square Park',
    address: '1800 Rittenhouse Square',
    neighborhood: 'Rittenhouse Square',
    time: '2025-01-16T08:20:00Z',
    distance: 0.9,
    lat: 39.9490,
    lon: -75.1710,
    source: 'community',
    severity: 'low',
    description: 'Park bench carved with initials and inappropriate words',
    status: 'resolved',
    reportedBy: 'Park Visitor',
    category: 'vandalism'
  },

  // Old City
  {
    id: 13,
    type: 'Burglary',
    location: '3rd & Market St',
    address: '300 Market Street',
    neighborhood: 'Old City',
    time: '2025-01-15T03:30:00Z',
    distance: 0.4,
    lat: 39.9495,
    lon: -75.1470,
    source: 'official',
    severity: 'medium',
    caseNumber: 'OC-2025-006789',
    description: 'Break-in at historic building, artifacts stolen',
    category: 'property'
  },
  {
    id: 14,
    type: 'Trash Pile',
    location: '2nd & Race St',
    address: '200 Race Street',
    neighborhood: 'Old City',
    time: '2025-01-15T11:15:00Z',
    distance: 0.6,
    lat: 39.9520,
    lon: -75.1450,
    source: 'community',
    severity: 'medium',
    description: 'Construction debris left on sidewalk for weeks',
    status: 'open',
    reportedBy: 'Pedestrian',
    category: 'quality-of-life'
  },

  // Kensington
  {
    id: 15,
    type: 'Drug Activity',
    location: 'Kensington & Allegheny Ave',
    address: '3000 Kensington Avenue',
    neighborhood: 'Kensington',
    time: '2025-01-15T14:50:00Z',
    distance: 4.2,
    lat: 39.9967,
    lon: -75.1250,
    source: 'official',
    severity: 'high',
    caseNumber: 'KN-2025-007890',
    description: 'Open-air drug market, multiple suspects detained',
    category: 'drug'
  },
  {
    id: 16,
    type: 'Broken Streetlight',
    location: 'Frankford & Norris St',
    address: '2900 Frankford Avenue',
    neighborhood: 'Kensington',
    time: '2025-01-15T07:25:00Z',
    distance: 4.0,
    lat: 39.9950,
    lon: -75.1270,
    source: 'community',
    severity: 'high',
    description: 'Entire block without lighting, safety concern for residents',
    status: 'open',
    reportedBy: 'Community Leader',
    category: 'quality-of-life'
  },

  // West Philadelphia
  {
    id: 17,
    type: 'Vehicle Theft',
    location: '52nd & Market St',
    address: '5200 Market Street',
    neighborhood: 'West Philadelphia',
    time: '2025-01-14T21:40:00Z',
    distance: 4.8,
    lat: 39.9580,
    lon: -75.2200,
    source: 'official',
    severity: 'medium',
    caseNumber: 'WP-2025-008901',
    description: 'Toyota Camry stolen from parking lot',
    category: 'vehicle'
  },
  {
    id: 18,
    type: 'Suspicious Activity',
    location: '46th & Chestnut St',
    address: '4600 Chestnut Street',
    neighborhood: 'West Philadelphia',
    time: '2025-01-14T18:10:00Z',
    distance: 4.5,
    lat: 39.9560,
    lon: -75.2100,
    source: 'community',
    severity: 'medium',
    description: 'Person attempting to break into parked cars',
    status: 'in-progress',
    reportedBy: 'Witness',
    category: 'property'
  }
];

// Philadelphia neighborhoods for search suggestions
export const phillyNeighborhoods = [
  'Center City',
  'South Philadelphia',
  'Northern Liberties',
  'Fishtown',
  'University City',
  'Rittenhouse Square',
  'Old City',
  'Kensington',
  'West Philadelphia',
  'Chinatown',
  'Society Hill',
  'Graduate Hospital',
  'Point Breeze',
  'Brewerytown',
  'Fairmount',
  'Spring Garden',
  'Pennsport',
  'Queen Village',
  'Bella Vista',
  'Hawthorne'
];

// Common Philadelphia locations and landmarks
export const phillyLocations = [
  { name: 'City Hall', address: 'Broad & Market St', neighborhood: 'Center City' },
  { name: 'Independence Hall', address: '520 Chestnut St', neighborhood: 'Old City' },
  { name: 'Rittenhouse Square Park', address: '1800 Rittenhouse Square', neighborhood: 'Rittenhouse Square' },
  { name: 'University of Pennsylvania', address: '3451 Walnut St', neighborhood: 'University City' },
  { name: 'Temple University', address: '1801 N Broad St', neighborhood: 'North Philadelphia' },
  { name: 'Philadelphia Museum of Art', address: '2600 Benjamin Franklin Pkwy', neighborhood: 'Fairmount' },
  { name: 'Reading Terminal Market', address: '51 N 12th St', neighborhood: 'Center City' },
  { name: 'South Street', address: 'South Street', neighborhood: 'South Philadelphia' },
  { name: 'Broad Street', address: 'Broad Street', neighborhood: 'Center City' },
  { name: 'Market Street', address: 'Market Street', neighborhood: 'Center City' }
];

// Filter functions
export const filterIncidentsByLocation = (incidents: Incident[], searchQuery: string): Incident[] => {
  if (!searchQuery.trim()) return incidents;
  
  const query = searchQuery.toLowerCase();
  return incidents.filter(incident => 
    incident.location.toLowerCase().includes(query) ||
    incident.address.toLowerCase().includes(query) ||
    incident.neighborhood.toLowerCase().includes(query)
  );
};

export const filterIncidentsByType = (incidents: Incident[], types: string[]): Incident[] => {
  if (types.length === 0) return incidents;
  return incidents.filter(incident => types.includes(incident.category));
};

export const filterIncidentsBySource = (incidents: Incident[], sources: { official: boolean; community: boolean }): Incident[] => {
  const allowedSources: string[] = [];
  if (sources.official) allowedSources.push('official');
  if (sources.community) allowedSources.push('community');
  
  if (allowedSources.length === 0) return [];
  return incidents.filter(incident => allowedSources.includes(incident.source));
};

export const filterIncidentsByTimeRange = (incidents: Incident[], timeRange: string, customStart?: Date, customEnd?: Date): Incident[] => {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      if (!customStart) return incidents;
      startDate = customStart;
      break;
    default:
      return incidents;
  }
  
  const endDate = timeRange === 'custom' && customEnd ? customEnd : now;
  
  return incidents.filter(incident => {
    const incidentDate = new Date(incident.time);
    return incidentDate >= startDate && incidentDate <= endDate;
  });
};

// Get incidents near a specific location (simplified)
export const getIncidentsNearLocation = (location: string): Incident[] => {
  const locationLower = location.toLowerCase();
  
  // Simple filtering by neighborhood or address match
  return mockIncidents.filter(incident => 
    incident.neighborhood.toLowerCase().includes(locationLower) ||
    incident.location.toLowerCase().includes(locationLower) ||
    incident.address.toLowerCase().includes(locationLower)
  ).slice(0, 10); // Limit to 10 nearest incidents
};