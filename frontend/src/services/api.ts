const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface Incident {
  id?: string;
  _id?: string;
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

export interface ConvertedIncident {
  id: string;
  type: string;
  location: string;
  address: string;
  neighborhood: string;
  time: string;
  distance: number;
  lat: number;
  lon: number;
  source: string;
  severity: string;
  category: string;
  description?: string;
  caseNumber?: string;
  reportedBy?: string;
  status?: string;
  photos?: string[];
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

export interface UserReport {
  id: string;
  type: string;
  location: string;
  use_current_location: boolean;
  photos: string[];
  description: string;
  severity: string;
  anonymous: boolean;
  contact?: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  status: string;
  user_id?: string;
}

export interface CreateUserReportRequest {
  type: string;
  location: string;
  use_current_location: boolean;
  photos: string[];
  description: string;
  severity: string;
  anonymous: boolean;
  contact?: string;
  lat?: number;
  lng?: number;
  user_id?: string;
}

export interface UserData {
  id: string;
  user_id: string;
  total_submissions: number;
  first_submission_date?: string;
  last_submission_date?: string;
  submission_types: Record<string, number>;
  total_photos_submitted: number;
  reports_resolved: number;
  reports_pending: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date?: string;
  level: number;
  experience_points: number;
  achievements: string[];
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserDataRequest {
  user_id: string;
  total_submissions?: number;
  first_submission_date?: string;
  last_submission_date?: string;
  submission_types?: Record<string, number>;
  total_photos_submitted?: number;
  reports_resolved?: number;
  reports_pending?: number;
  streak_days?: number;
  longest_streak?: number;
  last_activity_date?: string;
  level?: number;
  experience_points?: number;
  achievements?: string[];
  badges?: string[];
}

export interface UpdateUserDataRequest {
  total_submissions?: number;
  last_submission_date?: string;
  submission_types?: Record<string, number>;
  total_photos_submitted?: number;
  reports_resolved?: number;
  reports_pending?: number;
  streak_days?: number;
  longest_streak?: number;
  last_activity_date?: string;
  level?: number;
  experience_points?: number;
  achievements?: string[];
  badges?: string[];
}

export interface User {
  id: string;
  username: string;
  display_name: string;
  total_contributions: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserRegister {
  username: string;
  password: string;
  display_name: string;
}

export interface UserLogin {
  username: string;
  password: string;
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

  async getCrime(): Promise<Incident[]> {
    return this.request<Incident[]>('/crime');
  }

  async getCrimeById(id: string): Promise<Incident> {
    return this.request<Incident>(`/crime/${id}`);
  }

  async createCrime(incident: CreateIncidentRequest): Promise<Incident> {
    return this.request<Incident>('/crime', {
      method: 'POST',
      body: JSON.stringify(incident),
    });
  }

  async getUserReports(): Promise<UserReport[]> {
    return this.request<UserReport[]>('/reports');
  }

  async getUserReportById(id: string): Promise<UserReport> {
    return this.request<UserReport>(`/reports/${id}`);
  }

  async createUserReport(report: CreateUserReportRequest): Promise<UserReport> {
    return this.request<UserReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async updateReportStatus(reportId: string, status: string): Promise<UserReport> {
    return this.request<UserReport>(`/reports/${reportId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getUserData(userId: string): Promise<UserData> {
    return this.request<UserData>(`/userdata/${userId}`);
  }

  async createUserData(userData: CreateUserDataRequest): Promise<UserData> {
    return this.request<UserData>('/userdata', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getLeaderboard(): Promise<UserData[]> {
    return this.request<UserData[]>('/userdata/leaderboard');
  }

  async registerUser(userData: UserRegister): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(loginData: UserLogin): Promise<User> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.request<User>(`/auth/users/${username}`);
  }

  async updateUserContributions(username: string, contributions: number): Promise<{message: string}> {
    return this.request<{message: string}>(`/auth/users/${username}/contributions?contributions=${contributions}`, {
      method: 'PUT',
    });
  }

  convertToMapData(incidents: Incident[]) {
    return incidents.map(incident => ({
      id: incident.id || incident._id,
      latitude: incident.lat || incident.point_y || 0,
      longitude: incident.lng || incident.point_x || 0,
      crime_type: this.getCrimeTypeFromUCR(incident.ucr_general),
      severity: this.getSeverityFromUCR(incident.ucr_general),
      date: incident.dispatch_date ? incident.dispatch_date.split('T')[0] : new Date().toISOString().split('T')[0],
      address: incident.location_block || 'Unknown Location',
      neighborhood: this.extractNeighborhood(incident.location_block),
      type: incident.text_general_code || 'Unknown Crime',
      source: 'official',
      description: incident.text_general_code,
      hour: incident.hour,
      dc_dist: incident.dc_dist,
      psa: incident.psa,
    }));
  }

  private getCrimeTypeFromUCR(ucr_general?: number): string {
    if (!ucr_general) return 'other';
    
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
    
    if (ucr_general >= 100 && ucr_general < 200) return 3;
    if (ucr_general >= 200 && ucr_general < 300) return 2;
    if (ucr_general >= 300 && ucr_general < 400) return 3;
    if (ucr_general >= 400 && ucr_general < 500) return 2;
    if (ucr_general >= 500 && ucr_general < 600) return 2;
    if (ucr_general >= 600 && ucr_general < 700) return 2;
    if (ucr_general >= 700 && ucr_general < 800) return 3;
    if (ucr_general >= 800 && ucr_general < 900) return 1;
    return 1;
  }

  private extractNeighborhood(location_block?: string): string {
    if (!location_block) return 'Unknown';
    
    const parts = location_block.split(' ');
    if (parts.length > 2) {
      return parts.slice(2).join(' ');
    }
    return 'Unknown';
  }
}

export const apiService = new ApiService();
export default apiService;
