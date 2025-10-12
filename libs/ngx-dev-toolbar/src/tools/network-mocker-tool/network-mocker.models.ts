export interface MockRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: number;
  response: any;
  isActive: boolean;
  createdAt: Date;
}

export interface MockRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status?: number;
  response?: any;
  delay?: number;
}
