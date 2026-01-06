/**
 * Print Manager for SPPD Application
 * Handles document generation and printing
 */

const PrintManager = {
    /**
     * Get settings for header
     */
    getHeaderSettings() {
        return StorageManager.getSettings();
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format date to Indonesian format
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    },

    /**
     * Number to words (Terbilang)
     */
    terbilang(angka) {
        const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

        if (angka < 12) {
            return bilangan[angka];
        } else if (angka < 20) {
            return this.terbilang(angka - 10) + ' Belas';
        } else if (angka < 100) {
            return this.terbilang(Math.floor(angka / 10)) + ' Puluh ' + this.terbilang(angka % 10);
        } else if (angka < 200) {
            return 'Seratus ' + this.terbilang(angka - 100);
        } else if (angka < 1000) {
            return this.terbilang(Math.floor(angka / 100)) + ' Ratus ' + this.terbilang(angka % 100);
        } else if (angka < 2000) {
            return 'Seribu ' + this.terbilang(angka - 1000);
        } else if (angka < 1000000) {
            return this.terbilang(Math.floor(angka / 1000)) + ' Ribu ' + this.terbilang(angka % 1000);
        } else if (angka < 1000000000) {
            return this.terbilang(Math.floor(angka / 1000000)) + ' Juta ' + this.terbilang(angka % 1000000);
        } else if (angka < 1000000000000) {
            return this.terbilang(Math.floor(angka / 1000000000)) + ' Miliar ' + this.terbilang(angka % 1000000000);
        }
        return angka.toString();
    },

    /**
     * Generate SPPD document HTML
     */
    generateSPPD(sppd) {
        const settings = this.getHeaderSettings();

        return `
            <div class="print-preview-content">
                <div class="print-header">
                    <h1>${settings.instansi}</h1>
                    <p>${settings.alamat}</p>
                </div>
                
                <div class="print-title">
                    <h3>SURAT PERINTAH PERJALANAN DINAS</h3>
                    <p>Nomor: ${sppd.nomor}</p>
                </div>
                
                <div class="print-columns">
                    <div class="print-column">
                        <table>
                            <tr>
                                <td class="label">1. Pejabat yang memberi perintah</td>
                                <td>: ${settings.ttdJabatan || '-'}</td>
                            </tr>
                            <tr>
                                <td class="label">2. Nama Pegawai yang diperintah</td>
                                <td>: ${sppd.nama}</td>
                            </tr>
                            <tr>
                                <td class="label">3. NIP</td>
                                <td>: ${sppd.nip || '-'}</td>
                            </tr>
                            <tr>
                                <td class="label">4. Pangkat/Golongan</td>
                                <td>: ${sppd.pangkat || '-'}</td>
                            </tr>
                            <tr>
                                <td class="label">5. Jabatan</td>
                                <td>: ${sppd.jabatan || '-'}</td>
                            </tr>
                            <tr>
                                <td class="label">6. Maksud Perjalanan Dinas</td>
                                <td>: ${sppd.maksud}</td>
                            </tr>
                            <tr>
                                <td class="label">7. Alat angkutan yang digunakan</td>
                                <td>: ${sppd.transportasi || '-'}</td>
                            </tr>
                            <tr>
                                <td class="label">8. Tempat berangkat</td>
                                <td>: ${sppd.asal}</td>
                            </tr>
                            <tr>
                                <td class="label">9. Tempat tujuan</td>
                                <td>: ${sppd.tujuan}</td>
                            </tr>
                            <tr>
                                <td class="label">10. Tanggal berangkat</td>
                                <td>: ${this.formatDate(sppd.tglBerangkat)}</td>
                            </tr>
                            <tr>
                                <td class="label">11. Tanggal harus kembali</td>
                                <td>: ${this.formatDate(sppd.tglKembali)}</td>
                            </tr>
                            <tr>
                                <td class="label">12. Pengikut</td>
                                <td>: -</td>
                            </tr>
                            <tr>
                                <td class="label">13. Pembebanan Anggaran</td>
                                <td>: ${sppd.anggaran || '-'}</td>
                            </tr>
                            <tr>
                                <td class="label">14. Keterangan lain-lain</td>
                                <td>: -</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <p style="margin-top: 20px;">Dikeluarkan di: ${settings.kota}</p>
                <p>Pada tanggal: ${this.formatDate(sppd.tanggal)}</p>
                
                <div class="print-signature">
                    <div class="signature-block"></div>
                    <div class="signature-block">
                        <p>${settings.ttdJabatan || 'Kepala'}</p>
                        <div class="signature-space"></div>
                        <p class="signature-name">${settings.ttdNama || '........................'}</p>
                        <p>NIP. ${settings.ttdNip || '........................'}</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate Lumpsum document HTML
     */
    generateLumpsum(lumpsum, sppd) {
        const settings = this.getHeaderSettings();

        const uangHarianTotal = (parseFloat(lumpsum.uangHarian) || 0) * (parseInt(lumpsum.hari) || 0);
        const penginapanTotal = (parseFloat(lumpsum.penginapan) || 0) * (parseInt(lumpsum.malam) || 0);
        const transport = parseFloat(lumpsum.transport) || 0;
        const representasi = parseFloat(lumpsum.representasi) || 0;
        const lainnya = parseFloat(lumpsum.lainnya) || 0;
        const total = uangHarianTotal + penginapanTotal + transport + representasi + lainnya;

        return `
            <div class="print-preview-content">
                <div class="print-header">
                    <h1>${settings.instansi}</h1>
                    <p>${settings.alamat}</p>
                </div>
                
                <div class="print-title">
                    <h3>RINCIAN BIAYA PERJALANAN DINAS</h3>
                    <p>SPPD Nomor: ${sppd ? sppd.nomor : '-'}</p>
                </div>
                
                ${sppd ? `
                <div style="margin-bottom: 20px;">
                    <p><strong>Nama:</strong> ${sppd.nama}</p>
                    <p><strong>NIP:</strong> ${sppd.nip || '-'}</p>
                    <p><strong>Tujuan:</strong> ${sppd.tujuan}</p>
                    <p><strong>Tanggal:</strong> ${this.formatDate(sppd.tglBerangkat)} s/d ${this.formatDate(sppd.tglKembali)}</p>
                </div>
                ` : ''}
                
                <table class="print-table">
                    <thead>
                        <tr>
                            <th class="number">No</th>
                            <th>Uraian</th>
                            <th>Qty</th>
                            <th class="amount">Satuan (Rp)</th>
                            <th class="amount">Jumlah (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="number">1</td>
                            <td>Uang Harian</td>
                            <td>${lumpsum.hari} hari</td>
                            <td class="amount">${this.formatCurrency(lumpsum.uangHarian)}</td>
                            <td class="amount">${this.formatCurrency(uangHarianTotal)}</td>
                        </tr>
                        <tr>
                            <td class="number">2</td>
                            <td>Biaya Transport</td>
                            <td>1 paket</td>
                            <td class="amount">${this.formatCurrency(transport)}</td>
                            <td class="amount">${this.formatCurrency(transport)}</td>
                        </tr>
                        <tr>
                            <td class="number">3</td>
                            <td>Biaya Penginapan</td>
                            <td>${lumpsum.malam} malam</td>
                            <td class="amount">${this.formatCurrency(lumpsum.penginapan)}</td>
                            <td class="amount">${this.formatCurrency(penginapanTotal)}</td>
                        </tr>
                        <tr>
                            <td class="number">4</td>
                            <td>Uang Representasi</td>
                            <td>1 kali</td>
                            <td class="amount">${this.formatCurrency(representasi)}</td>
                            <td class="amount">${this.formatCurrency(representasi)}</td>
                        </tr>
                        <tr>
                            <td class="number">5</td>
                            <td>Biaya Lain-lain</td>
                            <td>1 paket</td>
                            <td class="amount">${this.formatCurrency(lainnya)}</td>
                            <td class="amount">${this.formatCurrency(lainnya)}</td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td colspan="4" style="text-align: right;">TOTAL</td>
                            <td class="amount">${this.formatCurrency(total)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <p class="terbilang"><strong>Terbilang:</strong> ${this.terbilang(total).trim()} Rupiah</p>
                
                <div class="print-signature">
                    <div class="signature-block">
                        <p>Mengetahui,</p>
                        <p>${settings.ttdJabatan || 'Kepala'}</p>
                        <div class="signature-space"></div>
                        <p class="signature-name">${settings.ttdNama || '........................'}</p>
                        <p>NIP. ${settings.ttdNip || '........................'}</p>
                    </div>
                    <div class="signature-block">
                        <p>Yang Menerima,</p>
                        <p>&nbsp;</p>
                        <div class="signature-space"></div>
                        <p class="signature-name">${sppd ? sppd.nama : '........................'}</p>
                        <p>NIP. ${sppd ? (sppd.nip || '........................') : '........................'}</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate Kuitansi document HTML
     */
    generateKuitansi(kuitansi, sppd = null) {
        const settings = this.getHeaderSettings();
        const jumlah = parseFloat(kuitansi.jumlah) || 0;

        return `
            <div class="print-preview-content">
                <div class="print-receipt">
                    <div class="receipt-header">
                        <h3>KUITANSI</h3>
                        <p>No: ${kuitansi.nomor}</p>
                    </div>
                    
                    <div class="receipt-body">
                        <div class="receipt-row">
                            <span class="receipt-label">Sudah Terima dari</span>
                            <span class="receipt-separator">:</span>
                            <span class="receipt-value">${settings.instansi}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Uang Sejumlah</span>
                            <span class="receipt-separator">:</span>
                            <span class="receipt-value">${this.terbilang(jumlah).trim()} Rupiah</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">Untuk Pembayaran</span>
                            <span class="receipt-separator">:</span>
                            <span class="receipt-value">${kuitansi.keperluan}</span>
                        </div>
                        ${sppd ? `
                        <div class="receipt-row">
                            <span class="receipt-label">SPPD Nomor</span>
                            <span class="receipt-separator">:</span>
                            <span class="receipt-value">${sppd.nomor}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="receipt-amount">
                        ${this.formatCurrency(jumlah)}
                    </div>
                    
                    <div class="print-signature" style="margin-top: 30px;">
                        <div class="signature-block">
                            <p>Mengetahui,</p>
                            <p>${settings.ttdJabatan || 'Kepala'}</p>
                            <div class="signature-space"></div>
                            <p class="signature-name">${settings.ttdNama || '........................'}</p>
                            <p>NIP. ${settings.ttdNip || '........................'}</p>
                        </div>
                        <div class="signature-block">
                            <p>${settings.kota}, ${this.formatDate(kuitansi.tanggal)}</p>
                            <p>Yang Menerima,</p>
                            <div class="signature-space"></div>
                            <p class="signature-name">${kuitansi.penerima}</p>
                            <p>${kuitansi.jabatanPenerima || ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show print preview modal
     */
    showPreview(type, id) {
        let content = '';

        switch (type) {
            case 'sppd':
                const sppd = StorageManager.getSPPDById(id);
                if (sppd) {
                    content = this.generateSPPD(sppd);
                }
                break;

            case 'lumpsum':
                const lumpsum = StorageManager.getById(StorageManager.KEYS.LUMPSUM, id);
                if (lumpsum) {
                    const sppdForLumpsum = StorageManager.getSPPDById(lumpsum.sppdId);
                    content = this.generateLumpsum(lumpsum, sppdForLumpsum);
                }
                break;

            case 'kuitansi':
                const kuitansi = StorageManager.getById(StorageManager.KEYS.KUITANSI, id);
                if (kuitansi) {
                    const sppdForKuitansi = kuitansi.sppdId ? StorageManager.getSPPDById(kuitansi.sppdId) : null;
                    content = this.generateKuitansi(kuitansi, sppdForKuitansi);
                }
                break;
        }

        if (content) {
            document.getElementById('print-content').innerHTML = content;
            document.getElementById('print-modal').classList.add('active');
        }
    },

    /**
     * Print document
     */
    print() {
        const printContent = document.getElementById('print-content').innerHTML;
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Dokumen</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 12pt;
                        line-height: 1.5;
                        margin: 0;
                        padding: 20px;
                    }
                    .print-preview-content {
                        max-width: 21cm;
                        margin: 0 auto;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 3px double black;
                    }
                    .print-header h1 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin: 0 0 5px 0;
                        text-transform: uppercase;
                    }
                    .print-header p {
                        font-size: 10pt;
                        margin: 2px 0;
                    }
                    .print-title {
                        text-align: center;
                        margin: 25px 0;
                    }
                    .print-title h3 {
                        font-size: 14pt;
                        font-weight: bold;
                        text-decoration: underline;
                        margin: 0 0 5px 0;
                    }
                    .print-title p {
                        margin: 0;
                    }
                    .print-columns {
                        margin: 15px 0;
                    }
                    .print-column table {
                        width: 100%;
                    }
                    .print-column td {
                        padding: 4px 6px;
                        vertical-align: top;
                    }
                    .print-column .label {
                        width: 280px;
                    }
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .print-table th,
                    .print-table td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                    .print-table th {
                        background: #f0f0f0;
                        font-weight: bold;
                    }
                    .print-table .number {
                        text-align: center;
                        width: 40px;
                    }
                    .print-table .amount {
                        text-align: right;
                    }
                    .print-signature {
                        margin-top: 40px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .signature-block {
                        text-align: center;
                        width: 45%;
                    }
                    .signature-block p {
                        margin: 3px 0;
                    }
                    .signature-space {
                        height: 80px;
                    }
                    .signature-name {
                        font-weight: bold;
                        text-decoration: underline;
                    }
                    .print-receipt {
                        border: 2px solid black;
                        padding: 25px;
                        margin: 20px 0;
                    }
                    .receipt-header {
                        text-align: center;
                        margin-bottom: 25px;
                    }
                    .receipt-header h3 {
                        font-size: 18pt;
                        font-weight: bold;
                        letter-spacing: 8px;
                        margin: 0 0 10px 0;
                    }
                    .receipt-header p {
                        margin: 0;
                    }
                    .receipt-row {
                        display: flex;
                        margin: 10px 0;
                    }
                    .receipt-label {
                        width: 160px;
                        flex-shrink: 0;
                    }
                    .receipt-separator {
                        width: 25px;
                        text-align: center;
                    }
                    .receipt-value {
                        flex: 1;
                        border-bottom: 1px dotted black;
                        padding-left: 5px;
                    }
                    .receipt-amount {
                        font-size: 16pt;
                        font-weight: bold;
                        text-align: center;
                        margin: 25px 0;
                        padding: 12px;
                        border: 2px solid black;
                    }
                    .terbilang {
                        font-style: italic;
                        margin-top: 10px;
                    }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="print-area">
                    ${printContent}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    }
};
