// Google Apps Script for syncing Supabase bookings to Google Sheets
// Deploy this as a web app with "Who has access: Anyone"

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
}

function buildLookup(data) {
  const lookup = {};
  const source = data && typeof data === 'object' ? data : {};

  Object.keys(source).forEach((key) => {
    lookup[normalizeHeader(key)] = source[key];
  });

  if (lookup.payement_mode !== undefined && lookup.payment_mode === undefined) {
    lookup.payment_mode = lookup.payement_mode;
  }
  if (lookup.payment_mode !== undefined && lookup.payement_mode === undefined) {
    lookup.payement_mode = lookup.payment_mode;
  }

  return lookup;
}

function resolveField(dataLookup, headerName) {
  const normalized = normalizeHeader(headerName);
  const aliasMap = {
    booking_id: ['booking_id'],
    policy_holder_name: ['policy_holder_name', 'policyholder_name', 'policyholdername'],
    contact_no: ['contact_no', 'contactnumber', 'mobile_no', 'mobile'],
    email: ['email'],
    number_of_members: ['number_of_members', 'no_of_members', 'members'],
    pincode: ['pincode'],
    city: ['city'],
    district: ['district'],
    state: ['state'],
    country: ['country'],
    payment_date: ['payment_date'],
    payment_month: ['payment_month'],
    effective_date: ['effective_date'],
    next_renewal_date: ['next_renewal_date'],
    month: ['month'],
    insurance_company: ['insurance_company'],
    plan_name: ['plan_name'],
    policy_type: ['policy_type'],
    health_checkup: ['health_checkup'],
    extra_bonus: ['extra_bonus'],
    tenure: ['tenure'],
    premium: ['premium'],
    net_premium: ['net_premium'],
    discount_offer: ['discount_offer'],
    discount_offer_type: ['discount_offer_type'],
    updated_premium: ['updated_premium'],
    employee_name: ['employee_name'],
    team: ['team'],
    previous_company: ['previous_company'],
    business_type: ['business_type'],
    payement_mode: ['payement_mode', 'payment_mode'],
    payment_mode: ['payment_mode', 'payement_mode'],
    assistant_team: ['assistant_team'],
    relationship_manager: ['relationship_manager'],
    agent_code: ['agent_code'],
    proposal_no: ['proposal_no'],
    grade: ['grade'],
    lead_source: ['lead_source'],
    payment_proof: ['payment_proof'],
    created_at: ['created_at'],
    sync: ['sync']
  };

  const candidates = aliasMap[normalized] || [normalized];
  for (const candidate of candidates) {
    if (dataLookup[candidate] !== undefined) {
      return dataLookup[candidate];
    }
  }

  return '';
}

function formatDateAsText(value) {
  if (!value) return '';

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[1].padStart(2, '0')}/${slashMatch[2].padStart(2, '0')}/${slashMatch[3]}`;
  }

  return text;
}

function doPost(e) {
  try {
    const payload = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const data = Array.isArray(payload) ? (payload[0] || {}) : payload;

    const spreadsheetId = '1qzxbyavzNWD9x-hG5y6cNFZlMEMyubOR-JAN5-spWiA';
    const sheetName = 'supabase_response';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: ' + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const defaultHeaders = [
      'booking_id', 'policy_holder_name', 'contact_no', 'email', 'number_of_members', 'pincode', 'city', 'district', 'state', 'country',
      'payment_date', 'payment_month', 'effective_date', 'next_renewal_date', 'month', 'insurance_company', 'plan_name', 'policy_type',
      'health_checkup', 'extra_bonus', 'tenure', 'premium', 'net_premium', 'discount_offer', 'discount_offer_type', 'updated_premium',
      'employee_name', 'team', 'previous_company', 'business_type', 'payement_mode', 'assistant_team', 'relationship_manager', 'agent_code',
      'proposal_no', 'grade', 'lead_source', 'payment_proof', 'created_at', 'sync'
    ];

    const headerRange = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), defaultHeaders.length));
    const sheetHeaders = headerRange.getValues()[0] || [];
    const headers = sheetHeaders.some((header) => String(header || '').trim())
      ? sheetHeaders.map((header) => String(header || '').trim())
      : defaultHeaders;

    const dataLookup = buildLookup(data);
    const rowData = headers.map((header) => {
      const value = resolveField(dataLookup, header);
      const normalized = normalizeHeader(header);

      if (['payment_date', 'effective_date', 'next_renewal_date', 'created_at'].includes(normalized)) {
        return formatDateAsText(value);
      }

      return value === undefined || value === null ? '' : value;
    });

    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;

    headers.forEach((header, index) => {
      const normalized = normalizeHeader(header);
      if (['payment_date', 'effective_date', 'next_renewal_date', 'created_at'].includes(normalized)) {
        sheet.getRange(nextRow, index + 1).setNumberFormat('@');
      }
    });

    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    sheet.autoResizeColumns(1, rowData.length);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Row added successfully',
      row: nextRow,
      headers: headers
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error && error.toString ? error.toString() : String(error)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: 'Supabase to Google Sheets Sync is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
