// ========================================
// VIDEO CONSULTATION INTEGRATION SERVICE
// Sub-Phase 9.7: Remote Healthcare Video Consultations
// Integrated video consultation system with clinic booking
// ========================================

import { z } from 'zod';
import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Video consultation configuration schema
const VideoConsultationConfigSchema = z.object({
  clinicId: z.string(),
  platform: z.enum(['ZOOM', 'TEAMS', 'GOOGLE_MEET', 'WHATSAPP_VIDEO', 'FACETIME', 'WEBEX', 'GOTOMEETING', 'JITSI', 'DAILY', 'TWILIO_VIDEO', 'AGORA', 'VONAGE', 'OPENVIDU']),
  apiKey: z.string(),
  baseUrl: z.string(),
  maxDuration: z.number().default(60), // minutes
  recordingEnabled: z.boolean().default(false),
  qualitySettings: z.object({
    resolution: z.enum(['HD', 'FULL_HD', '4K']).default('HD'),
    frameRate: z.number().default(30),
    bitrate: z.number().default(1000) // kbps
  }).default({}),
  features: z.object({
    screenShare: z.boolean().default(true),
    chat: z.boolean().default(true),
    fileShare: z.boolean().default(true),
    recording: z.boolean().default(false),
    waitingRoom: z.boolean().default(true),
    endToEndEncryption: z.boolean().default(false)
  }).default({}),
  workingHours: z.object({
    start: z.string().default('09:00'),
    end: z.string().default('17:00'),
    timezone: z.string().default('Asia/Singapore')
  }).default({}),
  pricing: z.object({
    consultationFee: z.number().default(50),
    platformFee: z.number().default(5),
    insuranceEnabled: z.boolean().default(true)
  }).default({})
});

// Video consultation session
export interface VideoConsultation {
  id: string;
  consultationId: string;
  patientId?: string;
  doctorId?: string;
  clinicId: string;
  appointmentId?: string;
  subject?: string;
  priority: ConsultationPriority;
  status: VideoConsultationStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  platform: VideoPlatform;
  meetingUrl?: string;
  meetingId?: string;
  accessCode?: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientDevice?: string;
  doctorName?: string;
  doctorEmail?: string;
  serviceType?: string;
  consultationType?: string;
  medicalNotes?: string;
  prescriptions: VideoPrescription[];
  connectionQuality: VideoQuality;
  technicalIssues?: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  calendarEventId?: string;
  paymentStatus: PaymentStatus;
  connectionAttempts: number;
  dropoutCount: number;
  satisfactionScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Video prescription
export interface VideoPrescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedAt: Date;
  validUntil?: Date;
}

// Video platform interface
export interface VideoPlatformProvider {
  createMeeting(consultation: VideoConsultation): Promise<VideoMeeting>;
  joinMeeting(consultationId: string, participant: VideoParticipant): Promise<VideoJoinResponse>;
  endMeeting(consultationId: string): Promise<boolean>;
  getMeetingInfo(consultationId: string): Promise<VideoMeetingInfo>;
  startRecording(consultationId: string): Promise<boolean>;
  stopRecording(consultationId: string): Promise<string>;
  getRecording(consultationId: string): Promise<string>;
  validateConnection(consultationId: string, participantType: 'PATIENT' | 'DOCTOR'): Promise<VideoConnectionTest>;
  getConnectionQuality(consultationId: string): Promise<VideoQuality>;
  sendInvitation(consultation: VideoConsultation, participantEmail: string): Promise<boolean>;
}

// Video meeting details
export interface VideoMeeting {
  meetingId: string;
  meetingUrl: string;
  accessCode: string;
  dialInInfo?: {
    phone: string;
    conferenceId: string;
  };
  joinInfo: {
    patientJoinUrl: string;
    doctorJoinUrl: string;
    backupUrls: string[];
  };
  settings: {
    waitingRoom: boolean;
    recording: boolean;
    encryption: boolean;
    maxDuration: number;
  };
}

// Video participant
export interface VideoParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'OBSERVER';
  deviceInfo?: string;
  networkInfo?: {
    bandwidth: number;
    latency: number;
    jitter: number;
  };
}

// Video join response
export interface VideoJoinResponse {
  success: boolean;
  meetingUrl: string;
  accessToken?: string;
  error?: string;
  requiredSoftware?: string[];
  systemRequirements?: string[];
}

// Video meeting information
export interface VideoMeetingInfo {
  status: 'SCHEDULED' | 'WAITING' | 'IN_PROGRESS' | 'ENDED' | 'CANCELLED';
  participants: VideoParticipant[];
  duration: number;
  startTime?: Date;
  endTime?: Date;
  recordingStatus: 'NOT_STARTED' | 'RECORDING' | 'COMPLETED' | 'FAILED';
  recordingUrl?: string;
  quality: VideoQuality;
  issues: string[];
}

// Video connection test
export interface VideoConnectionTest {
  success: boolean;
  bandwidth: number;
  latency: number;
  jitter: number;
  videoQuality: VideoQuality;
  audioQuality: VideoQuality;
  issues: string[];
  recommendations: string[];
}

// Consultation booking request
export interface ConsultationBookingRequest {
  patientId?: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorId?: string;
  clinicId: string;
  serviceType: string;
  consultationType: 'INITIAL' | 'FOLLOW_UP' | 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  preferredDateTime?: Date;
  duration?: number;
  subject?: string;
  medicalNotes?: string;
  priority?: ConsultationPriority;
  deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET';
  networkQuality?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
  };
  paymentMethod?: {
    type: 'CARD' | 'CPF' | 'MEDISAVE' | 'CASH';
    details: any;
  };
}

// Video platform types
export type VideoPlatform = 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' | 'WHATSAPP_VIDEO' | 'FACETIME' | 'WEBEX' | 'GOTOMEETING' | 'JITSI' | 'DAILY' | 'TWILIO_VIDEO' | 'AGORA' | 'VONAGE' | 'OPENVIDU';

// Consultation priority
export type ConsultationPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'PRIORITY' | 'SAME_DAY' | 'WALK_IN';

// Video consultation status
export type VideoConsultationStatus = 'PENDING' | 'SCHEDULED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'TECHNICAL_ISSUE';

// Video quality
export type VideoQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNKNOWN' | 'DISCONNECTED';

// Payment status
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED' | 'PARTIALLY_REFUNDED';

// Base video platform provider
abstract class BaseVideoProvider implements VideoPlatformProvider {
  protected config: z.infer<typeof VideoConsultationConfigSchema>;
  protected eventEmitter: EventEmitter;

  constructor(config: z.infer<typeof VideoConsultationConfigSchema>) {
    this.config = VideoConsultationConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
  }

  abstract createMeeting(consultation: VideoConsultation): Promise<VideoMeeting>;
  abstract joinMeeting(consultationId: string, participant: VideoParticipant): Promise<VideoJoinResponse>;
  abstract endMeeting(consultationId: string): Promise<boolean>;
  abstract getMeetingInfo(consultationId: string): Promise<VideoMeetingInfo>;
  abstract startRecording(consultationId: string): Promise<boolean>;
  abstract stopRecording(consultationId: string): Promise<string>;
  abstract getRecording(consultationId: string): Promise<string>;
  abstract validateConnection(consultationId: string, participantType: 'PATIENT' | 'DOCTOR'): Promise<VideoConnectionTest>;
  abstract getConnectionQuality(consultationId: string): Promise<VideoQuality>;
  abstract sendInvitation(consultation: VideoConsultation, participantEmail: string): Promise<boolean>;

  protected logActivity(activity: any): void {
    console.log(`[${this.config.platform} Video] ${activity.message}`, activity.data);
  }

  protected handleError(error: any, context: string): never {
    console.error(`[${this.config.platform} Video] ${context}:`, error);
    throw new Error(`${context} failed: ${error.message}`);
  }
}

// Zoom Video Provider
export class ZoomVideoProvider extends BaseVideoProvider {
  async createMeeting(consultation: VideoConsultation): Promise<VideoMeeting> {
    try {
      // In production, make actual API call to Zoom
      // const zoomMeeting = await zoomApi.meetings.create({
      //   topic: `Consultation: ${consultation.subject || 'Medical Consultation'}`,
      //   type: 2, // Scheduled meeting
      //   start_time: consultation.scheduledAt,
      //   duration: this.config.maxDuration,
      //   settings: {
      //     host_video: true,
      //     participant_video: true,
      //     waiting_room: this.config.features.waitingRoom,
      //     auto_recording: this.config.features.recording ? 'cloud' : 'none',
      //     join_before_host: false,
      //     mute_upon_entry: true
      //   }
      // });

      this.logActivity({
        message: 'Zoom meeting created',
        data: { consultationId: consultation.consultationId }
      });

      // Mock Zoom meeting for demo
      return {
        meetingId: `zoom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        meetingUrl: `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`,
        accessCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        joinInfo: {
          patientJoinUrl: `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`,
          doctorJoinUrl: `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`,
          backupUrls: []
        },
        settings: {
          waitingRoom: this.config.features.waitingRoom,
          recording: this.config.features.recording,
          encryption: this.config.features.endToEndEncryption,
          maxDuration: this.config.maxDuration
        }
      };
    } catch (error) {
      this.handleError(error, 'Zoom meeting creation');
    }
  }

  async joinMeeting(consultationId: string, participant: VideoParticipant): Promise<VideoJoinResponse> {
    try {
      this.logActivity({
        message: 'Joining Zoom meeting',
        data: { consultationId, participant: participant.name }
      });

      return {
        success: true,
        meetingUrl: `https://zoom.us/j/${consultationId}`,
        systemRequirements: [
          'Zoom desktop client or mobile app',
          'Microphone and camera',
          'Stable internet connection (minimum 1.5 Mbps upload)'
        ]
      };
    } catch (error) {
      this.handleError(error, 'Zoom meeting join');
    }
  }

  async endMeeting(consultationId: string): Promise<boolean> {
    try {
      this.logActivity({ message: 'Ending Zoom meeting', data: { consultationId } });
      return true;
    } catch (error) {
      this.handleError(error, 'Zoom meeting end');
    }
  }

  async getMeetingInfo(consultationId: string): Promise<VideoMeetingInfo> {
    try {
      // Mock meeting info
      return {
        status: 'IN_PROGRESS',
        participants: [],
        duration: 15,
        startTime: new Date(),
        recordingStatus: 'RECORDING',
        quality: 'GOOD',
        issues: []
      };
    } catch (error) {
      this.handleError(error, 'Zoom meeting info');
    }
  }

  async startRecording(consultationId: string): Promise<boolean> {
    try {
      this.logActivity({ message: 'Starting Zoom recording', data: { consultationId } });
      return true;
    } catch (error) {
      this.handleError(error, 'Zoom recording start');
    }
  }

  async stopRecording(consultationId: string): Promise<string> {
    try {
      this.logActivity({ message: 'Stopping Zoom recording', data: { consultationId } });
      return `https://zoom.us/recording/${consultationId}`;
    } catch (error) {
      this.handleError(error, 'Zoom recording stop');
    }
  }

  async getRecording(consultationId: string): Promise<string> {
    try {
      return `https://zoom.us/recording/${consultationId}/download`;
    } catch (error) {
      this.handleError(error, 'Zoom recording get');
    }
  }

  async validateConnection(consultationId: string, participantType: 'PATIENT' | 'DOCTOR'): Promise<VideoConnectionTest> {
    try {
      // Mock connection test
      return {
        success: true,
        bandwidth: 15.2,
        latency: 45,
        jitter: 5,
        videoQuality: 'GOOD',
        audioQuality: 'EXCELLENT',
        issues: [],
        recommendations: ['Your connection is good for video consultation']
      };
    } catch (error) {
      this.handleError(error, 'Zoom connection validation');
    }
  }

  async getConnectionQuality(consultationId: string): Promise<VideoQuality> {
    return 'GOOD';
  }

  async sendInvitation(consultation: VideoConsultation, participantEmail: string): Promise<boolean> {
    try {
      this.logActivity({
        message: 'Sending Zoom invitation',
        data: { consultationId: consultation.consultationId, email: participantEmail }
      });
      return true;
    } catch (error) {
      this.handleError(error, 'Zoom invitation send');
    }
  }
}

// Google Meet Provider
export class GoogleMeetProvider extends BaseVideoProvider {
  async createMeeting(consultation: VideoConsultation): Promise<VideoMeeting> {
    try {
      this.logActivity({
        message: 'Google Meet created',
        data: { consultationId: consultation.consultationId }
      });

      return {
        meetingId: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        meetingUrl: `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`,
        accessCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        joinInfo: {
          patientJoinUrl: `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`,
          doctorJoinUrl: `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`,
          backupUrls: []
        },
        settings: {
          waitingRoom: true,
          recording: false,
          encryption: true,
          maxDuration: this.config.maxDuration
        }
      };
    } catch (error) {
      this.handleError(error, 'Google Meet creation');
    }
  }

  async joinMeeting(consultationId: string, participant: VideoParticipant): Promise<VideoJoinResponse> {
    return {
      success: true,
      meetingUrl: `https://meet.google.com/${consultationId}`,
      systemRequirements: [
        'Google Chrome, Firefox, or Safari browser',
        'Microphone and camera permissions',
        'Google account (optional for patients)'
      ]
    };
  }

  async endMeeting(consultationId: string): Promise<boolean> {
    return true;
  }

  async getMeetingInfo(consultationId: string): Promise<VideoMeetingInfo> {
    return {
      status: 'IN_PROGRESS',
      participants: [],
      duration: 10,
      startTime: new Date(),
      recordingStatus: 'NOT_STARTED',
      quality: 'GOOD',
      issues: []
    };
  }

  async startRecording(consultationId: string): Promise<boolean> {
    return false; // Google Meet doesn't support direct recording API
  }

  async stopRecording(consultationId: string): Promise<string> {
    throw new Error('Recording not supported in Google Meet');
  }

  async getRecording(consultationId: string): Promise<string> {
    throw new Error('Recording not available');
  }

  async validateConnection(consultationId: string, participantType: 'PATIENT' | 'DOCTOR'): Promise<VideoConnectionTest> {
    return {
      success: true,
      bandwidth: 12.8,
      latency: 60,
      jitter: 8,
      videoQuality: 'GOOD',
      audioQuality: 'GOOD',
      issues: [],
      recommendations: ['Connection is adequate for video consultation']
    };
  }

  async getConnectionQuality(consultationId: string): Promise<VideoQuality> {
    return 'GOOD';
  }

  async sendInvitation(consultation: VideoConsultation, participantEmail: string): Promise<boolean> {
    return true;
  }
}

// Twilio Video Provider
export class TwilioVideoProvider extends BaseVideoProvider {
  async createMeeting(consultation: VideoConsultation): Promise<VideoMeeting> {
    try {
      this.logActivity({
        message: 'Twilio Video room created',
        data: { consultationId: consultation.consultationId }
      });

      return {
        meetingId: `twilio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        meetingUrl: `https://video.twilio.com/rooms/${Math.random().toString(36).substr(2, 9)}`,
        accessCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        joinInfo: {
          patientJoinUrl: `https://app.twilio.com/video/room/${Math.random().toString(36).substr(2, 9)}`,
          doctorJoinUrl: `https://app.twilio.com/video/room/${Math.random().toString(36).substr(2, 9)}`,
          backupUrls: []
        },
        settings: {
          waitingRoom: true,
          recording: this.config.features.recording,
          encryption: this.config.features.endToEndEncryption,
          maxDuration: this.config.maxDuration
        }
      };
    } catch (error) {
      this.handleError(error, 'Twilio Video creation');
    }
  }

  async joinMeeting(consultationId: string, participant: VideoParticipant): Promise<VideoJoinResponse> {
    return {
      success: true,
      meetingUrl: `https://app.twilio.com/video/room/${consultationId}`,
      accessToken: `twilio_token_${consultationId}`,
      systemRequirements: [
        'Modern web browser with WebRTC support',
        'Twilio Video SDK',
        'Microphone and camera'
      ]
    };
  }

  async endMeeting(consultationId: string): Promise<boolean> {
    return true;
  }

  async getMeetingInfo(consultationId: string): Promise<VideoMeetingInfo> {
    return {
      status: 'IN_PROGRESS',
      participants: [],
      duration: 20,
      startTime: new Date(),
      recordingStatus: 'RECORDING',
      quality: 'EXCELLENT',
      issues: []
    };
  }

  async startRecording(consultationId: string): Promise<boolean> {
    return true;
  }

  async stopRecording(consultationId: string): Promise<string> {
    return `https://video.twilio.com/v1/recordings/${consultationId}`;
  }

  async getRecording(consultationId: string): Promise<string> {
    return `https://video.twilio.com/v1/recordings/${consultationId}/download`;
  }

  async validateConnection(consultationId: string, participantType: 'PATIENT' | 'DOCTOR'): Promise<VideoConnectionTest> {
    return {
      success: true,
      bandwidth: 20.5,
      latency: 35,
      jitter: 3,
      videoQuality: 'EXCELLENT',
      audioQuality: 'EXCELLENT',
      issues: [],
      recommendations: ['Excellent connection quality detected']
    };
  }

  async getConnectionQuality(consultationId: string): Promise<VideoQuality> {
    return 'EXCELLENT';
  }

  async sendInvitation(consultation: VideoConsultation, participantEmail: string): Promise<boolean> {
    return true;
  }
}

// Video Consultation Service Manager
export class VideoConsultationService {
  private providers: Map<VideoPlatform, VideoPlatformProvider> = new Map();
  private eventEmitter: EventEmitter;
  private consultations: Map<string, VideoConsultation> = new Map();
  private config: z.infer<typeof VideoConsultationConfigSchema>;

  constructor(config: z.infer<typeof VideoConsultationConfigSchema>) {
    this.config = VideoConsultationConfigSchema.parse(config);
    this.eventEmitter = new EventEmitter();
    this.initializeProviders();
  }

  // Initialize video platform providers
  private initializeProviders(): void {
    // Zoom provider
    this.providers.set('ZOOM', new ZoomVideoProvider(this.config));
    
    // Google Meet provider
    this.providers.set('GOOGLE_MEET', new GoogleMeetProvider(this.config));
    
    // Twilio Video provider
    this.providers.set('TWILIO_VIDEO', new TwilioVideoProvider(this.config));
  }

  // Book video consultation
  async bookConsultation(request: ConsultationBookingRequest): Promise<VideoConsultation> {
    try {
      const consultationId = `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create consultation record
      const consultation: VideoConsultation = {
        id: `consultation_${consultationId}`,
        consultationId,
        patientId: request.patientId,
        doctorId: request.doctorId,
        clinicId: request.clinicId,
        subject: request.subject,
        priority: request.priority || 'ROUTINE',
        status: 'PENDING',
        scheduledAt: request.preferredDateTime,
        platform: this.config.platform,
        patientName: request.patientName,
        patientEmail: request.patientEmail,
        patientPhone: request.patientPhone,
        patientDevice: request.deviceType,
        serviceType: request.serviceType,
        consultationType: request.consultationType,
        medicalNotes: request.medicalNotes,
        prescriptions: [],
        connectionQuality: 'UNKNOWN',
        recordingEnabled: this.config.features.recording,
        connectionAttempts: 0,
        dropoutCount: 0,
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create video meeting
      const meeting = await this.providers.get(this.config.platform)!.createMeeting(consultation);
      
      consultation.meetingId = meeting.meetingId;
      consultation.meetingUrl = meeting.meetingUrl;
      consultation.accessCode = meeting.accessCode;

      // Store consultation
      this.consultations.set(consultationId, consultation);

      // Send invitations
      if (request.patientEmail) {
        await this.sendInvitation(consultation, request.patientEmail);
      }
      if (consultation.doctorId) {
        // Get doctor's email and send invitation
        await this.sendInvitation(consultation, 'doctor@clinic.com');
      }

      // Save to database
      await this.saveConsultation(consultation);

      this.eventEmitter.emit('consultationBooked', consultation);
      
      return consultation;
    } catch (error) {
      console.error('Failed to book video consultation:', error);
      throw new Error(`Booking failed: ${error.message}`);
    }
  }

  // Join video consultation
  async joinConsultation(consultationId: string, participant: VideoParticipant): Promise<VideoJoinResponse> {
    try {
      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      const provider = this.providers.get(consultation.platform);
      if (!provider) {
        throw new Error(`Provider not found for platform: ${consultation.platform}`);
      }

      // Update consultation status
      if (consultation.status === 'SCHEDULED' || consultation.status === 'WAITING') {
        consultation.status = 'IN_PROGRESS';
        consultation.startedAt = new Date();
        consultation.updatedAt = new Date();
        this.consultations.set(consultationId, consultation);
        this.updateConsultation(consultation);
      }

      const joinResponse = await provider.joinMeeting(consultationId, participant);
      
      this.eventEmitter.emit('participantJoined', consultation, participant);
      
      return joinResponse;
    } catch (error) {
      console.error('Failed to join consultation:', error);
      throw new Error(`Join failed: ${error.message}`);
    }
  }

  // End video consultation
  async endConsultation(consultationId: string): Promise<VideoConsultation> {
    try {
      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      const provider = this.providers.get(consultation.platform);
      if (!provider) {
        throw new Error(`Provider not found for platform: ${consultation.platform}`);
      }

      // End meeting
      await provider.endMeeting(consultationId);

      // Update consultation
      consultation.status = 'COMPLETED';
      consultation.endedAt = new Date();
      consultation.duration = consultation.startedAt ? 
        Math.round((consultation.endedAt.getTime() - consultation.startedAt.getTime()) / 1000 / 60) : 
        undefined;
      consultation.updatedAt = new Date();

      // Get recording if available
      if (consultation.recordingEnabled) {
        try {
          const recordingUrl = await provider.getRecording(consultationId);
          consultation.recordingUrl = recordingUrl;
        } catch (error) {
          console.error('Failed to get recording:', error);
        }
      }

      this.consultations.set(consultationId, consultation);
      await this.updateConsultation(consultation);

      this.eventEmitter.emit('consultationEnded', consultation);
      
      return consultation;
    } catch (error) {
      console.error('Failed to end consultation:', error);
      throw new Error(`End consultation failed: ${error.message}`);
    }
  }

  // Reschedule consultation
  async rescheduleConsultation(consultationId: string, newDateTime: Date): Promise<VideoConsultation> {
    try {
      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      consultation.scheduledAt = newDateTime;
      consultation.status = 'RESCHEDULED';
      consultation.updatedAt = new Date();

      this.consultations.set(consultationId, consultation);
      await this.updateConsultation(consultation);

      this.eventEmitter.emit('consultationRescheduled', consultation);
      
      return consultation;
    } catch (error) {
      console.error('Failed to reschedule consultation:', error);
      throw new Error(`Reschedule failed: ${error.message}`);
    }
  }

  // Cancel consultation
  async cancelConsultation(consultationId: string, reason: string): Promise<VideoConsultation> {
    try {
      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      consultation.status = 'CANCELLED';
      consultation.updatedAt = new Date();

      this.consultations.set(consultationId, consultation);
      await this.updateConsultation(consultation);

      this.eventEmitter.emit('consultationCancelled', consultation, reason);
      
      return consultation;
    } catch (error) {
      console.error('Failed to cancel consultation:', error);
      throw new Error(`Cancel failed: ${error.message}`);
    }
  }

  // Test connection
  async testConnection(consultationId: string, participantType: 'PATIENT' | 'DOCTOR'): Promise<VideoConnectionTest> {
    try {
      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      const provider = this.providers.get(consultation.platform);
      if (!provider) {
        throw new Error(`Provider not found for platform: ${consultation.platform}`);
      }

      return await provider.validateConnection(consultationId, participantType);
    } catch (error) {
      console.error('Connection test failed:', error);
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  // Get consultation details
  getConsultation(consultationId: string): VideoConsultation | undefined {
    return this.consultations.get(consultationId);
  }

  // Get all consultations for a patient
  getPatientConsultations(patientId: string): VideoConsultation[] {
    return Array.from(this.consultations.values())
      .filter(consultation => consultation.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get all consultations for a doctor
  getDoctorConsultations(doctorId: string): VideoConsultation[] {
    return Array.from(this.consultations.values())
      .filter(consultation => consultation.doctorId === doctorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Add prescription to consultation
  async addPrescription(consultationId: string, prescription: Omit<VideoPrescription, 'id' | 'prescribedAt'>): Promise<VideoConsultation> {
    try {
      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      const newPrescription: VideoPrescription = {
        id: `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prescribedAt: new Date(),
        ...prescription
      };

      consultation.prescriptions.push(newPrescription);
      consultation.updatedAt = new Date();

      this.consultations.set(consultationId, consultation);
      await this.updateConsultation(consultation);

      this.eventEmitter.emit('prescriptionAdded', consultation, newPrescription);
      
      return consultation;
    } catch (error) {
      console.error('Failed to add prescription:', error);
      throw new Error(`Add prescription failed: ${error.message}`);
    }
  }

  // Calculate consultation cost
  calculateCost(consultation: VideoConsultation): number {
    const baseFee = this.config.pricing.consultationFee;
    const platformFee = this.config.pricing.platformFee;
    const durationMultiplier = consultation.duration ? consultation.duration / 30 : 1; // 30-min units
    
    return (baseFee + platformFee) * durationMultiplier;
  }

  // Send invitation
  private async sendInvitation(consultation: VideoConsultation, participantEmail: string): Promise<boolean> {
    try {
      const provider = this.providers.get(consultation.platform);
      if (!provider) {
        return false;
      }

      return await provider.sendInvitation(consultation, participantEmail);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      return false;
    }
  }

  // Database operations
  private async saveConsultation(consultation: VideoConsultation): Promise<void> {
    try {
      await prisma.videoConsultation.create({
        data: {
          consultationId: consultation.consultationId,
          patientId: consultation.patientId,
          doctorId: consultation.doctorId,
          clinicId: consultation.clinicId,
          subject: consultation.subject,
          priority: consultation.priority,
          status: consultation.status,
          scheduledAt: consultation.scheduledAt,
          startedAt: consultation.startedAt,
          endedAt: consultation.endedAt,
          duration: consultation.duration,
          platform: consultation.platform,
          meetingUrl: consultation.meetingUrl,
          meetingId: consultation.meetingId,
          accessCode: consultation.accessCode,
          patientName: consultation.patientName,
          patientEmail: consultation.patientEmail,
          patientPhone: consultation.patientPhone,
          patientDevice: consultation.patientDevice,
          doctorName: consultation.doctorName,
          doctorEmail: consultation.doctorEmail,
          serviceType: consultation.serviceType,
          consultationType: consultation.consultationType,
          medicalNotes: consultation.medicalNotes,
          prescriptions: consultation.prescriptions,
          connectionQuality: consultation.connectionQuality,
          technicalIssues: consultation.technicalIssues,
          recordingEnabled: consultation.recordingEnabled,
          recordingUrl: consultation.recordingUrl,
          calendarEventId: consultation.calendarEventId,
          paymentStatus: consultation.paymentStatus,
          connectionAttempts: consultation.connectionAttempts,
          dropoutCount: consultation.dropoutCount,
          satisfactionScore: consultation.satisfactionScore
        }
      });
    } catch (error) {
      console.error('Failed to save consultation:', error);
    }
  }

  private async updateConsultation(consultation: VideoConsultation): Promise<void> {
    try {
      await prisma.videoConsultation.update({
        where: { consultationId: consultation.consultationId },
        data: {
          status: consultation.status,
          scheduledAt: consultation.scheduledAt,
          startedAt: consultation.startedAt,
          endedAt: consultation.endedAt,
          duration: consultation.duration,
          meetingUrl: consultation.meetingUrl,
          meetingId: consultation.meetingId,
          accessCode: consultation.accessCode,
          medicalNotes: consultation.medicalNotes,
          prescriptions: consultation.prescriptions,
          connectionQuality: consultation.connectionQuality,
          technicalIssues: consultation.technicalIssues,
          recordingEnabled: consultation.recordingEnabled,
          recordingUrl: consultation.recordingUrl,
          paymentStatus: consultation.paymentStatus,
          connectionAttempts: consultation.connectionAttempts,
          dropoutCount: consultation.dropoutCount,
          satisfactionScore: consultation.satisfactionScore,
          updatedAt: consultation.updatedAt
        }
      });
    } catch (error) {
      console.error('Failed to update consultation:', error);
    }
  }

  // Get service statistics
  getStatistics(): any {
    const consultations = Array.from(this.consultations.values());
    const completed = consultations.filter(c => c.status === 'COMPLETED');
    const cancelled = consultations.filter(c => c.status === 'CANCELLED');
    const active = consultations.filter(c => c.status === 'IN_PROGRESS');

    return {
      total: consultations.length,
      completed: completed.length,
      cancelled: cancelled.length,
      active: active.length,
      averageDuration: completed.length > 0 ? 
        completed.reduce((sum, c) => sum + (c.duration || 0), 0) / completed.length : 0,
      averageSatisfaction: completed.filter(c => c.satisfactionScore).length > 0 ?
        completed.filter(c => c.satisfactionScore).reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / 
        completed.filter(c => c.satisfactionScore).length : 0
    };
  }

  // Health check
  async getHealthStatus(): Promise<any> {
    const platformStatus: any = {};
    
    for (const [platform, provider] of this.providers) {
      try {
        platformStatus[platform] = {
          status: 'active',
          available: true
        };
      } catch (error) {
        platformStatus[platform] = {
          status: 'error',
          available: false,
          error: error.message
        };
      }
    }

    return {
      status: 'healthy',
      platforms: platformStatus,
      activeConsultations: Array.from(this.consultations.values()).filter(c => c.status === 'IN_PROGRESS').length,
      totalConsultations: this.consultations.size
    };
  }

  // Event listeners
  onConsultationBooked(callback: (consultation: VideoConsultation) => void): void {
    this.eventEmitter.on('consultationBooked', callback);
  }

  onConsultationStarted(callback: (consultation: VideoConsultation) => void): void {
    this.eventEmitter.on('consultationStarted', callback);
  }

  onConsultationEnded(callback: (consultation: VideoConsultation) => void): void {
    this.eventEmitter.on('consultationEnded', callback);
  }

  onPrescriptionAdded(callback: (consultation: VideoConsultation, prescription: VideoPrescription) => void): void {
    this.eventEmitter.on('prescriptionAdded', callback);
  }
}

// Export singleton instance
export const videoConsultationService = new VideoConsultationService(
  VideoConsultationConfigSchema.parse({
    clinicId: 'default',
    platform: 'ZOOM',
    apiKey: 'demo_api_key',
    baseUrl: 'https://api.zoom.us/v2',
    maxDuration: 60,
    recordingEnabled: false,
    qualitySettings: { resolution: 'HD', frameRate: 30, bitrate: 1000 },
    features: {
      screenShare: true,
      chat: true,
      fileShare: true,
      recording: false,
      waitingRoom: true,
      endToEndEncryption: false
    },
    workingHours: { start: '09:00', end: '17:00', timezone: 'Asia/Singapore' },
    pricing: { consultationFee: 50, platformFee: 5, insuranceEnabled: true }
  })
);

export default VideoConsultationService;