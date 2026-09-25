export interface GoogleSheetRowPayload {
  [key: string]: string | number | boolean | null | undefined;
}

export const syncBookingToGoogleSheet = async (payload: GoogleSheetRowPayload) => {
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.warn('VITE_GOOGLE_SCRIPT_URL is not configured. Skipping Google Sheets sync.');
    return { success: false, skipped: true, reason: 'Missing script URL' };
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    try {
      const result = responseText ? JSON.parse(responseText) : { success: false };
      return { success: response.ok, ...result };
    } catch {
      return { success: response.ok, raw: responseText };
    }
  } catch (error) {
    console.error('Google Sheets sync failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
