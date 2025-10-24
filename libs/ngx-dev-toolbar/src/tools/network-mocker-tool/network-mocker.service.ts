import { Injectable, signal } from '@angular/core';
import { MockRequest, MockRequestConfig } from './network-mocker.models';

@Injectable({
  providedIn: 'root',
})
export class DevToolbarNetworkMockerService {
  private readonly mockRequests = signal<MockRequest[]>([]);
  private readonly isMockingEnabled = signal(false);

  getMockRequests() {
    return this.mockRequests.asReadonly();
  }

  getIsMockingEnabled() {
    return this.isMockingEnabled.asReadonly();
  }

  addMockRequest(config: MockRequestConfig): void {
    const mockRequest: MockRequest = {
      id: crypto.randomUUID(),
      url: config.url,
      method: config.method,
      status: config.status || 200,
      response: config.response || {},
      isActive: true,
      createdAt: new Date(),
    };

    this.mockRequests.update((requests) => [mockRequest, ...requests]);
  }

  removeMockRequest(id: string): void {
    this.mockRequests.update((requests) =>
      requests.filter((request) => request.id !== id)
    );
  }

  toggleMockRequest(id: string): void {
    this.mockRequests.update((requests) =>
      requests.map((request) =>
        request.id === id
          ? { ...request, isActive: !request.isActive }
          : request
      )
    );
  }

  enableMocking(): void {
    this.isMockingEnabled.set(true);
  }

  disableMocking(): void {
    this.isMockingEnabled.set(false);
  }

  clearAllMocks(): void {
    this.mockRequests.set([]);
    this.isMockingEnabled.set(false);
  }
}
