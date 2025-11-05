// ========================================
// VOICE-TO-TEXT INTEGRATION SERVICE
// Sub-Phase 9.7: Speech Recognition for Accessibility
// Modern speech recognition APIs with healthcare vocabulary
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Voice configuration schema
const VoiceConfigSchema = z.object({
  name: z.string(),
  provider: z.enum(['GOOGLE', 'AWS_POLLY', 'AZURE', 'OPENAI_WHISPER', 'DEEPGRAM', 'ASSEMBLYAI', 'REV', 'SPEECHMATICS', 'COQUI', 'WAVE2VEC']),
  isActive: z.boolean().default(true),
  apiEndpoint: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  supportedLanguages: z.array(z.string()).default(['en']),
  defaultLanguage: z.string().default('en'),
  medicalVocabulary: z.array(z.string()).default([]),
  customTerms: z.record(z.string()).default({}),
  confidenceThreshold: z.number().default(0.7),
  maxDuration: z.number().optional(),
  sampleRate: z.number().optional(),
  encoding: z.string().optional(),
  enablePunctuation: z.boolean().default(true),
  enableSpeakerId: z.boolean().default(false),
  enableSentiment: z.boolean().default(false)
});

// Audio processing result
export interface VoiceTranscriptionResult {
  success: boolean;
  text: string;
  confidence: number;
  language: string;
  duration: number;
  speakers?: SpeakerInfo[];
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  entities?: MedicalEntity[];
  confidenceByWord?: ConfidenceScore[];
  processingTime: number;
  metadata?: any;
}

// Speaker information
export interface SpeakerInfo {
  speakerId: string;
  startTime: number;
  endTime: number;
  confidence: number;
  text: string;
}

// Medical entity from speech
export interface MedicalEntity {
  type: 'SYMPTOM' | 'MEDICATION' | 'CONDITION' | 'ANATOMY' | 'PROCEDURE';
  value: string;
  confidence: number;
  startTime: number;
  endTime: number;
}

// Word-level confidence score
export interface ConfidenceScore {
  word: string;
  confidence: number;
  startTime: number;
  endTime: number;
}

// Voice processing request
export interface VoiceProcessingRequest {
  audioData: Buffer | string; // Base64 encoded audio or file path
  format: AudioFormat;
  duration?: number;
  language?: string;
  medicalContext?: MedicalContext;
  clinicId?: string;
  doctorId?: string;
  patientId?: string;
  conversationId?: string;
}

// Audio formats supported
export type AudioFormat = 'WAV' | 'MP3' | 'M4A' | 'OGG' | 'WEBM' | 'FLAC' | 'AAC';

// Medical context for better recognition
export interface MedicalContext {
  specialty?: string;
  commonTerms?: string[];
  patientHistory?: string[];
  medicationList?: string[];
  procedureTypes?: string[];
  anatomicalTerms?: string[];
}

// Voice service provider interface
export interface VoiceServiceProvider {
  transcribe(request: VoiceProcessingRequest): Promise<VoiceTranscriptionResult>;
  validateAudio(audioData: Buffer): Promise<boolean>;
  preprocessAudio(audioData: Buffer, format: AudioFormat): Promise<Buffer>;
  postprocessTranscription(text: string, context?: MedicalContext): Promise<string>;
  getSupportedFormats(): AudioFormat[];
  getMaxDuration(): number;
}

// Base voice service provider
abstract class BaseVoiceProvider implements VoiceServiceProvider {
  protected config: z.infer<typeof VoiceConfigSchema>;
  protected eventEmitter: EventEmitter;

  constructor(config: z.infer<typeof VoiceConfigSchema>) {
    this.config = VoiceConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
  }

  abstract transcribe(request: VoiceProcessingRequest): Promise<VoiceTranscriptionResult>;
  abstract validateAudio(audioData: Buffer): Promise<boolean>;
  abstract preprocessAudio(audioData: Buffer, format: AudioFormat): Promise<Buffer>;
  abstract postprocessTranscription(text: string, context?: MedicalContext): Promise<string>;
  abstract getSupportedFormats(): AudioFormat[];
  abstract getMaxDuration(): number;

  protected logActivity(activity: any): void {
    console.log(`[${this.config.provider} Voice Service] ${activity.message}`, activity.data);
  }

  protected handleError(error: any, context: string): never {
    console.error(`[${this.config.provider} Voice Service] ${context}:`, error);
    throw new Error(`${context} failed: ${error.message}`);
  }
}

// Google Cloud Speech-to-Text Provider
export class GoogleVoiceProvider extends BaseVoiceProvider {
  async transcribe(request: VoiceProcessingRequest): Promise<VoiceTranscriptionResult> {
    try {
      const startTime = Date.now();
      
      // Preprocess audio
      const processedAudio = await this.preprocessAudio(
        Buffer.isBuffer(request.audioData) ? request.audioData : Buffer.from(request.audioData, 'base64'),
        request.format
      );
      
      // Prepare request for Google Speech-to-Text API
      const transcriptionRequest = {
        audio: {
          content: processedAudio.toString('base64')
        },
        config: {
          encoding: this.mapFormatToGoogleEncoding(request.format),
          sampleRateHertz: this.config.sampleRate || 16000,
          languageCode: request.language || this.config.defaultLanguage,
          enableAutomaticPunctuation: this.config.enablePunctuation,
          enableSpeakerDiarization: this.config.enableSpeakerId,
          model: this.config.model || 'latest_long',
          useEnhanced: true,
          speechContexts: this.buildSpeechContexts(request.medicalContext),
          metadata: {
            interactionType: 'VOICE_CHAT',
            industryNaicsCodeOfAudio: '621111',
            microphoneDistance: 'MIDFIELD',
            originalMediaType: 'AUDIO'
          }
        }
      };
      
      // In production, make actual API call to Google Cloud Speech-to-Text
      // const response = await speechClient.recognize(transcriptionRequest);
      
      // Simulated response for demo
      await this.logActivity({
        message: 'Transcription request sent to Google Speech-to-Text',
        data: { format: request.format, language: request.language }
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result
      const mockResult: VoiceTranscriptionResult = {
        success: true,
        text: "Hello, I would like to book an appointment with the doctor. I have been experiencing some symptoms for the past few days.",
        confidence: 0.92,
        language: request.language || 'en',
        duration: 5.2,
        speakers: this.config.enableSpeakerId ? [
          {
            speakerId: 'speaker1',
            startTime: 0.0,
            endTime: 5.2,
            confidence: 0.92,
            text: "Hello, I would like to book an appointment with the doctor. I have been experiencing some symptoms for the past few days."
          }
        ] : undefined,
        sentiment: this.config.enableSentiment ? 'NEUTRAL' : undefined,
        entities: this.extractMedicalEntities("Hello, I would like to book an appointment with the doctor. I have been experiencing some symptoms for the past few days."),
        processingTime: Date.now() - startTime,
        metadata: {
          provider: 'GOOGLE',
          model: 'latest_long',
          confidenceScores: [
            { word: 'Hello', confidence: 0.95, startTime: 0.0, endTime: 0.5 },
            { word: 'I', confidence: 0.98, startTime: 0.6, endTime: 0.7 },
            { word: 'would', confidence: 0.89, startTime: 0.8, endTime: 1.0 },
            { word: 'like', confidence: 0.94, startTime: 1.1, endTime: 1.3 },
            { word: 'to', confidence: 0.97, endTime: 1.4 },
            { word: 'book', confidence: 0.96, endTime: 1.6 },
            { word: 'an', confidence: 0.98, endTime: 1.7 },
            { word: 'appointment', confidence: 0.93, endTime: 2.1 },
            { word: 'with', confidence: 0.97, endTime: 2.3 },
            { word: 'the', confidence: 0.99, endTime: 2.4 },
            { word: 'doctor', confidence: 0.91, endTime: 2.7 },
            { word: 'I', confidence: 0.98, endTime: 2.9 },
            { word: 'have', confidence: 0.97, endTime: 3.0 },
            { word: 'been', confidence: 0.96, endTime: 3.2 },
            { word: 'experiencing', confidence: 0.89, endTime: 3.7 },
            { word: 'some', confidence: 0.95, endTime: 3.8 },
            { word: 'symptoms', confidence: 0.88, endTime: 4.2 },
            { word: 'for', confidence: 0.98, endTime: 4.3 },
            { word: 'the', confidence: 0.99, endTime: 4.4 },
            { word: 'past', confidence: 0.97, endTime: 4.6 },
            { word: 'few', confidence: 0.98, endTime: 4.7 },
            { word: 'days', confidence: 0.94, endTime: 5.2 }
          ]
        }
      };
      
      // Postprocess with medical context
      mockResult.text = await this.postprocessTranscription(mockResult.text, request.medicalContext);
      
      return mockResult;
    } catch (error) {
      this.handleError(error, 'Google transcription');
    }
  }

  async validateAudio(audioData: Buffer): Promise<boolean> {
    try {
      // Basic audio validation
      if (audioData.length < 1024) { // Minimum 1KB
        return false;
      }
      
      // Check audio format
      const format = this.detectAudioFormat(audioData);
      return this.getSupportedFormats().includes(format);
    } catch (error) {
      console.error('Audio validation failed:', error);
      return false;
    }
  }

  async preprocessAudio(audioData: Buffer, format: AudioFormat): Promise<Buffer> {
    try {
      // In production, use audio processing libraries (ffmpeg, sox, etc.)
      // For demo, just return the buffer with basic validation
      
      const supportedFormats = this.getSupportedFormats();
      if (!supportedFormats.includes(format)) {
        throw new Error(`Unsupported audio format: ${format}`);
      }
      
      // Sample rate conversion if needed
      if (this.config.sampleRate && this.config.sampleRate !== 16000) {
        // In production, convert sample rate
        this.logActivity({ message: `Converting sample rate to ${this.config.sampleRate}Hz` });
      }
      
      // Remove silence, normalize audio, etc.
      this.logActivity({ message: 'Preprocessing audio', data: { format, size: audioData.length } });
      
      return audioData;
    } catch (error) {
      this.handleError(error, 'Audio preprocessing');
    }
  }

  async postprocessTranscription(text: string, context?: MedicalContext): Promise<string> {
    try {
      let processedText = text;
      
      // Apply medical vocabulary corrections
      if (this.config.medicalVocabulary.length > 0) {
        for (const term of this.config.medicalVocabulary) {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          processedText = processedText.replace(regex, term);
        }
      }
      
      // Apply custom terms dictionary
      if (this.config.customTerms && Object.keys(this.config.customTerms).length > 0) {
        for (const [incorrect, correct] of Object.entries(this.config.customTerms)) {
          const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
          processedText = processedText.replace(regex, correct);
        }
      }
      
      // Medical context improvements
      if (context) {
        processedText = this.applyMedicalContext(processedText, context);
      }
      
      // Clean up punctuation and formatting
      processedText = this.cleanupText(processedText);
      
      return processedText;
    } catch (error) {
      this.handleError(error, 'Transcription postprocessing');
    }
  }

  getSupportedFormats(): AudioFormat[] {
    return ['WAV', 'MP3', 'M4A', 'OGG', 'WEBM', 'FLAC'];
  }

  getMaxDuration(): number {
    return this.config.maxDuration || 60; // Default 60 seconds
  }

  private mapFormatToGoogleEncoding(format: AudioFormat): string {
    const mapping: Record<AudioFormat, string> = {
      'WAV': 'LINEAR16',
      'MP3': 'MP3',
      'M4A': 'MP3',
      'OGG': 'OGG_OPUS',
      'WEBM': 'WEBM_OPUS',
      'FLAC': 'FLAC'
    };
    return mapping[format] || 'LINEAR16';
  }

  private buildSpeechContexts(context?: MedicalContext): any[] {
    const speechContexts = [];
    
    if (context?.specialty) {
      speechContexts.push({
        phrases: [context.specialty],
        boost: 10.0
      });
    }
    
    if (context?.commonTerms?.length) {
      speechContexts.push({
        phrases: context.commonTerms,
        boost: 8.0
      });
    }
    
    if (context?.medicationList?.length) {
      speechContexts.push({
        phrases: context.medicationList,
        boost: 12.0
      });
    }
    
    if (context?.anatomicalTerms?.length) {
      speechContexts.push({
        phrases: context.anatomicalTerms,
        boost: 9.0
      });
    }
    
    // Always include general medical vocabulary
    if (this.config.medicalVocabulary.length > 0) {
      speechContexts.push({
        phrases: this.config.medicalVocabulary,
        boost: 6.0
      });
    }
    
    return speechContexts;
  }

  private detectAudioFormat(audioData: Buffer): AudioFormat {
    // Simple format detection based on file headers
    if (audioData.slice(0, 4).toString() === 'RIFF') return 'WAV';
    if (audioData.slice(0, 3).toString() === 'ID3') return 'MP3';
    if (audioData.slice(4, 8).toString() === 'ftyp') return 'M4A';
    if (audioData.slice(0, 3).toString() === 'Ogg') return 'OGG';
    return 'WAV'; // Default fallback
  }

  private extractMedicalEntities(text: string): MedicalEntity[] {
    const entities: MedicalEntity[] = [];
    const lowerText = text.toLowerCase();
    
    // Medical terms patterns
    const patterns = {
      SYMPTOM: /(pain|fever|cough|headache|nausea|vomiting|diarrhea|dizziness|fatigue|symptom)/gi,
      MEDICATION: /(medicine|pill|tablet|capsule|prescription|dosage)/gi,
      CONDITION: /(diabetes|hypertension|asthma|allergy|infection|injury)/gi,
      ANATOMY: /(heart|lung|liver|kidney|stomach|throat|ear|eye|skin|back|neck|chest|arm|leg)/gi,
      PROCEDURE: /(surgery|examination|consultation|test|screening|therapy|treatment)/gi
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = Array.from(lowerText.matchAll(pattern));
      matches.forEach(match => {
        if (match.index !== undefined) {
          entities.push({
            type: type as any,
            value: match[0],
            confidence: 0.8,
            startTime: match.index,
            endTime: match.index + match[0].length
          });
        }
      });
    }
    
    return entities;
  }

  private applyMedicalContext(text: string, context: MedicalContext): string {
    let processed = text;
    
    // Boost recognition of specialty-related terms
    if (context.specialty) {
      const specialty = context.specialty.toLowerCase();
      if (!processed.toLowerCase().includes(specialty)) {
        // Could add specialty terms to context
      }
    }
    
    return processed;
  }

  private cleanupText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/([.!?])\s*([.!?])/g, '$1') // Remove duplicate punctuation
      .trim();
  }
}

// Azure Speech Services Provider
export class AzureVoiceProvider extends BaseVoiceProvider {
  async transcribe(request: VoiceProcessingRequest): Promise<VoiceTranscriptionResult> {
    try {
      const startTime = Date.now();
      
      // Azure Speech-to-Text API call
      const processedAudio = await this.preprocessAudio(
        Buffer.isBuffer(request.audioData) ? request.audioData : Buffer.from(request.audioData, 'base64'),
        request.format
      );
      
      await this.logActivity({
        message: 'Transcription request sent to Azure Speech-to-Text',
        data: { format: request.format, language: request.language }
      });
      
      // Simulated Azure response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        text: "I need to schedule a follow-up appointment for my diabetes check-up.",
        confidence: 0.89,
        language: request.language || 'en',
        duration: 4.8,
        entities: this.extractMedicalEntities("I need to schedule a follow-up appointment for my diabetes check-up."),
        processingTime: Date.now() - startTime,
        metadata: { provider: 'AZURE', model: 'latest' }
      };
    } catch (error) {
      this.handleError(error, 'Azure transcription');
    }
  }

  async validateAudio(audioData: Buffer): Promise<boolean> {
    return audioData.length >= 1024;
  }

  async preprocessAudio(audioData: Buffer, format: AudioFormat): Promise<Buffer> {
    return audioData;
  }

  async postprocessTranscription(text: string, context?: MedicalContext): Promise<string> {
    return this.cleanupText(text);
  }

  getSupportedFormats(): AudioFormat[] {
    return ['WAV', 'MP3', 'OGG', 'WEBM'];
  }

  getMaxDuration(): number {
    return this.config.maxDuration || 120; // Azure allows longer recordings
  }

  private extractMedicalEntities(text: string): MedicalEntity[] {
    // Similar to Google provider but with Azure-specific patterns
    return [];
  }

  private cleanupText(text: string): string {
    return text.trim();
  }
}

// OpenAI Whisper Provider
export class OpenAIWhisperProvider extends BaseVoiceProvider {
  async transcribe(request: VoiceProcessingRequest): Promise<VoiceTranscriptionResult> {
    try {
      const startTime = Date.now();
      
      await this.logActivity({
        message: 'Transcription request sent to OpenAI Whisper',
        data: { format: request.format, language: request.language }
      });
      
      // Simulated Whisper response
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        success: true,
        text: "What are your clinic hours and do you accept Healthier SG patients?",
        confidence: 0.94,
        language: request.language || 'en',
        duration: 3.5,
        processingTime: Date.now() - startTime,
        metadata: { provider: 'OPENAI_WHISPER', model: 'whisper-1' }
      };
    } catch (error) {
      this.handleError(error, 'OpenAI Whisper transcription');
    }
  }

  async validateAudio(audioData: Buffer): Promise<boolean> {
    return audioData.length >= 1024;
  }

  async preprocessAudio(audioData: Buffer, format: AudioFormat): Promise<Buffer> {
    return audioData;
  }

  async postprocessTranscription(text: string, context?: MedicalContext): Promise<string> {
    return this.cleanupText(text);
  }

  getSupportedFormats(): AudioFormat[] {
    return ['WAV', 'MP3', 'M4A', 'OGG', 'WEBM', 'FLAC'];
  }

  getMaxDuration(): number {
    return this.config.maxDuration || 300; // Whisper allows up to 25MB files
  }

  private cleanupText(text: string): string {
    return text.trim();
  }
}

// Voice-to-Text Service Manager
export class VoiceToTextService {
  private providers: Map<string, VoiceServiceProvider> = new Map();
  private eventEmitter: EventEmitter;
  private medicalVocabulary: string[] = [];
  private performanceMetrics: Map<string, any> = new Map();

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.initializeDefaultProviders();
    this.loadMedicalVocabulary();
  }

  // Initialize default providers
  private initializeDefaultProviders(): void {
    // Google provider
    const googleConfig = VoiceConfigSchema.parse({
      name: 'google_default',
      provider: 'GOOGLE',
      isActive: true,
      medicalVocabulary: this.medicalVocabulary,
      confidenceThreshold: 0.7,
      enablePunctuation: true,
      enableSpeakerId: false
    });
    this.providers.set('google', new GoogleVoiceProvider(googleConfig));

    // Azure provider
    const azureConfig = VoiceConfigSchema.parse({
      name: 'azure_default',
      provider: 'AZURE',
      isActive: true,
      medicalVocabulary: this.medicalVocabulary,
      confidenceThreshold: 0.7
    });
    this.providers.set('azure', new AzureVoiceProvider(azureConfig));

    // OpenAI Whisper provider
    const whisperConfig = VoiceConfigSchema.parse({
      name: 'whisper_default',
      provider: 'OPENAI_WHISPER',
      isActive: true,
      medicalVocabulary: this.medicalVocabulary,
      confidenceThreshold: 0.7
    });
    this.providers.set('whisper', new OpenAIWhisperProvider(whisperConfig));
  }

  // Load medical vocabulary
  private loadMedicalVocabulary(): void {
    this.medicalVocabulary = [
      // Common medical terms
      'appointment', 'consultation', 'prescription', 'medication', 'treatment',
      'diagnosis', 'symptoms', 'condition', 'allergy', 'emergency',
      'check-up', 'screening', 'vaccination', 'injection', 'therapy',
      
      // Body parts
      'heart', 'lung', 'liver', 'kidney', 'stomach', 'throat', 'ear', 'eye',
      'skin', 'back', 'neck', 'chest', 'arm', 'leg', 'head', 'hand', 'foot',
      
      // Common conditions
      'diabetes', 'hypertension', 'asthma', 'fever', 'cough', 'headache',
      'nausea', 'vomiting', 'diarrhea', 'pain', 'infection', 'injury',
      
      // Medications
      'paracetamol', 'ibuprofen', 'aspirin', 'antibiotic', 'insulin',
      'metformin', 'lisinopril', 'omeprazole', 'amoxicillin',
      
      // Healthcare procedures
      'blood test', 'x-ray', 'scan', 'biopsy', 'surgery', 'examination',
      'vital signs', 'blood pressure', 'temperature', 'pulse',
      
      // Healthcare providers
      'doctor', 'physician', 'specialist', 'nurse', 'surgeon', 'consultant',
      'general practitioner', 'family doctor', 'medical officer',
      
      // Healthcare facilities
      'clinic', 'hospital', 'emergency room', 'ward', 'operating theater',
      'pharmacy', 'laboratory', 'radiology', 'ambulance',
      
      // Insurance and payment
      'Medisave', 'Medishield', 'Medifund', 'CPF', 'subsidy', 'coverage',
      'insurance', 'payment', 'fee', 'charges', 'bill'
    ];
  }

  // Transcribe audio using best available provider
  async transcribe(
    audioData: Buffer | string,
    options: {
      format?: AudioFormat;
      language?: string;
      provider?: string;
      medicalContext?: MedicalContext;
      clinicId?: string;
      doctorId?: string;
      patientId?: string;
      conversationId?: string;
    } = {}
  ): Promise<VoiceTranscriptionResult> {
    try {
      const startTime = Date.now();
      
      // Select provider
      const providerName = options.provider || this.selectBestProvider(options);
      const provider = this.providers.get(providerName);
      
      if (!provider) {
        throw new Error(`Voice provider not found: ${providerName}`);
      }
      
      // Validate audio
      const audioBuffer = Buffer.isBuffer(audioData) ? audioData : Buffer.from(audioData, 'base64');
      const isValid = await provider.validateAudio(audioBuffer);
      
      if (!isValid) {
        throw new Error('Invalid audio data');
      }
      
      // Create processing request
      const request: VoiceProcessingRequest = {
        audioData: audioBuffer,
        format: options.format || 'WAV',
        duration: this.calculateAudioDuration(audioBuffer, options.format || 'WAV'),
        language: options.language || 'en',
        medicalContext: options.medicalContext,
        clinicId: options.clinicId,
        doctorId: options.doctorId,
        patientId: options.patientId,
        conversationId: options.conversationId
      };
      
      // Process transcription
      const result = await provider.transcribe(request);
      
      // Update performance metrics
      this.updatePerformanceMetrics(providerName, result);
      
      // Log transcription
      await this.logTranscription(result, request);
      
      // Emit event
      this.eventEmitter.emit('transcriptionCompleted', result, request);
      
      return result;
      
    } catch (error) {
      console.error('Voice transcription failed:', error);
      throw new Error(`Voice transcription failed: ${error.message}`);
    }
  }

  // Select best provider based on requirements
  private selectBestProvider(options: any): string {
    // Prefer Google for English and medical content
    if (options.language?.startsWith('en') || options.medicalContext) {
      return 'google';
    }
    
    // Use Azure for longer recordings
    if (options.duration && options.duration > 60) {
      return 'azure';
    }
    
    // Default to Google
    return 'google';
  }

  // Calculate audio duration (simplified)
  private calculateAudioDuration(audioData: Buffer, format: AudioFormat): number {
    // This is a simplified calculation
    // In production, use proper audio analysis
    const bytesPerSecond = 16000 * 2; // 16kHz, 16-bit, mono
    return Math.round(audioData.length / bytesPerSecond);
  }

  // Update performance metrics
  private updatePerformanceMetrics(providerName: string, result: VoiceTranscriptionResult): void {
    if (!this.performanceMetrics.has(providerName)) {
      this.performanceMetrics.set(providerName, {
        totalRequests: 0,
        successCount: 0,
        totalProcessingTime: 0,
        totalConfidence: 0,
        averageProcessingTime: 0,
        averageConfidence: 0
      });
    }
    
    const metrics = this.performanceMetrics.get(providerName);
    metrics.totalRequests++;
    
    if (result.success) {
      metrics.successCount++;
      metrics.totalProcessingTime += result.processingTime;
      metrics.totalConfidence += result.confidence;
      metrics.averageProcessingTime = metrics.totalProcessingTime / metrics.successCount;
      metrics.averageConfidence = metrics.totalConfidence / metrics.successCount;
    }
    
    this.performanceMetrics.set(providerName, metrics);
  }

  // Log transcription for analytics
  private async logTranscription(result: VoiceTranscriptionResult, request: VoiceProcessingRequest): Promise<void> {
    try {
      await prisma.channelMessage.create({
        data: {
          channelId: 'voice',
          messageId: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: result.text,
          messageType: 'AUDIO',
          senderId: request.patientId || 'anonymous',
          senderName: 'Voice Input',
          senderType: 'CUSTOMER',
          senderChannel: 'voice',
          isVoiceMessage: true,
          transcript: result.text,
          audioDuration: result.duration,
          speechConfidence: result.confidence,
          sentiment: result.sentiment || 'NEUTRAL',
          status: 'PROCESSED',
          processed: true,
          clinicId: request.clinicId,
          doctorId: request.doctorId,
          patientId: request.patientId,
          conversationId: request.conversationId
        }
      });
    } catch (error) {
      console.error('Failed to log transcription:', error);
    }
  }

  // Get provider performance metrics
  getProviderMetrics(providerName?: string): any {
    if (providerName) {
      return this.performanceMetrics.get(providerName) || {};
    }
    
    const allMetrics: any = {};
    for (const [name, metrics] of this.performanceMetrics) {
      allMetrics[name] = metrics;
    }
    return allMetrics;
  }

  // Add custom medical vocabulary
  addMedicalTerms(terms: string[]): void {
    this.medicalVocabulary.push(...terms);
    
    // Update all providers
    for (const provider of this.providers.values()) {
      if ('config' in provider) {
        (provider as any).config.medicalVocabulary = this.medicalVocabulary;
      }
    }
  }

  // Register new provider
  registerProvider(name: string, provider: VoiceServiceProvider): void {
    this.providers.set(name, provider);
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // Health check
  async getHealthStatus(): Promise<any> {
    const providerStatus: any = {};
    
    for (const [name, provider] of this.providers) {
      providerStatus[name] = {
        status: 'active',
        supportedFormats: provider.getSupportedFormats(),
        maxDuration: provider.getMaxDuration(),
        metrics: this.performanceMetrics.get(name) || {}
      };
    }
    
    return {
      status: 'healthy',
      providers: providerStatus,
      totalProviders: this.providers.size,
      medicalVocabularySize: this.medicalVocabulary.length
    };
  }

  // Event listeners
  onTranscriptionCompleted(callback: (result: VoiceTranscriptionResult, request: VoiceProcessingRequest) => void): void {
    this.eventEmitter.on('transcriptionCompleted', callback);
  }

  onTranscriptionError(callback: (error: Error, request: VoiceProcessingRequest) => void): void {
    this.eventEmitter.on('transcriptionError', callback);
  }
}

// Export singleton instance
export const voiceToTextService = new VoiceToTextService();

export default VoiceToTextService;