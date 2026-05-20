import { create } from 'zustand';
import { Booking, OrchestratorResponse } from '../types';

interface BookingState {
  currentResponse: OrchestratorResponse | null;
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  setCurrentResponse: (response: OrchestratorResponse | null) => void;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentResponse: null,
  bookings: [],
  isLoading: false,
  error: null,
  setCurrentResponse: (response) => set({ currentResponse: response }),
  setBookings: (bookings) => set({ bookings }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentResponse: null,
      bookings: [],
      isLoading: false,
      error: null,
    }),
}));
