/**
 * Main Application Logic for SPPD App
 */

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    // Setup navigation
    setupNavigation();

    // Setup form handlers
    setupFormHandlers();

    // Load settings
    loadSettings();

    // Load initial data
    refreshDashboard();

    // Setup input handlers for lumpsum calculation
    setupLumpsumCalculation();

    // Set default dates
    setDefaultDates();
}

/**
 * Setup navigation handlers
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const tabId = this.dataset.tab;

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Update active tab
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');

            // Refresh data when switching tabs
            if (tabId === 'dashboard') {
                refreshDashboard();
            } else if (tabId === 'lumpsum' || tabId === 'kuitansi') {
                populateSPPDDropdowns();
            }
        });
    });
}

/**
 * Setup form submission handlers
 */
function setupFormHandlers() {
    // SPPD Form
    document.getElementById('sppd-form').addEventListener('submit', function (e) {
        e.preventDefault();
        saveSPPDForm();
    });

    // Lumpsum Form
    document.getElementById('lumpsum-form').addEventListener('submit', function (e) {
        e.preventDefault();
        saveLumpsumForm();
    });

    // Kuitansi Form
    document.getElementById('kuitansi-form').addEventListener('submit', function (e) {
        e.preventDefault();
        saveKuitansiForm();
    });

    // Lumpsum SPPD selection
    document.getElementById('lumpsum-sppd').addEventListener('change', function () {
        const sppdId = this.value;
        if (sppdId) {
            const sppd = StorageManager.getSPPDById(sppdId);
            if (sppd) {
                showSPPDInfo(sppd);
                autoFillLumpsumDays(sppd);
            }
        } else {
            document.getElementById('lumpsum-sppd-info').style.display = 'none';
        }
    });
}

/**
 * Setup lumpsum calculation handlers
 */
function setupLumpsumCalculation() {
    const inputs = ['lumpsum-hari', 'lumpsum-uang-harian', 'lumpsum-transport',
        'lumpsum-penginapan', 'lumpsum-malam', 'lumpsum-representasi', 'lumpsum-lainnya'];

    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', hitungLumpsum);
    });
}

/**
 * Set default dates to today
 */
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('sppd-tanggal').value = today;
    document.getElementById('sppd-tgl-berangkat').value = today;
    document.getElementById('kuitansi-tanggal').value = today;

    // Set filter to current month
    const currentMonth = today.substring(0, 7);
    document.getElementById('filter-bulan').value = currentMonth;
}

/**
 * Save SPPD form data
 */
function saveSPPDForm() {
    const sppd = {
        nomor: document.getElementById('sppd-nomor').value,
        tanggal: document.getElementById('sppd-tanggal').value,
        nama: document.getElementById('sppd-nama').value,
        nip: document.getElementById('sppd-nip').value,
        pangkat: document.getElementById('sppd-pangkat').value,
        jabatan: document.getElementById('sppd-jabatan').value,
        maksud: document.getElementById('sppd-maksud').value,
        asal: document.getElementById('sppd-asal').value,
        tujuan: document.getElementById('sppd-tujuan').value,
        tglBerangkat: document.getElementById('sppd-tgl-berangkat').value,
        tglKembali: document.getElementById('sppd-tgl-kembali').value,
        transportasi: document.getElementById('sppd-transportasi').value,
        anggaran: document.getElementById('sppd-anggaran').value
    };

    const result = StorageManager.saveSPPD(sppd);

    if (result) {
        showToast('SPPD berhasil disimpan!', 'success');
        resetForm('sppd-form');
        setDefaultDates();
    } else {
        showToast('Gagal menyimpan SPPD!', 'error');
    }
}

/**
 * Calculate lumpsum total
 */
function hitungLumpsum() {
    const hari = parseInt(document.getElementById('lumpsum-hari').value) || 0;
    const uangHarian = parseFloat(document.getElementById('lumpsum-uang-harian').value) || 0;
    const transport = parseFloat(document.getElementById('lumpsum-transport').value) || 0;
    const penginapan = parseFloat(document.getElementById('lumpsum-penginapan').value) || 0;
    const malam = parseInt(document.getElementById('lumpsum-malam').value) || 0;
    const representasi = parseFloat(document.getElementById('lumpsum-representasi').value) || 0;
    const lainnya = parseFloat(document.getElementById('lumpsum-lainnya').value) || 0;

    const total = (hari * uangHarian) + transport + (penginapan * malam) + representasi + lainnya;

    document.getElementById('lumpsum-total').textContent = formatRupiah(total);

    return total;
}

/**
 * Save lumpsum form data
 */
function saveLumpsumForm() {
    const sppdId = document.getElementById('lumpsum-sppd').value;

    if (!sppdId) {
        showToast('Pilih SPPD terlebih dahulu!', 'error');
        return;
    }

    const lumpsum = {
        sppdId: sppdId,
        hari: parseInt(document.getElementById('lumpsum-hari').value) || 0,
        uangHarian: parseFloat(document.getElementById('lumpsum-uang-harian').value) || 0,
        transport: parseFloat(document.getElementById('lumpsum-transport').value) || 0,
        penginapan: parseFloat(document.getElementById('lumpsum-penginapan').value) || 0,
        malam: parseInt(document.getElementById('lumpsum-malam').value) || 0,
        representasi: parseFloat(document.getElementById('lumpsum-representasi').value) || 0,
        lainnya: parseFloat(document.getElementById('lumpsum-lainnya').value) || 0,
        total: hitungLumpsum()
    };

    const result = StorageManager.saveLumpsum(lumpsum);

    if (result) {
        showToast('Lumpsum berhasil disimpan!', 'success');
        resetForm('lumpsum-form');
        document.getElementById('lumpsum-sppd-info').style.display = 'none';
        document.getElementById('lumpsum-total').textContent = 'Rp 0';
    } else {
        showToast('Gagal menyimpan Lumpsum!', 'error');
    }
}

/**
 * Save kuitansi form data
 */
function saveKuitansiForm() {
    const kuitansi = {
        nomor: document.getElementById('kuitansi-nomor').value,
        tanggal: document.getElementById('kuitansi-tanggal').value,
        sppdId: document.getElementById('kuitansi-sppd').value || null,
        jumlah: parseFloat(document.getElementById('kuitansi-jumlah').value) || 0,
        keperluan: document.getElementById('kuitansi-keperluan').value,
        penerima: document.getElementById('kuitansi-penerima').value,
        jabatanPenerima: document.getElementById('kuitansi-jabatan-penerima').value
    };

    const result = StorageManager.saveKuitansi(kuitansi);

    if (result) {
        showToast('Kuitansi berhasil disimpan!', 'success');
        resetForm('kuitansi-form');
        setDefaultDates();
    } else {
        showToast('Gagal menyimpan Kuitansi!', 'error');
    }
}

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
    const stats = StorageManager.getStats();

    document.getElementById('total-sppd').textContent = stats.totalSPPD;
    document.getElementById('total-lumpsum').textContent = formatRupiah(stats.totalLumpsum);
    document.getElementById('total-kuitansi').textContent = stats.totalKuitansi;

    loadSPPDTable();
}

/**
 * Load SPPD table
 */
function loadSPPDTable(filterMonth = null) {
    const tbody = document.getElementById('sppd-table-body');
    let sppdList = StorageManager.getAllSPPD();

    // Apply filter if specified
    if (filterMonth) {
        sppdList = sppdList.filter(sppd => {
            const sppdMonth = sppd.tanggal.substring(0, 7);
            return sppdMonth === filterMonth;
        });
    }

    if (sppdList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <p>Belum ada data SPPD</p>
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date descending
    sppdList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    tbody.innerHTML = sppdList.map((sppd, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${sppd.nomor}</td>
            <td>${sppd.nama}</td>
            <td>${sppd.tujuan}</td>
            <td>${formatDate(sppd.tglBerangkat)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="previewSPPD('${sppd.id}')" title="Cetak SPPD">📄</button>
                    <button class="btn btn-sm btn-outline" onclick="previewLumpsum('${sppd.id}')" title="Cetak Lumpsum">💰</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSPPD('${sppd.id}')" title="Hapus">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter data by month
 */
function filterData() {
    const filterMonth = document.getElementById('filter-bulan').value;
    loadSPPDTable(filterMonth || null);
}

/**
 * Populate SPPD dropdowns
 */
function populateSPPDDropdowns() {
    const sppdList = StorageManager.getAllSPPD();

    const lumpsumSelect = document.getElementById('lumpsum-sppd');
    const kuitansiSelect = document.getElementById('kuitansi-sppd');

    // Clear existing options except first
    lumpsumSelect.innerHTML = '<option value="">Pilih SPPD...</option>';
    kuitansiSelect.innerHTML = '<option value="">Tidak terkait SPPD</option>';

    sppdList.forEach(sppd => {
        const option = `<option value="${sppd.id}">${sppd.nomor} - ${sppd.nama}</option>`;
        lumpsumSelect.innerHTML += option;
        kuitansiSelect.innerHTML += option;
    });
}

/**
 * Show SPPD info in lumpsum form
 */
function showSPPDInfo(sppd) {
    const infoDiv = document.getElementById('lumpsum-sppd-info');
    const detailDiv = document.getElementById('lumpsum-sppd-detail');

    detailDiv.innerHTML = `
        <p><strong>Nama:</strong> ${sppd.nama}</p>
        <p><strong>Tujuan:</strong> ${sppd.tujuan}</p>
        <p><strong>Tanggal:</strong> ${formatDate(sppd.tglBerangkat)} s/d ${formatDate(sppd.tglKembali)}</p>
    `;

    infoDiv.style.display = 'block';
}

/**
 * Auto-fill lumpsum days based on SPPD
 */
function autoFillLumpsumDays(sppd) {
    const startDate = new Date(sppd.tglBerangkat);
    const endDate = new Date(sppd.tglKembali);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    document.getElementById('lumpsum-hari').value = diffDays;
    document.getElementById('lumpsum-malam').value = Math.max(0, diffDays - 1);

    hitungLumpsum();
}

/**
 * Preview and print SPPD
 */
function previewSPPD(id) {
    PrintManager.showPreview('sppd', id);
}

/**
 * Preview and print Lumpsum
 */
function previewLumpsum(sppdId) {
    const lumpsum = StorageManager.getLumpsumBySPPD(sppdId);

    if (!lumpsum) {
        showToast('Data lumpsum belum ada. Silakan input terlebih dahulu.', 'error');
        // Switch to lumpsum tab
        document.querySelector('[data-tab="lumpsum"]').click();
        populateSPPDDropdowns();
        document.getElementById('lumpsum-sppd').value = sppdId;
        const sppd = StorageManager.getSPPDById(sppdId);
        if (sppd) {
            showSPPDInfo(sppd);
            autoFillLumpsumDays(sppd);
        }
        return;
    }

    PrintManager.showPreview('lumpsum', lumpsum.id);
}

/**
 * Delete SPPD
 */
function deleteSPPD(id) {
    if (confirm('Hapus SPPD ini beserta data lumpsum terkait?')) {
        StorageManager.deleteSPPD(id);
        refreshDashboard();
        showToast('SPPD berhasil dihapus!', 'success');
    }
}

/**
 * Close print modal
 */
function closePrintModal() {
    document.getElementById('print-modal').classList.remove('active');
}

/**
 * Print document
 */
function cetakDokumen() {
    PrintManager.print();
}

/**
 * Save settings
 */
function simpanPengaturan() {
    const settings = {
        instansi: document.getElementById('setting-instansi').value,
        alamat: document.getElementById('setting-alamat').value,
        kota: document.getElementById('setting-kota').value,
        ttdNama: document.getElementById('setting-ttd-nama').value,
        ttdNip: document.getElementById('setting-ttd-nip').value,
        ttdJabatan: document.getElementById('setting-ttd-jabatan').value
    };

    if (StorageManager.saveSettings(settings)) {
        showToast('Pengaturan berhasil disimpan!', 'success');
    } else {
        showToast('Gagal menyimpan pengaturan!', 'error');
    }
}

/**
 * Load settings
 */
function loadSettings() {
    const settings = StorageManager.getSettings();

    document.getElementById('setting-instansi').value = settings.instansi || '';
    document.getElementById('setting-alamat').value = settings.alamat || '';
    document.getElementById('setting-kota').value = settings.kota || '';
    document.getElementById('setting-ttd-nama').value = settings.ttdNama || '';
    document.getElementById('setting-ttd-nip').value = settings.ttdNip || '';
    document.getElementById('setting-ttd-jabatan').value = settings.ttdJabatan || '';
}

/**
 * Export data
 */
function eksporData() {
    const data = StorageManager.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sppd_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor!', 'success');
}

/**
 * Import data
 */
function imporData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (StorageManager.importAll(data)) {
                showToast('Data berhasil diimpor!', 'success');
                refreshDashboard();
                loadSettings();
            } else {
                showToast('Gagal mengimpor data!', 'error');
            }
        } catch (error) {
            showToast('Format file tidak valid!', 'error');
        }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
}

/**
 * Delete all data
 */
function hapusSemua() {
    if (confirm('PERINGATAN: Semua data akan dihapus permanen. Lanjutkan?')) {
        if (confirm('Apakah Anda yakin? Data tidak dapat dikembalikan!')) {
            StorageManager.clearAll();
            refreshDashboard();
            loadSettings();
            showToast('Semua data berhasil dihapus!', 'success');
        }
    }
}

/**
 * Reset form
 */
function resetForm(formId) {
    document.getElementById(formId).reset();
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format currency
 */
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
document.getElementById('print-modal').addEventListener('click', function (e) {
    if (e.target === this) {
        closePrintModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closePrintModal();
    }
});
