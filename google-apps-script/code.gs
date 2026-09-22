// Google Apps Script for syncing Supabase bookings to Google Sheets
// Deploy this as a web app with "Who has access: Anyone"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Get the spreadsheet and sheet
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
    
    // Prepare the row data
    const rowData = [
      data.booking_id || '',
      data.policy_holder_name || '',
      data.contact_no || '',
      data.email || '',
      data.number_of_members || '',
      data.pincode || '',
      data.city || '',
      data.district || '',
      data.state || '',
      data.country || '',
      data.payment_date || '',
      data.payment_month || '',
      data.effective_date || '',
      data.next_renewal_date || '',
      data.month || '',
      data.insurance_company || '',
      data.plan_name || '',
      data.policy_type || '',
      data.health_checkup || '',
      data.extra_bonus || '',
      data.tenure || '',
      data.premium || '',
      data.net_premium || '',
      data.discount_offer || '',
      data.discount_offer_type || '',
      data.updated_premium || '',
      data.employee_name || '',
      data.team || '',
      data.previous_company || '',
      data.business_type || '',
      data.assistant_team || '',
      data.relationship_manager || '',
      data.agent_code || '',
      data.proposal_no || '',
      data.grade || '',
      data.lead_source || '',
      data.payment_proof || '',
      data.created_at || new Date().toISOString()
    ];
    
    // Find the next empty row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Append the row
    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Format the date columns
    const dateColumns = [12, 13, 14, 15, 37]; // payment_date, effective_date, next_renewal_date, month, created_at (1-indexed)
    dateColumns.forEach(col => {
      if (rowData[col - 1]) {
        // Keep as text format for Google Sheets to display properly
        sheet.getRange(nextRow, col).setNumberFormat('@');
      }
    });
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Row added successfully',
      row: nextRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: 'Supabase to Google Sheets Sync is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
