/**
 * Session Management Utility
 * Handles session creation, updates, and cleanup for the payment wizard
 */

export interface SessionData {
  sessionId: string;
  createdAt: number;
  lastUpdated: number;
  currentStep: number;
  currentStepSlug: string;
  showWelcome: boolean;
  hideGreeting: boolean;
  showButtons: boolean;
  showBusinessTypeSelect: boolean;
  showCompanySelect: boolean;
  showProposalWidget: boolean;
  disabledFields: string[];
  locationFetched: boolean;
  formData: any;
}

const SESSION_STORAGE_KEY = 'paymentWizardSession';
const SESSION_ID_KEY = 'paymentWizardSessionId';

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new session
 */
export function createSession(formData: any = {}): SessionData {
  const sessionId = generateSessionId();
  const now = Date.now();
  
  // Set default values for form data
  const defaultFormData = {
    assistantTeam: 'None',
    discountOfferType: 'none',
    discountOffer: '0',
    ...formData
  };
  
  const sessionData: SessionData = {
    sessionId,
    createdAt: now,
    lastUpdated: now,
    currentStep: 1,
    currentStepSlug: 'insurer-information',
    showWelcome: true,
    hideGreeting: false,
    showButtons: false,
    showBusinessTypeSelect: false,
    showCompanySelect: false,
    showProposalWidget: false,
    disabledFields: [],
    locationFetched: false,
    formData: defaultFormData
  };
  
  // Store session ID separately to track current active session
  sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  
  return sessionData;
}

/**
 * Get current session data
 */
export function getSession(): SessionData | null {
  const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
}

/**
 * Update current session
 */
export function updateSession(updates: Partial<SessionData>): SessionData | null {
  const currentSession = getSession();
  if (!currentSession) return null;
  
  const updatedSession: SessionData = {
    ...currentSession,
    ...updates,
    lastUpdated: Date.now()
  };
  
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
  return updatedSession;
}

/**
 * Clear current session (drop session)
 */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_ID_KEY);
}

/**
 * Check if a session exists
 */
export function hasSession(): boolean {
  return sessionStorage.getItem(SESSION_STORAGE_KEY) !== null;
}

/**
 * Get current session ID
 */
export function getSessionId(): string | null {
  return sessionStorage.getItem(SESSION_ID_KEY);
}

/**
 * Reset session and create a new one
 */
export function resetSession(formData: any = {}): SessionData {
  clearSession();
  return createSession(formData);
}

/**
 * Check if session is stale (older than specified hours)
 */
export function isSessionStale(maxAgeHours: number = 24): boolean {
  const session = getSession();
  if (!session) return true;
  
  const ageHours = (Date.now() - session.createdAt) / (1000 * 60 * 60);
  return ageHours > maxAgeHours;
}
