import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { BookingState, PaymentMethod, BookingParticipant } from '../../types';

const initialParticipant = () => ({
  id: `p-${Date.now()}`,
  name: '',
  serviceId: null as string | null,
  staffId: null as string | null,
  addonIds: [] as string[],
});

const initialState: BookingState = {
  businessId: 'trimora-salon',
  locationId: 'trimora-loc-1',
  step: 1,
  participants: [initialParticipant()],
  selectedDate: null,
  selectedTime: null,
  promoCode: null,
  promoDiscount: 0,
  paymentMethod: null,
  notes: '',
  specialRequests: '',
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  isGroupBooking: false,
};

type BookingAction =
  | { type: 'INIT'; payload: { serviceId?: string } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_SERVICE'; payload: { participantId: string; serviceId: string } }
  | { type: 'SET_STAFF'; payload: { participantId: string; staffId: string } }
  | { type: 'TOGGLE_ADDON'; payload: { participantId: string; addonId: string } }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_PROMO'; payload: { code: string; discount: number } }
  | { type: 'CLEAR_PROMO' }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_GUEST_DETAILS'; payload: { guestName?: string; guestEmail?: string; guestPhone?: string; notes?: string; specialRequests?: string } }
  | { type: 'ADD_PARTICIPANT' }
  | { type: 'REMOVE_PARTICIPANT'; payload: string }
  | { type: 'SET_PARTICIPANT_NAME'; payload: { participantId: string; name: string } }
  | { type: 'RESET' };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'INIT': {
      const p = initialParticipant();
      if (action.payload.serviceId) {
        p.serviceId = action.payload.serviceId;
      }
      return { 
        ...initialState, 
        step: action.payload.serviceId ? 2 : 1, // Skip step 1 if service pre-selected
        participants: [p] 
      };
    }
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: Math.max(1, state.step - 1) };
    case 'SET_SERVICE':
      return {
        ...state,
        participants: state.participants.map((p: BookingParticipant) =>
          p.id === action.payload.participantId
            ? { ...p, serviceId: action.payload.serviceId, staffId: null, addonIds: [] }
            : p
        ),
        selectedDate: null,
        selectedTime: null,
      };
    case 'SET_STAFF':
      return {
        ...state,
        participants: state.participants.map((p: BookingParticipant) =>
          p.id === action.payload.participantId
            ? { ...p, staffId: action.payload.staffId }
            : p
        ),
        selectedDate: null,
        selectedTime: null,
      };
    case 'TOGGLE_ADDON': {
      return {
        ...state,
        participants: state.participants.map((p: BookingParticipant) => {
          if (p.id !== action.payload.participantId) return p;
          const has = p.addonIds.includes(action.payload.addonId);
          return { ...p, addonIds: has ? p.addonIds.filter((a: string) => a !== action.payload.addonId) : [...p.addonIds, action.payload.addonId] };
        }),
      };
    }
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedTime: null };
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload };
    case 'SET_PROMO':
      return { ...state, promoCode: action.payload.code, promoDiscount: action.payload.discount };
    case 'CLEAR_PROMO':
      return { ...state, promoCode: null, promoDiscount: 0 };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_GUEST_DETAILS':
      return { ...state, ...action.payload };
    case 'ADD_PARTICIPANT':
      return { ...state, isGroupBooking: true, participants: [...state.participants, initialParticipant()] };
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter((p: BookingParticipant) => p.id !== action.payload),
        isGroupBooking: state.participants.length - 1 > 1,
      };
    case 'SET_PARTICIPANT_NAME':
      return {
        ...state,
        participants: state.participants.map((p: BookingParticipant) =>
          p.id === action.payload.participantId ? { ...p, name: action.payload.name } : p
        ),
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  initBooking: (serviceId?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setService: (participantId: string, serviceId: string) => void;
  setStaff: (participantId: string, staffId: string) => void;
  toggleAddon: (participantId: string, addonId: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const initBooking = useCallback((serviceId?: string) => {
    dispatch({ type: 'INIT', payload: { serviceId } });
  }, []);

  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const setService = useCallback((participantId: string, serviceId: string) => dispatch({ type: 'SET_SERVICE', payload: { participantId, serviceId } }), []);
  const setStaff = useCallback((participantId: string, staffId: string) => dispatch({ type: 'SET_STAFF', payload: { participantId, staffId } }), []);
  const toggleAddon = useCallback((participantId: string, addonId: string) => dispatch({ type: 'TOGGLE_ADDON', payload: { participantId, addonId } }), []);
  const setDate = useCallback((date: string) => dispatch({ type: 'SET_DATE', payload: date }), []);
  const setTime = useCallback((time: string) => dispatch({ type: 'SET_TIME', payload: time }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <BookingContext.Provider value={{ state, dispatch, initBooking, nextStep, prevStep, setService, setStaff, toggleAddon, setDate, setTime, reset }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
