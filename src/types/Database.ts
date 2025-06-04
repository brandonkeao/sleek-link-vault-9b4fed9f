
export interface UserSettings {
  id: string;
  userId: string;
  rebrandlyApiKey?: string;
  autoShortenEnabled: boolean;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiLog {
  id: string;
  userId: string;
  requestType: string;
  requestData: any;
  responseData: any;
  statusCode?: number;
  errorMessage?: string;
  createdAt: Date;
}
