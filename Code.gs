/**
 * SPPD App - Google Apps Script Backend
 */

// --- Configuration ---
const SHEET_NAMES = {
  SPPD: 'SPPD',
  LUMPSUM: 'Lumpsum',
  KUITANSI: 'Kuitansi',
  SETTINGS: 'Pengaturan'
};

// --- Web App Serving ---

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Aplikasi SPPD')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- Database Operations (Sheets) ---

function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Initialize headers if new
    const headers = getHeaders(sheetName);
    if (headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function getHeaders(sheetName) {
  switch (sheetName) {
    case SHEET_NAMES.SPPD:
      return ['id', 'nomor', 'tanggal', 'nama', 'nip', 'pangkat', 'jabatan', 'maksud', 'asal', 'tujuan', 'tglBerangkat', 'tglKembali', 'transportasi', 'anggaran', 'createdAt'];
    case SHEET_NAMES.LUMPSUM:
      return ['id', 'sppdId', 'hari', 'uangHarian', 'transport', 'penginapan', 'malam', 'representasi', 'lainnya', 'total', 'createdAt'];
    case SHEET_NAMES.KUITANSI:
      return ['id', 'nomor', 'tanggal', 'sppdId', 'jumlah', 'keperluan', 'penerima', 'jabatanPenerima', 'createdAt'];
    case SHEET_NAMES.SETTINGS:
      return ['key', 'value'];
    default:
      return [];
  }
}

function getData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove headers
  
  if (sheetName === SHEET_NAMES.SETTINGS) {
    const settings = {};
    data.forEach(row => {
      if (row[0]) settings[row[0]] = row[1];
    });
    return settings;
  }
  
  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function saveData(sheetName, dataObj) {
  const sheet = getSheet(sheetName);
  
  if (sheetName === SHEET_NAMES.SETTINGS) {
    // Handle settings differently (Key-Value pairs)
    const currentData = sheet.getDataRange().getValues();
    // Clear existing except header
    if (currentData.length > 1) {
      sheet.getRange(2, 1, currentData.length - 1, 2).clearContent();
    }
    
    const rows = Object.entries(dataObj).map(([key, value]) => [key, value]);
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    }
    return true;
  }
  
  const headers = getHeaders(sheetName);
  const rowData = headers.map(header => {
    // Handle dates
    if (header.includes('tgl') || header === 'tanggal' || header === 'createdAt') {
      return dataObj[header] ? new Date(dataObj[header]) : '';
    }
    return dataObj[header] || '';
  });
  
  // Check if update or insert
  if (dataObj.id) {
    const data = sheet.getDataRange().getValues();
    const idIndex = headers.indexOf('id');
    const rowIndex = data.findIndex(row => row[idIndex] === dataObj.id);
    
    if (rowIndex !== -1) {
      // Update
      sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
      return dataObj;
    }
  }
  
  // Insert
  if (!dataObj.id) {
    dataObj.id = Utilities.getUuid();
    rowData[headers.indexOf('id')] = dataObj.id;
  }
  if (!dataObj.createdAt) {
    dataObj.createdAt = new Date();
    rowData[headers.indexOf('createdAt')] = dataObj.createdAt;
  }
  
  sheet.appendRow(rowData);
  return dataObj;
}

function deleteData(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// --- Document Generation ---

function generateDocument(type, id) {
  const settings = getData(SHEET_NAMES.SETTINGS);
  let templateId, data;
  
  if (type === 'sppd') {
    templateId = settings.template_sppd_id;
    const allSppd = getData(SHEET_NAMES.SPPD);
    data = allSppd.find(item => item.id === id);
    if (!data) throw new Error('Data SPPD tidak ditemukan');
    
    // Format dates
    data.TGL_BERANGKAT = formatDate(data.tglBerangkat);
    data.TGL_KEMBALI = formatDate(data.tglKembali);
    data.TANGGAL = formatDate(data.tanggal);
    
    // Upper case keys for replacement
    Object.keys(data).forEach(key => {
      data[key.toUpperCase()] = data[key];
    });
    
  } else if (type === 'lumpsum') {
    templateId = settings.template_lumpsum_id;
    const allLumpsum = getData(SHEET_NAMES.LUMPSUM);
    const lumpsum = allLumpsum.find(item => item.id === id);
    if (!lumpsum) throw new Error('Data Lumpsum tidak ditemukan');
    
    const allSppd = getData(SHEET_NAMES.SPPD);
    const sppd = allSppd.find(item => item.id === lumpsum.sppdId);
    
    data = { ...lumpsum, ...sppd }; // Merge data
    
    // Format currency
    ['uangHarian', 'transport', 'penginapan', 'representasi', 'lainnya', 'total'].forEach(key => {
      data['TOTAL_' + key.toUpperCase()] = formatRupiah(data[key]); // For single items that are totals
      data[key.toUpperCase()] = formatRupiah(data[key]);
    });
    
    // Calculate subtotals
    data.TOTAL_UANG_HARIAN = formatRupiah(lumpsum.uangHarian * lumpsum.hari);
    data.TOTAL_PENGINAPAN = formatRupiah(lumpsum.penginapan * lumpsum.malam);
    data.TOTAL_SEMUA = formatRupiah(lumpsum.total);
    data.TERBILANG = terbilang(lumpsum.total) + ' Rupiah';
    data.NOMOR_SPPD = sppd.nomor;
    
  } else if (type === 'kuitansi') {
    templateId = settings.template_kuitansi_id;
    const allKuitansi = getData(SHEET_NAMES.KUITANSI);
    data = allKuitansi.find(item => item.id === id);
    if (!data) throw new Error('Data Kuitansi tidak ditemukan');
    
    data.JUMLAH_UANG = formatRupiah(data.jumlah);
    data.TERBILANG = terbilang(data.jumlah) + ' Rupiah';
    data.UNTUK_PEMBAYARAN = data.keperluan;
    data.SUDAH_TERIMA_DARI = settings.instansi || 'Bendahara';
    data.TEMPAT_TANGGAL = (settings.kota || 'Kota') + ', ' + formatDate(data.tanggal);
    data.PENERIMA = data.penerima;
  }
  
  if (!templateId) throw new Error('ID Template belum diatur di Pengaturan');
  
  // Create new doc from template
  const templateFile = DriveApp.getFileById(templateId);
  const newFile = templateFile.makeCopy('Dokumen ' + type.toUpperCase() + ' - ' + (data.nama || data.penerima));
  const doc = DocumentApp.openById(newFile.getId());
  const body = doc.getBody();
  
  // Replace placeholders
  Object.keys(data).forEach(key => {
    body.replaceText('{{' + key + '}}', data[key] || '-');
  });
  
  doc.saveAndClose();
  
  // Return URL
  return newFile.getUrl();
}

// --- Helpers ---

function formatDate(date) {
  if (!date) return '-';
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'dd MMMM yyyy');
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function terbilang(angka) {
  // Simple terbilang implementation or placeholder
  // For production, use a full library
  return String(angka); 
}
