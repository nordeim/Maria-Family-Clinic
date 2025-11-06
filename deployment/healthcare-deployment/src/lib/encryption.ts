/**
 * Healthcare Data Encryption Service
 * Sub-Phase 9.5: PDPA-Compliant Health Data Protection
 * Implements AES-256-GCM encryption for sensitive health data fields
 */

import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyLength: 256;
  ivLength: 12;
  tagLength: 16;
  saltLength: 32;
  iterations: 100000;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyVersion: string;
  timestamp: string;
  metadata?: {
    fieldType?: string;
    sensitivityLevel?: 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    purpose?: string;
  };
}

export interface EncryptionKey {
  keyId: string;
  keyVersion: string;
  createdAt: Date;
  isActive: boolean;
  rotationDue: Date;
  algorithm: string;
}

export interface DecryptionResult {
  data: string;
  metadata: EncryptedData['metadata'];
  keyVersion: string;
  timestamp: string;
}

/**
 * Healthcare Data Encryption Service
 * Provides field-level encryption for sensitive health data
 */
export class HealthcareEncryptionService {
  private config: EncryptionConfig;
  private masterKey: Buffer;
  private keyStore: Map<string, Buffer> = new Map();
  private currentKeyVersion: string;

  constructor() {
    this.config = {
      algorithm: 'aes-256-gcm',
      keyLength: 256,
      ivLength: 12,
      tagLength: 16,
      saltLength: 32,
      iterations: 100000
    };

    // Load or generate master key (in production, this should come from secure key management)
    this.masterKey = this.getMasterKey();
    this.currentKeyVersion = this.generateKeyVersion();
    
    // Initialize key store
    this.initializeKeyStore();
  }

  /**
   * Encrypt sensitive health data
   * @param data - The data to encrypt
   * @param metadata - Optional metadata about the encrypted data
   * @returns Encrypted data object
   */
  public async encryptHealthData(
    data: string | Buffer, 
    metadata?: EncryptedData['metadata']
  ): Promise<EncryptedData> {
    try {
      // Convert string to buffer if needed
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');

      // Generate initialization vector
      const iv = crypto.randomBytes(this.config.ivLength);
      
      // Create cipher using current encryption key
      const cipher = crypto.createCipherGCM(
        this.config.algorithm,
        this.getCurrentEncryptionKey(),
        iv
      );

      // Encrypt the data
      const encrypted = Buffer.concat([
        cipher.update(dataBuffer),
        cipher.final()
      ]);

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Create encrypted data object
      const encryptedData: EncryptedData = {
        data: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        algorithm: this.config.algorithm,
        keyVersion: this.currentKeyVersion,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          sensitivityLevel: metadata?.sensitivityLevel || 'CONFIDENTIAL'
        }
      };

      // Log encryption activity (in production, this should be auditable)
      this.logEncryptionActivity('encrypt', metadata?.fieldType, metadata?.purpose);

      return encryptedData;
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt sensitive health data
   * @param encryptedData - The encrypted data object
   * @returns Decrypted data and metadata
   */
  public async decryptHealthData(encryptedData: EncryptedData): Promise<DecryptionResult> {
    try {
      // Validate encrypted data structure
      this.validateEncryptedData(encryptedData);

      // Get the appropriate encryption key based on key version
      const encryptionKey = this.getEncryptionKeyByVersion(encryptedData.keyVersion);
      
      if (!encryptionKey) {
        throw new Error(`Encryption key version ${encryptedData.keyVersion} not found`);
      }

      // Create decipher
      const decipher = crypto.createDecipherGCM(
        encryptedData.algorithm,
        encryptionKey,
        Buffer.from(encryptedData.iv, 'base64')
      );

      // Set authentication tag
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));

      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedData.data, 'base64')),
        decipher.final()
      ]);

      // Log decryption activity
      this.logEncryptionActivity('decrypt', encryptedData.metadata?.fieldType, encryptedData.metadata?.purpose);

      return {
        data: decrypted.toString('utf8'),
        metadata: encryptedData.metadata,
        keyVersion: encryptedData.keyVersion,
        timestamp: encryptedData.timestamp
      };
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch encrypt multiple data fields
   * @param dataMap - Object with field names as keys and data as values
   * @param sensitivityLevels - Object with field sensitivity levels
   * @returns Object with encrypted data
   */
  public async batchEncrypt(
    dataMap: Record<string, string | Buffer>,
    sensitivityLevels: Record<string, EncryptedData['metadata']['sensitivityLevel']> = {}
  ): Promise<Record<string, EncryptedData>> {
    const encryptedMap: Record<string, EncryptedData> = {};

    for (const [fieldName, data] of Object.entries(dataMap)) {
      encryptedMap[fieldName] = await this.encryptHealthData(data, {
        fieldType: fieldName,
        sensitivityLevel: sensitivityLevels[fieldName] || 'CONFIDENTIAL',
        purpose: 'batch_encryption'
      });
    }

    return encryptedMap;
  }

  /**
   * Batch decrypt multiple encrypted fields
   * @param encryptedMap - Object with encrypted data
   * @returns Object with decrypted data
   */
  public async batchDecrypt(encryptedMap: Record<string, EncryptedData>): Promise<Record<string, DecryptionResult>> {
    const decryptedMap: Record<string, DecryptionResult> = {};

    for (const [fieldName, encryptedData] of Object.entries(encryptedMap)) {
      decryptedMap[fieldName] = await this.decryptHealthData(encryptedData);
    }

    return decryptedMap;
  }

  /**
   * Rotate encryption keys
   * @returns New key version
   */
  public async rotateEncryptionKey(): Promise<string> {
    const newKeyVersion = this.generateKeyVersion();
    const newKey = crypto.randomBytes(this.config.keyLength / 8);
    
    // Store the new key
    this.keyStore.set(newKeyVersion, newKey);
    
    // Update current key version
    this.currentKeyVersion = newKeyVersion;
    
    // Log key rotation
    this.logEncryptionActivity('key_rotation', undefined, 'key_management');
    
    return newKeyVersion;
  }

  /**
   * Encrypt database field values
   * @param value - Database field value
   * @param fieldName - Field name for metadata
   * @param sensitivityLevel - Data sensitivity level
   * @returns Encrypted value for database storage
   */
  public async encryptField(
    value: any,
    fieldName: string,
    sensitivityLevel: EncryptedData['metadata']['sensitivityLevel'] = 'CONFIDENTIAL'
  ): Promise<string> {
    if (value === null || value === undefined) {
      return value as string;
    }

    // Convert to JSON string if not already a string
    const dataString = typeof value === 'string' ? value : JSON.stringify(value);

    const encryptedData = await this.encryptHealthData(dataString, {
      fieldType: fieldName,
      sensitivityLevel,
      purpose: 'field_encryption'
    });

    // Store as JSON string for database
    return JSON.stringify(encryptedData);
  }

  /**
   * Decrypt database field values
   * @param encryptedValue - Encrypted value from database
   * @returns Decrypted value
   */
  public async decryptField(encryptedValue: string): Promise<any> {
    if (!encryptedValue || typeof encryptedValue !== 'string') {
      return encryptedValue;
    }

    try {
      // Try to parse as encrypted data
      const encryptedData = JSON.parse(encryptedValue) as EncryptedData;
      
      if (encryptedData.data && encryptedData.iv && encryptedData.tag) {
        const result = await this.decryptHealthData(encryptedData);
        
        // Try to parse as JSON, return as string if not valid JSON
        try {
          return JSON.parse(result.data);
        } catch {
          return result.data;
        }
      }
    } catch (error) {
      // If not encrypted data, return as is
      return encryptedValue;
    }
  }

  /**
   * Generate a secure hash for data integrity checking
   * @param data - Data to hash
   * @returns SHA-256 hash
   */
  public generateHash(data: string | Buffer): string {
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    return crypto.createHash('sha256').update(dataBuffer).digest('hex');
  }

  /**
   * Verify data integrity using hash
   * @param data - Original data
   * @param hash - Hash to verify against
   * @returns True if data integrity is verified
   */
  public verifyHash(data: string | Buffer, hash: string): boolean {
    const computedHash = this.generateHash(data);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }

  /**
   * Generate cryptographically secure random string
   * @param length - Length of the random string
   * @returns Random string
   */
  public generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Get encryption key statistics
   * @returns Key management statistics
   */
  public getKeyStatistics(): {
    currentKeyVersion: string;
    totalKeys: number;
    activeKeys: number;
    lastRotation: Date;
    nextRotation: Date;
  } {
    const activeKeys = Array.from(this.keyStore.values()).length;
    const nextRotation = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    return {
      currentKeyVersion: this.currentKeyVersion,
      totalKeys: this.keyStore.size,
      activeKeys,
      lastRotation: new Date(), // In production, track actual rotation dates
      nextRotation
    };
  }

  // Private methods

  private getMasterKey(): Buffer {
    // In production, this should come from a secure key management service
    // For development, generate a key from environment or fallback
    const keyHex = process.env.ENCRYPTION_MASTER_KEY || 
      crypto.randomBytes(32).toString('hex');
    
    return Buffer.from(keyHex, 'hex');
  }

  private generateKeyVersion(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `v${timestamp}_${random}`;
  }

  private initializeKeyStore(): void {
    // Initialize with the first encryption key
    this.keyStore.set(this.currentKeyVersion, this.masterKey);
  }

  private getCurrentEncryptionKey(): Buffer {
    return this.getEncryptionKeyByVersion(this.currentKeyVersion)!;
  }

  private getEncryptionKeyByVersion(version: string): Buffer | null {
    return this.keyStore.get(version) || null;
  }

  private validateEncryptedData(encryptedData: any): void {
    if (!encryptedData.data || !encryptedData.iv || !encryptedData.tag) {
      throw new Error('Invalid encrypted data structure');
    }

    if (!encryptedData.algorithm || !encryptedData.keyVersion) {
      throw new Error('Missing required encryption metadata');
    }
  }

  private logEncryptionActivity(
    action: string, 
    fieldType?: string, 
    purpose?: string
  ): void {
    // In production, this should log to a secure audit trail
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      fieldType,
      purpose,
      keyVersion: this.currentKeyVersion
    };
    
    // For development, just log to console
    console.log('[Encryption Activity]', logEntry);
  }
}

// Create singleton instance
export const healthcareEncryption = new HealthcareEncryptionService();

// Export convenience functions
export const encryptHealthData = (data: string | Buffer, metadata?: EncryptedData['metadata']) =>
  healthcareEncryption.encryptHealthData(data, metadata);

export const decryptHealthData = (encryptedData: EncryptedData) =>
  healthcareEncryption.decryptHealthData(encryptedData);

export const encryptField = (value: any, fieldName: string, sensitivityLevel?: EncryptedData['metadata']['sensitivityLevel']) =>
  healthcareEncryption.encryptField(value, fieldName, sensitivityLevel);

export const decryptField = (encryptedValue: string) =>
  healthcareEncryption.decryptField(encryptedValue);

export const generateHash = (data: string | Buffer) =>
  healthcareEncryption.generateHash(data);

export const verifyHash = (data: string | Buffer, hash: string) =>
  healthcareEncryption.verifyHash(data, hash);

export const generateSecureRandom = (length?: number) =>
  healthcareEncryption.generateSecureRandom(length);

export const rotateEncryptionKey = () =>
  healthcareEncryption.rotateEncryptionKey();

// Export types
export type {
  EncryptedData,
  DecryptionResult,
  EncryptionKey,
  EncryptionConfig
};