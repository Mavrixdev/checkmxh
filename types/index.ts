export interface PhoneInfo {
  phone?: string;
  carrier?: {
    name: string;
    code: string;
  };
}

export interface FacebookData {
  name?: string;
  uid?: string;
  link?: string;
  avatar?: string;
  verified?: boolean;
  accounts?: any[];
}

export interface TelegramData {
  username?: string;
  first_name?: string;
  user_id?: string;
  is_bot?: boolean;
  is_scammer?: boolean;
  found?: boolean;
  about?: string;
}

export interface ZaloData {
  name?: string;
  user_id?: string;
  avatar?: string;
  status?: string;
  gender?: string;
  dob?: string;
  zalo_id?: string;
  uid?: string;
  cover?: string;
  globalId?: string;
}

export interface BankInfo {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
}

export interface LookupResult {
  _id?: string;
  phone: string;
  phoneInfo?: PhoneInfo;
  facebook?: FacebookData;
  telegram?: TelegramData;
  zalo?: ZaloData;
  instagram?: {
    success: boolean;
    found: boolean;
    message?: string;
  };
  banks?: any;
  checkscam?: {
    status?: string;
    reports?: number;
    is_scammer?: boolean;
    verdict?: string;
  };
  carrier?: {
    network?: string;
    type?: string;
  };
  credit?: string;
  createdAt: string;
  cached?: boolean;
}

export interface Stats {
  totalLookups: number;
  totalScammers: number;
  cacheHits: number;
  freshScans: number;
}

export interface QueueStatus {
  size: number;
  pending: number;
  total: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  mongodb: 'connected' | 'disconnected';
  queue: QueueStatus;
}

export interface LogEntry {
  timestamp: string;
  type: 'lookup' | 'error' | 'queue' | 'system';
  message: string;
  details?: any;
}

export interface AdminSession {
  isAuthenticated: boolean;
  sessionId?: string;
}

export interface MongoCollectionInfo {
  name: string;
  count: number;
  sampleFields: string[];
}

export interface MongoCollectionsResponse {
  database: string;
  state: number;
  collections: MongoCollectionInfo[];
}

export type MongoDocument = Record<string, any> & {
  _id?: string;
};

export interface MongoDocumentsResponse {
  collection: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  documents: MongoDocument[];
}

export interface AppSettings {
  site: {
    title: string;
    description: string;
    keywords: string;
    iconUrl: string;
  };
  api: {
    baseUrl: string;
    privateKey: string;
    requirePrivateKey: boolean;
  };
  updatedAt?: string;
}

export interface PublicSettings {
  site: AppSettings['site'];
  api: {
    baseUrl: string;
    requirePrivateKey: boolean;
  };
  updatedAt?: string;
}
