// API service for PhillySafe backend
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

export interface Incident {
  id: string;
  the_geom?: string;
  cartodb_id?: number;
  the_geom_webmercator?: string;
  objectid?: number;
  dc_dist?: number;
  psa?: number;
  dispatch_date_time?: string;
  dispatch_date?: string;
  dispatch_time?: string;
  hour?: number;
  dc_key?: string;
  location_block?: string;
  ucr_general?: number;
  text_general_code?: string;
  point_x?: number;
  point_y?: number;
  lat?: number;
  lng?: number;
}

export interface CreateIncidentRequest {
  the_geom?: string;
  cartodb_id?: number;
  the_geom_webmercator?: string;
  objectid?: number;
  dc_dist?: number;
  psa?: number;
  dispatch_date_time?: string;
  dispatch_date?: string;
  dispatch_time?: string;
  hour?: number;
  dc_key?: string;
  location_block?: string;
  ucr_general?: number;
  text_general_code?: string;
  point_x?: number;
  point_y?: number;
  lat?: number;
  lng?: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all crime data
  async getCrime(): Promise<Incident[]> {
    return this.request<Incident[]>('/crime');
  }

  // Get a specific crime record by ID
  async getCrimeById(id: string): Promise<Incident> {
    return this.request<Incident>(`/crime/${id}`);
  }

  // Create a new crime record
  async createCrime(incident: CreateIncidentRequest): Promise<Incident> {
    return this.request<Incident>('/crime', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  // Convert API incident to map-compatible format
  convertToMapData(incidents: Incident[]) {
    return incidents.map(incident => ({
      id: incident.id,
      latitude: incident.lat || incident.point_y || 0,
      longitude: incident.lng || incident.point_x || 0,
      crime_type: this.getCrimeTypeFromUCR(incident.ucr_general),
      severity: this.getSeverityFromUCR(incident.ucr_general),
      date: incident.dispatch_date ? incident.dispatch_date.split('T')[0] : new Date().toISOString().split('T')[0],
      address: incident.location_block || 'Unknown Location',
      neighborhood: this.extractNeighborhood(incident.location_block),
      type: incident.text_general_code || 'Unknown Crime',
      source: 'official', // All data from MongoDB is official
      description: incident.text_general_code,
      hour: incident.hour,
      dc_dist: incident.dc_dist,
      psa: incident.psa,
    }));
  }

  private getCrimeTypeFromUCR(ucr_general?: number): string {
    if (!ucr_general) return 'other';
    
    // Map UCR codes to crime types
    if (ucr_general >= 100 && ucr_general < 200) return 'violent';
    if (ucr_general >= 200 && ucr_general < 300) return 'property';
    if (ucr_general >= 300 && ucr_general < 400) return 'violent';
    if (ucr_general >= 400 && ucr_general < 500) return 'property';
    if (ucr_general >= 500 && ucr_general < 600) return 'property';
    if (ucr_general >= 600 && ucr_general < 700) return 'vehicle';
    if (ucr_general >= 700 && ucr_general < 800) return 'drug';
    if (ucr_general >= 800 && ucr_general < 900) return 'vandalism';
    return 'other';
  }

  private getSeverityFromUCR(ucr_general?: number): number {
    if (!ucr_general) return 1;
    
    // Map UCR codes to severity levels
    if (ucr_general >= 100 && ucr_general < 200) return 3; // Violent crimes
    if (ucr_general >= 200 && ucr_general < 300) return 2; // Property crimes
    if (ucr_general >= 300 && ucr_general < 400) return 3; // Violent crimes
    if (ucr_general >= 400 && ucr_general < 500) return 2; // Property crimes
    if (ucr_general >= 500 && ucr_general < 600) return 2; // Property crimes
    if (ucr_general >= 600 && ucr_general < 700) return 2; // Vehicle crimes
    if (ucr_general >= 700 && ucr_general < 800) return 3; // Drug crimes
    if (ucr_general >= 800 && ucr_general < 900) return 1; // Vandalism
    return 1;
  }

  private extractNeighborhood(location_block?: string): string {
    if (!location_block) return 'Unknown';
    
    // Extract neighborhood from location block
    // This is a simple extraction - you might want to improve this
    const parts = location_block.split(' ');
    if (parts.length > 2) {
      return parts.slice(2).join(' ');
    }
    return 'Unknown';
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
