"use strict";
/**
 * EncryptionService provides methods for encrypting and decrypting sensitive information
 * in the application, including chat messages and credentials.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
// Using the Web Crypto API for modern encryption
class EncryptionService {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }
    /**
     * Generates a secure encryption key
     */
    async generateKey() {
        return await window.crypto.subtle.generateKey({
            name: 'AES-GCM',
            length: 256
        }, true, ['encrypt', 'decrypt']);
    }
    /**
     * Encrypts a string using AES-GCM
     */
    async encrypt(text, key) {
        // Generate initialization vector
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        // Encrypt the data
        const encoded = this.encoder.encode(text);
        const ciphertext = await window.crypto.subtle.encrypt({
            name: 'AES-GCM',
            iv
        }, key, encoded);
        // Combine IV and ciphertext for storage
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        // Return base64 encoded string
        return btoa(String.fromCharCode(...new Uint8Array(combined)));
    }
    /**
     * Decrypts a string using AES-GCM
     */
    async decrypt(encryptedText, key) {
        try {
            // Decode the base64 string
            const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
            // Extract IV and ciphertext
            const iv = data.slice(0, 12);
            const ciphertext = data.slice(12);
            // Decrypt the data
            const decrypted = await window.crypto.subtle.decrypt({
                name: 'AES-GCM',
                iv
            }, key, ciphertext);
            return this.decoder.decode(decrypted);
        }
        catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }
    /**
     * Securely stores a key in localStorage with user password protection
     */
    async storeKey(key, password) {
        // Derive a key from the password
        const passwordKey = await this.deriveKeyFromPassword(password);
        // Export the encryption key
        const exportedKey = await window.crypto.subtle.exportKey('raw', key);
        // Encrypt the exported key with the password-derived key
        const encryptedKey = await this.encrypt(String.fromCharCode(...new Uint8Array(exportedKey)), passwordKey);
        // Store the encrypted key
        localStorage.setItem('encrypted_app_key', encryptedKey);
    }
    /**
     * Derives an encryption key from a password
     */
    async deriveKeyFromPassword(password) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const passwordKey = await window.crypto.subtle.importKey('raw', this.encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
        return await window.crypto.subtle.deriveKey({
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256'
        }, passwordKey, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    }
}
exports.EncryptionService = EncryptionService;
exports.default = new EncryptionService();
//# sourceMappingURL=EncryptionService.js.map