import axios from 'axios';
import { OrchestratorResponse, Provider, Booking, Dispute, AgentLog, Notification, Review } from '../types';


const API_URL = 'https://serveai-backend.onrender.com/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export async function sendAIRequest(text: string, userId?: string, userLocation?: { lat: number; lng: number }): Promise<OrchestratorResponse> {
  const { data } = await client.post('/request', { text, user_id: userId || 'user_default', userLocation });
  return data;
}

export async function loginApi(email: string, password: string): Promise<{ user: any }> {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

export async function signupApi(name: string, email: string, phone: string, password: string, role: string, category?: string, baseRate?: number, areas?: string[]): Promise<{ user: any }> {
  const { data } = await client.post('/auth/signup', { name, email, phone, password, role, category, base_rate: baseRate, areas });
  return data;
}

export async function getProviders(params?: {
  service?: string;
  location?: string;
}): Promise<{ providers: Provider[]; total: number }> {
  const { data } = await client.get('/providers', { params });
  return data;
}

export async function getProviderById(id: string): Promise<Provider> {
  const { data } = await client.get(`/providers/${id}`);
  return data;
}

export async function getCategories(): Promise<{ categories: { label: string; value: string }[] }> {
  const { data } = await client.get('/categories');
  return data;
}

export async function getBookings(params?: { user_id?: string; provider_id?: string }): Promise<{ bookings: Booking[] }> {
  const { data } = await client.get('/bookings', { params });
  return data;
}

export async function createBooking(params: {
  user_id?: string;
  provider_id: string;
  service_type: string;
  location?: string;
  preferred_time: string;
  pricing?: {
    base_rate: number;
    travel_fee: number;
    urgency_multiplier: number;
    complexity_adjustment: number;
    surge_pricing: number;
    total_pkr: number;
  };
}): Promise<{ booking: Booking }> {
  const { data } = await client.post('/bookings', params);
  return data;
}

export async function cancelBooking(bookingId: string): Promise<{ message: string; booking_id: string }> {
  const { data } = await client.post('/bookings/cancel', { booking_id: bookingId });
  return data;
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled' | 'rejected' | 'completed'): Promise<{ message: string }> {
  const { data } = await client.post(`/bookings/${bookingId}/status`, { status });
  return data;
}

export async function createDispute(params: {
  booking_id: string;
  user_id: string;
  dispute_type: string;
  reason?: string;
}): Promise<{
  follow_up_action: Record<string, unknown>;
  dispute: Dispute | null;
  agent_trace: AgentLog[];
}> {
  const { data } = await client.post('/dispute', params);
  return data;
}

export async function getAgentLogs(): Promise<{ logs: AgentLog[] }> {
  const { data } = await client.get('/agent-logs');
  return data;
}

export async function getNotifications(userId?: string): Promise<{ notifications: Notification[] }> {
  const params = userId ? { user_id: userId } : {};
  const { data } = await client.get('/notifications', { params });
  return data;
}

export async function updateProfileApi(params: {
  user_id: string;
  name?: string;
  phone?: string;
  category?: string;
  areas?: string[];
}): Promise<{ user: any }> {
  const { data } = await client.post('/auth/profile', params);
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await client.post('/notifications/read', { notification_id: notificationId });
}

export async function checkHealth(): Promise<{ status: string }> {
  const { data } = await client.get('/../health');
  return data;
}

export async function getReviews(providerId?: string): Promise<{ reviews: Review[] }> {
  const params = providerId ? { provider_id: providerId } : {};
  const { data } = await client.get('/reviews', { params });
  return data;
}

export async function addReview(params: {
  provider_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  booking_id?: string;
}): Promise<{ review: Review }> {
  const { data } = await client.post('/reviews', params);
  return data;
}

export async function getFavorites(): Promise<{ favorites: string[] }> {
  const { data } = await client.get('/favorites');
  return data;
}

export async function toggleFavorite(providerId: string): Promise<{ is_favorite: boolean }> {
  const { data } = await client.post('/favorites/toggle', { provider_id: providerId });
  return data;
}

export async function calculateDynamicPricing(userLocation: { lat: number; lng: number } | undefined, providerId: string): Promise<any> {
  const { data } = await client.post('/pricing/calculate', { userLocation, provider_id: providerId });
  return data;
}

export async function getPaymentMethods(): Promise<{ methods: any[] }> {
  const { data } = await client.get('/payments');
  return data;
}

export async function addPaymentMethod(params: { type: string; details: any }): Promise<any> {
  const { data } = await client.post('/payments/add', params);
  return data;
}

export async function removePaymentMethod(id: string): Promise<any> {
  const { data } = await client.delete(`/payments/${id}`);
  return data;
}