/**
 * Storage Manager for SPPD Application
 * Handles all LocalStorage operations
 */

const StorageManager = {
    // Storage keys
    KEYS: {
        SPPD: 'sppd_data',
        LUMPSUM: 'lumpsum_data',
        KUITANSI: 'kuitansi_data',
        SETTINGS: 'app_settings'
    },

    /**
     * Get data from storage
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from storage:', error);
            return [];
        }
    },

    /**
     * Save data to storage
     */
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    /**
     * Add item to collection
     */
    add(key, item) {
        const data = this.get(key);
        item.id = this.generateId();
        item.createdAt = new Date().toISOString();
        data.push(item);
        return this.set(key, data) ? item : null;
    },

    /**
     * Update item in collection
     */
    update(key, id, updates) {
        const data = this.get(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set(key, data) ? data[index] : null;
        }
        return null;
    },

    /**
     * Delete item from collection
     */
    delete(key, id) {
        const data = this.get(key);
        const filtered = data.filter(item => item.id !== id);
        return this.set(key, filtered);
    },

    /**
     * Get item by ID
     */
    getById(key, id) {
        const data = this.get(key);
        return data.find(item => item.id === id) || null;
    },

    /**
     * Get settings
     */
    getSettings() {
        try {
            const settings = localStorage.getItem(this.KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            return this.getDefaultSettings();
        }
    },

    /**
     * Save settings
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    /**
     * Default settings
     */
    getDefaultSettings() {
        return {
            instansi: 'NAMA INSTANSI',
            alamat: 'Alamat Instansi',
            kota: 'Kota',
            ttdNama: '',
            ttdNip: '',
            ttdJabatan: ''
        };
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Export all data
     */
    exportAll() {
        return {
            sppd: this.get(this.KEYS.SPPD),
            lumpsum: this.get(this.KEYS.LUMPSUM),
            kuitansi: this.get(this.KEYS.KUITANSI),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Import data
     */
    importAll(data) {
        try {
            if (data.sppd) this.set(this.KEYS.SPPD, data.sppd);
            if (data.lumpsum) this.set(this.KEYS.LUMPSUM, data.lumpsum);
            if (data.kuitansi) this.set(this.KEYS.KUITANSI, data.kuitansi);
            if (data.settings) this.saveSettings(data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(this.KEYS.SPPD);
        localStorage.removeItem(this.KEYS.LUMPSUM);
        localStorage.removeItem(this.KEYS.KUITANSI);
        localStorage.removeItem(this.KEYS.SETTINGS);
    },

    // SPPD specific methods
    getAllSPPD() {
        return this.get(this.KEYS.SPPD);
    },

    saveSPPD(sppd) {
        return this.add(this.KEYS.SPPD, sppd);
    },

    updateSPPD(id, sppd) {
        return this.update(this.KEYS.SPPD, id, sppd);
    },

    deleteSPPD(id) {
        // Also delete related lumpsum and kuitansi
        const lumpsumData = this.get(this.KEYS.LUMPSUM);
        const filteredLumpsum = lumpsumData.filter(item => item.sppdId !== id);
        this.set(this.KEYS.LUMPSUM, filteredLumpsum);
        
        return this.delete(this.KEYS.SPPD, id);
    },

    getSPPDById(id) {
        return this.getById(this.KEYS.SPPD, id);
    },

    // Lumpsum specific methods
    getAllLumpsum() {
        return this.get(this.KEYS.LUMPSUM);
    },

    saveLumpsum(lumpsum) {
        return this.add(this.KEYS.LUMPSUM, lumpsum);
    },

    getLumpsumBySPPD(sppdId) {
        const data = this.get(this.KEYS.LUMPSUM);
        return data.find(item => item.sppdId === sppdId) || null;
    },

    deleteLumpsum(id) {
        return this.delete(this.KEYS.LUMPSUM, id);
    },

    // Kuitansi specific methods
    getAllKuitansi() {
        return this.get(this.KEYS.KUITANSI);
    },

    saveKuitansi(kuitansi) {
        return this.add(this.KEYS.KUITANSI, kuitansi);
    },

    deleteKuitansi(id) {
        return this.delete(this.KEYS.KUITANSI, id);
    },

    // Statistics
    getStats() {
        const sppd = this.getAllSPPD();
        const lumpsum = this.getAllLumpsum();
        const kuitansi = this.getAllKuitansi();

        const totalLumpsum = lumpsum.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

        return {
            totalSPPD: sppd.length,
            totalLumpsum: totalLumpsum,
            totalKuitansi: kuitansi.length
        };
    }
};
