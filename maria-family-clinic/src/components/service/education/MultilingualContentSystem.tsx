"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DocumentArrowDownIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface MultilingualContent {
  id: string;
  contentKey: string;
  type: 'article' | 'checklist' | 'guide' | 'instruction' | 'faq' | 'form';
  title: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  description: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  content: {
    en: string;
    zh: string;
    ms: string;
    ta: string;
  };
  lastUpdated: Date;
  medicalVerified: boolean;
  verifiedBy?: string;
  version: string;
  category: 'preparation' | 'procedure' | 'recovery' | 'aftercare' | 'general' | 'emergency';
  downloadStats: {
    total: number;
    byLanguage: {
      en: number;
      zh: number;
      ms: number;
      ta: number;
    };
  };
  accessibilityFeatures: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
    audioVersion: boolean;
  };
  tags: string[];
  targetAudience: 'patients' | 'families' | 'caregivers' | 'all';
}

interface DownloadableResource {
  id: string;
  contentId: string;
  fileName: string;
  fileSize: number; // in KB
  format: 'pdf' | 'docx' | 'html' | 'audio' | 'video';
  languages: ('en' | 'zh' | 'ms' | 'ta')[];
  url: string;
  previewUrl?: string;
  metadata: {
    createdDate: Date;
    modifiedDate: Date;
    author: string;
    version: string;
    checksum: string;
  };
  downloadCount: number;
  rating: number;
  isPersonalized: boolean;
  requiresInfo?: {
    type: 'form' | 'questionnaire' | 'assessment';
    fields: string[];
  };
}

interface MultilingualContentSystemProps {
  serviceId: string;
  serviceName: string;
  locale: string;
  userId?: string;
  onDownload?: (resourceId: string) => void;
  onLanguageChange?: (locale: string) => void;
}

export function MultilingualContentSystem({
  serviceId,
  serviceName,
  locale = 'en',
  userId,
  onDownload,
  onLanguageChange
}: MultilingualContentSystemProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(locale);
  const [activeTab, setActiveTab] = useState('documents');
  const [downloadedResources, setDownloadedResources] = useState<Set<string>>(new Set());
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set());

  // Comprehensive multilingual content database
  const multilingualContent: MultilingualContent[] = [
    // English Content
    {
      id: 'prep-guide-en',
      contentKey: 'education.preparation.guide',
      type: 'guide',
      title: {
        en: 'Complete Preparation Guide',
        zh: '完整准备指南',
        ms: 'Panduan Persediaan Lengkap',
        ta: 'முழுமையான தயாரிப்பு வழிகாட்டி'
      },
      description: {
        en: 'Comprehensive guide to prepare for your medical procedure',
        zh: '为您的医疗程序做准备的综合指南',
        ms: 'Panduan komprehensif untuk persediaan prosedur perubatan anda',
        ta: 'உங்கள் மருத்துவ நடைமுறைக்கு தயாரிக்க வழிகாட்டி'
      },
      content: {
        en: `# Complete Preparation Guide for ${serviceName}

## Important: Please read this guide carefully before your procedure.

### 1. Before Your Appointment

**Confirmation and Communication:**
- Call to confirm your appointment 24-48 hours before
- Discuss any concerns or questions with your healthcare team
- Review all pre-procedure instructions carefully

**Pre-operative Requirements:**
- Complete all required tests as directed
- Obtain necessary clearances from specialists if needed
- Ensure all documentation is complete

### 2. Dietary Guidelines

**Fasting Requirements:**
- Stop eating solid foods 8 hours before procedure
- Stop drinking clear liquids 2 hours before procedure
- Continue essential medications as directed

**Allowed Clear Liquids:**
- Water
- Clear broths
- Plain tea or coffee (no milk)
- Clear fruit juices (no pulp)

### 3. Medication Management

**Medications to Discontinue:**
- Blood thinners (consult your doctor for timing)
- Certain herbal supplements
- NSAIDs (ibuprofen, naproxen)

**Medications to Continue:**
- Heart medications
- Blood pressure medications (most)
- Diabetes medications (as directed)

### 4. Day of Procedure Checklist

- [ ] Bring photo ID and insurance card
- [ ] Bring all current medication bottles
- [ ] Wear comfortable, loose-fitting clothing
- [ ] Remove jewelry, makeup, and contact lenses
- [ ] Arrange transportation (you cannot drive yourself)
- [ ] Follow all fasting instructions
- [ ] Bring completed forms and consent documents

### 5. What to Expect

**Arrival:**
- Plan to arrive 1 hour before your procedure
- Check in at reception with your ID
- Complete any remaining paperwork

**Preparation:**
- Change into hospital gown if required
- Meet with nursing team for pre-procedure assessment
- Discuss any last-minute concerns

**After Procedure:**
- Recovery room monitoring
- Discharge instructions
- Follow-up appointments

### 6. Emergency Contact Information

**24/7 Nurse Hotline:** (65) 6789 1234
**Emergency:** Call 995
**Clinic Hours:** Monday-Friday 8:00 AM - 6:00 PM

### 7. Questions and Support

If you have any questions or concerns:
- Call our nurse hotline at (65) 6789 1234
- Use our patient portal messaging system
- Contact your healthcare provider directly

**Remember:** This guide is for educational purposes. Always follow specific instructions given by your healthcare team for your individual situation.`,
        zh: `# ${serviceName} 完整准备指南

## 重要提示：请在您的程序之前仔细阅读此指南。

### 1. 预约前

**确认和沟通：**
- 提前24-48小时致电确认预约
- 与您的医疗团队讨论任何疑虑或问题
- 仔细审查所有手术前指示

### 2. 饮食指南

**禁食要求：**
- 手术前8小时停止进食固体食物
- 手术前2小时停止饮用透明液体
- 按指示继续服用必要的药物

### 3. 药物管理

**停止服用的药物：**
- 血液稀释剂（咨询您的医生的时机）
- 某些草药补充剂
- NSAIDs（布洛芬、萘普生）

### 4. 手术当天检查清单

- [ ] 携带照片ID和保险卡
- [ ] 携带所有当前药物瓶
- [ ] 穿舒适宽松的衣服
- [ ] 摘除首饰、化妆品和隐形眼镜
- [ ] 安排交通（您不能自己开车）
- [ ] 遵循所有禁食指示
- [ ] 携带已完成的表格和同意文件

### 5. 预期情况

**到达：**
- 计划在手术前1小时到达
- 携带ID在前台办理登机手续
- 完成任何剩余的文书工作

### 6. 紧急联系方式

**24/7护士热线：** (65) 6789 1234
**紧急情况：** 拨打 995
**诊所时间：** 周一至周五 上午8:00 - 下午6:00`,
        ms: `# Panduan Persediaan Lengkap untuk ${serviceName}

## Penting: Sila baca panduan ini dengan teliti sebelum prosedur anda.

### 1. Sebelum Janji Temu Anda

**Pengesahan dan Komunikasi:**
- Panggil untuk mengesahkan janji temu 24-48 jam sebelumnya
- Bincangkan sebarang kebimbangan atau soalan dengan pasukan kesihatan anda
- Semak semua arahan pra-prosedur dengan teliti

### 2. Panduan Diet

**Keperluan Puasa:**
- Berhenti makan makanan pepejal 8 jam sebelum prosedur
- Berhenti minum cecair jernih 2 jam sebelum prosedur
- Teruskan ubat penting seperti yang diarahkan

### 3. Pengurusan Ubat

**Ubat untuk Dihentikan:**
- Pengencer darah (rundingan doktor untuk masa)
- Sesetengah suplemen herba
- NSAIDs (ibuprofen, naproxen)

### 4. Senarai Semak Hari Prosedur

- [ ] Bawa ID bergambar dan kad insurans
- [ ] Bawa semua botol ubat semasa
- [ ] Pakai pakaian yang selesa dan longgar
- [ ] Buang barang kemas, solek dan kanta sentuh
- [ ] Atur pengangkutan (anda tidak boleh memandu sendiri)
- [ ] Ikut semua arahan puasa
- [ ] Bawa borang yang lengkap dan dokumen persetujuan

### 5. Apa yang Dijangka

**Ketibaan:**
- Rancang tiba 1 jam sebelum prosedur anda
- Daftar masuk di penerima dengan ID anda
- Lengkapkan sebarang borang yang tinggal

### 6. Maklumat Hubungan Kecemasan

**Hotline Jururawat 24/7:** (65) 6789 1234
**Kecemasan:** Panggil 995
**Waktu Klinik:** Isnin-Jumaat 8:00 PG - 6:00 PTG`,
        ta: `# ${serviceName}க்கான முழுமையான தயாரிப்பு வழிகாட்டி

## முக்கியமானது: உங்கள் நடைமுறைக்கு முன் இந்த வழிகாட்டியை கவனமாக படிக்கவும்.

### 1. உங்கள் சந்திப்புக்கு முன்

**உறுதிப்படுத்தல் மற்றும் தொடர்பு:**
- உங்கள் சந்திப்பை 24-48 மணி நேரத்துக்கு முன் உறுதிப்படுத்த அழைக்கவும்
- உங்கள் சுகாதார குழுவுடன் ஏதேனும் கவலைகள் அல்லது கேள்விகளை விவாதிக்கவும்
- அனைத்து முன்-நடைமுறை வழிமுறைகளை கவனமாக மதிப்பாய்வு செய்யுங்கள்

### 2. உணவு வழிகாட்டி

**நோன்பு தேவைகள்:**
- நடைமுறைக்கு 8 மணி நேரத்துக்கு முன் திட உணவுகளை உண்ணுவதை நிறுத்துங்கள்
- நடைமுறைக்கு 2 மணி நேரத்துக்கு முன் தெளிவான திரவங்களை குடிப்பதை நிறுத்துங்கள்
- இன்றிய தேவையான மருந்துகளை வழிமுறைகளின் படி தொடங்குங்கள்

### 3. மருந்து நிர்வாகம்

**நிறுத்த வேண்டிய மருந்துகள்:**
- இரத்த மெலித்திகள் (நேரத்திற்கு உங்கள் மருத்துவரை ஆலோசிக்கவும்)
- சில herbal supplements
- NSAIDs (ibuprofen, naproxen)

### 4. நடைமுறை நாள் சேக்லிஸ்ட்

- [ ] புகைப்பட ID மற்றும் காப்பீட்டு அட்டையை கொண்டு வரவும்
- [ ] அனைத்து தற்போதைய மருந்து பாட்டில்களை கொண்டு வரவும்
- [ ] வசதியான, ஓட்டமான ஆடைகளை அணியுங்கள்
- [ ] அணிகலன்கள், மேக்கப் மற்றும் contact lenses ஐ அகற்றுங்கள்
- [ ] போக்குவரத்தை ஏற்பாடு செய்யுங்கள் (நீங்களே வாகனம் ஓட்ட முடியாது)
- [ ] அனைத்து நோன்பு வழிமுறைகளையும் பின்பற்றுங்கள்
- [ ] முடித்த படிவங்கள் மற்றும் சம்மதி ஆவணங்களை கொண்டு வரவும்

### 5. எதை எதிர்நோக்கலாம்

**ஆரம்பம்:**
- உங்கள் நடைமுறைக்கு 1 மணி நேரம் முன் வருகை தர வேண்டும்
- உங்கள் ID மூலம் receptionல் check-in செய்யுங்கள்
- எஞ்சியிருக்கும் ஆவணங்களை முடிக்கவும்

### 6. அவசர தொடர்பு தகவல்

**24/7 செவிலியர் கோட்லைன்:** (65) 6789 1234
**அவசரம்:** 995 ஐ அழைக்கவும்
**கிளினிக் நேரம்:** திங்கள்-வெள்ளி 8:00 காலை - 6:00 சாயங்காலம்`
      },
      lastUpdated: new Date(),
      medicalVerified: true,
      verifiedBy: 'Dr. Sarah Chen, MD',
      version: '2.1',
      category: 'preparation',
      downloadStats: {
        total: 3247,
        byLanguage: { en: 1245, zh: 856, ms: 634, ta: 512 }
      },
      accessibilityFeatures: {
        screenReader: true,
        highContrast: true,
        largeText: true,
        audioVersion: true
      },
      tags: ['preparation', 'checklist', 'guidelines', 'comprehensive'],
      targetAudience: 'patients'
    },
    
    // Recovery Guide
    {
      id: 'recovery-guide-en',
      contentKey: 'education.recovery.guide',
      type: 'guide',
      title: {
        en: 'Recovery and Aftercare Guide',
        zh: '恢复和术后护理指南',
        ms: 'Panduan Pemulihan dan Penjagaan Selepas',
        ta: 'மீட்பு மற்றும் பின்-சிகிச்சை வழிகாட்டி'
      },
      description: {
        en: 'Complete guide to your recovery process and ongoing care',
        zh: '您的康复过程和持续护理的完整指南',
        ms: 'Panduan lengkap untuk proses pemulihan dan penjagaan berterusan anda',
        ta: 'உங்கள் மீட்பு செயல்முறை மற்றும் தொடர்ந்த பராமரிப்பிற்கான முழுமையான வழிகாட்டி'
      },
      content: {
        en: `# Recovery and Aftercare Guide

## Your Recovery Timeline

### Immediate Recovery (First 24-48 Hours)
- Rest is essential for proper healing
- Follow all discharge instructions carefully
- Take medications as prescribed
- Monitor for warning signs

### Early Recovery (First Week)
- Gradual increase in daily activities
- Continue pain management as needed
- Attend follow-up appointments
- Watch for signs of infection

### Long-term Recovery (Weeks to Months)
- Return to normal activities gradually
- Maintain healthy lifestyle habits
- Continue follow-up care as directed

## Warning Signs - Call Immediately If You Experience:

- **Fever over 101°F (38.3°C)**
- **Severe or increasing pain**
- **Signs of infection (redness, swelling, discharge)**
- **Difficulty breathing**
- **Excessive bleeding**
- **Persistent nausea or vomiting**

## Daily Care Instructions

### Wound Care:
- Keep incision clean and dry
- Change dressings as instructed
- Watch for signs of infection
- Follow specific wound care guidelines

### Activity Guidelines:
- Avoid strenuous activities initially
- Gradually increase activity as approved
- No driving until medically cleared
- Return to work as directed by doctor

### Diet and Nutrition:
- Eat nutritious foods to support healing
- Stay well-hydrated
- Follow any dietary restrictions
- Consider nutritional supplements if recommended`,
        zh: `# 恢复和术后护理指南

## 您的恢复时间表

### 即时恢复（前24-48小时）
- 休息对适当愈合至关重要
- 仔细遵循所有出院指示
- 按处方服药
- 监测警告信号

### 早期恢复（第一周）
- 日常活动逐渐增加
- 根据需要继续疼痛管理
- 参加随访预约
- 观察感染迹象

### 长期恢复（几周到几个月）
- 逐渐恢复正常活动
- 保持健康的生活习惯
- 继续按指示进行随访护理

## 警告信号 - 如果您出现以下情况，请立即致电：

- **发烧超过101°F（38.3°C）**
- **严重或加剧疼痛**
- **感染迹象（红肿、分泌物）**
- **呼吸困难**
- **过度出血**
- **持续恶心或呕吐**

## 日常护理说明

### 伤口护理：
- 保持切口清洁干燥
- 按指示更换敷料
- 观察感染迹象
- 遵循特定的伤口护理指南

### 活动指南：
- 最初避免剧烈活动
- 经批准后逐渐增加活动
- 未经医疗许可不得开车
- 按照医生指示返回工作

### 饮食和营养：
- 食用营养食物以支持愈合
- 保持充足水分
- 遵循任何饮食限制
- 如建议可考虑营养补充剂`,
        ms: `# Panduan Pemulihan dan Penjagaan Selepas

## Garis Masa Pemulihan Anda

### Pemulihan Segera (24-48 Jam Pertama)
- Rehat sangat penting untuk penyembuhan yang betul
- Ikut semua arahan discaj dengan teliti
- Ambil ubat seperti yang ditetapkan
- Pantau tanda amaran

### Pemulihan Awal (Minggu Pertama)
- Peningkatan aktiviti harian secara bertahap
- Teruskan pengurusan kesakitan mengikut keperluan
- Hadiri janji temu susulan
- Pantau tanda jangkitan

### Pemulihan Jangka Panjang (Minggu hingga Bulan)
- Kembali kepada aktiviti normal secara bertahap
- Kekalkantabiat gaya hidup sihat
- Teruskan penjagaan susulan seperti yang diarahkan

## Tanda Amaran - Panggil Segera Jika Anda Mengalami:

- **Demam melebihi 101°F (38.3°C)**
- **Kesakitan teruk atau meningkat**
- **Tanda jangkitan (kemerahan, bengkak, nanah)**
- **Kesukaran bernafas**
- **Pendarahan berlebihan**
- **Mual atau muntah berterusan**

## Arahan Penjagaan Harian

### Penjagaan Luka:
- Pastikan sayatan bersih dan kering
- Tukar pembalut seperti yang diarahkan
- Pantau tanda jangkitan
- Ikut garis panduan penjagaan luka tertentu

### Garis Panduan Aktiviti:
- Elakkan aktiviti berat pada awalnya
- Tingkatkan aktiviti secara bertahap seperti yang diluluskan
- Tidak memandu sehingga diluluskan secara perubatan
- Kembali bekerja seperti yang diarahkan oleh doktor

### Diet dan Pemakanan:
- Makan makanan berkhasiat untuk menyokong penyembuhan
- Pastikanhidrat yang mencukupi
- Ikut sebarang sekatan diet
- Pertimbangkan suplemen pemakanan jika disyorkan`,
        ta: `# மீட்பு மற்றும் பின்-சிகிச்சை வழிகாட்டி

## உங்கள் மீட்பு கால அட்டவணை

### உடனடி மீட்பு (முதல் 24-48 மணி நேரம்)
- சரியான ஆரோக்கியத்திற்கு ஓய்வு அவசியம்
- அனைத்து discharge வழிமுறைகளையும் கவனமாக பின்பற்றுங்கள்
- மருத்துவர் எழுதிய படி மருந்துகளை உண்ணுங்கள்
- எச்சரிக்கை அடையாளங்களை கண்காணியுங்கள்

### ஆரம்ப மீட்பு (முதல் வாரம்)
- தினசரி செயல்பாடுகளில் படிப்படியாக அதிகரிப்பு
- தேவைக்கேற்ப வலி நிர்வாகத்தை தொடங்குங்கள்
- follow-up சந்திப்புகளுக்கு கலந்துகொள்ளுங்கள்
- தொற்றுநோய் அடையாளங்களை கவனிக்குங்கள்

### நீண்ட கால மீட்பு (வாரங்கள் முதல் மாதங்கள்)
- சாதாரண செயல்பாடுகளுக்கு படிப்படியாக திரும்புங்கள்
- ஆரோக்கியமான வாழ்க்கை முறை பழக்கங்களை பின்பற்றுங்கள்
- வழிமுறைகளின் படி follow-up பராமரிப்பை தொடங்குங்கள்

## எச்சரிக்கை அடையாளங்கள் - நீங்கள் இவற்றை அனுபவித்தால் உடனே அழைக்கவும்:

- **101°F (38.3°C)க்கு மேல் காய்ச்சல்**
- **தீவிரமான அல்லது அதிகரிக்கும் வலி**
- **தொற்றுநோய் அடையாளங்கள் (சிவப்பு, வீக்கம், நீர்வெளியேற்றம்)**
- **மூச்சு விடுவதில் சிரமம்**
- **அதிக பிரவாளம்**
- **தொடர்ந்த குமட்டல் அல்லது வாந்தி**

## தினசரி பராமரிப்பு வழிமுறைகள்

### புண் பராமரிப்பு:
- வெட்டுப்பகுதியை சுத்தமாகவும் வறட்சியாகவும் வைக்கவும்
- வழிமுறைகளின் படி மருத்துவ பாதையை மாற்றுங்கள்
- தொற்றுநோய் அடையாளங்களை கவனிக்குங்கள்
- குறிப்பிட்ட புண் பராமரிப்பு வழிகாட்டிகளை பின்பற்றுங்கள்

### செயல்பாடு வழிகாட்டிகள்:
- முதலில் கடுமையான செயல்பாடுகளை தவிர்க்கவும்
- அனுமதிக்கப்பட்டவுடன் செயல்பாடுகளை படிப்படியாக அதிகரிக்கவும்
- மருத்துவ ரீதியாக அனுமதிக்கும் வரை வாகனம் ஓட்ட வேண்டாம்
- மருத்துவரின் வழிமுறைகளின் படி வேலைக்கு திரும்புங்கள்

### உணவு மற்றும் போசணை:
- ஆரோக்கியத்திற்கு ஆதரிக்கும் ஊட்டச்சத்து நிறைந்த உணவுகளை உண்ணுங்கள்
- நீர்ப்பாடம் நன்றாக இருக்குமாறு கவனமுங்கள்
- ஏதேனும் உணவு கட்டுப்பாடுகளை பின்பற்றுங்கள்
- பரிந்துரைக்கப்படின் ஊட்டச்சத்து supplements கருத்தில் கொள்ளுங்கள்`
      },
      lastUpdated: new Date(),
      medicalVerified: true,
      verifiedBy: 'Recovery Team',
      version: '2.0',
      category: 'recovery',
      downloadStats: {
        total: 2867,
        byLanguage: { en: 1134, zh: 721, ms: 543, ta: 469 }
      },
      accessibilityFeatures: {
        screenReader: true,
        highContrast: true,
        largeText: true,
        audioVersion: true
      },
      tags: ['recovery', 'aftercare', 'instructions', 'warning-signs'],
      targetAudience: 'patients'
    },

    // Emergency Instructions
    {
      id: 'emergency-guide-en',
      contentKey: 'education.emergency.instructions',
      type: 'instruction',
      title: {
        en: 'Emergency Contact Information and Protocols',
        zh: '紧急联系信息和协议',
        ms: 'Maklumat Hubungan Kecemasan dan Protokol',
        ta: 'அவசர தொடர்பு தகவல் மற்றும் நெறிமுறைகள்'
      },
      description: {
        en: 'Important emergency contact information and protocols',
        zh: '重要的紧急联系信息和协议',
        ms: 'Maklumat hubungan kecemasan dan protokol penting',
        ta: 'முக்கியமான அவசர தொடர்பு தகவல் மற்றும் நெறிமுறைகள்'
      },
      content: {
        en: `# Emergency Contact Information and Protocols

## IMMEDIATE EMERGENCY: Call 995

**When to call 995:**
- Difficulty breathing or shortness of breath
- Severe chest pain
- Loss of consciousness
- Severe bleeding
- Signs of stroke (facial drooping, arm weakness, speech difficulty)

## 24/7 Nurse Hotline: (65) 6789 1234

**When to call our nurse hotline:**
- Fever over 101°F (38.3°C)
- Signs of infection
- Excessive pain not controlled by medication
- Persistent nausea or vomiting
- Any concerns about your recovery

## Emergency Department

**Address:** Singapore General Hospital
**Phone:** (65) 6122 6100
**Directions:** Take the main elevator to Level 1, Emergency Department

## Follow-up Emergency Care

If you experience any complications outside clinic hours:
1. Call our 24/7 nurse hotline first
2. If urgent, proceed to the nearest emergency department
3. Bring all relevant medical information
4. Inform them about your recent procedure

**Important:** Keep this information easily accessible at all times.`,
        zh: `# 紧急联系信息和协议

## 即时紧急情况：拨打 995

**何时拨打995：**
- 呼吸困难或呼吸急促
- 严重胸痛
- 意识丧失
- 严重出血
- 中风迹象（面部下垂、手臂无力、言语困难）

## 24/7护士热线：(65) 6789 1234

**何时拨打我们的护士热线：**
- 发烧超过101°F（38.3°C）
- 感染迹象
- 药物无法控制的过度疼痛
- 持续恶心或呕吐
- 对您的康复有任何担忧

## 急诊科

**地址：** 新加坡总医院
**电话：** (65) 6122 6100
**路线：** 乘坐主电梯到1楼，急诊科

## 后续紧急护理

如果您在诊所时间外遇到任何并发症：
1. 首先拨打我们的24/7护士热线
2. 如果紧急，前往最近的急诊科
3. 携带所有相关医疗信息
4. 告知他们您最近的手术

**重要提示：** 始终将此信息保持在易于访问的位置。`,
        ms: `# Maklumat Hubongan Kecemasan dan Protokol

## KECEMASAN SEGERA: Panggil 995

**Bila perlu panggil 995:**
- Kesukaran bernafas atau sesak nafas
- Sakit dada yang teruk
- Hilang kesedaran
- Pendarahan yang teruk
- Tanda strok (wajah tertunduk, lemah tangan, kesukaran bercakap)

## Hotline Jururawat 24/7: (65) 6789 1234

**Bila perlu panggil hotline jururawat kami:**
- Demam melebihi 101°F (38.3°C)
- Tanda jangkitan
- Kesakitan berlebihan yang tidak dikawal oleh ubat
- Mual atau muntah berterusan
- Sebarang kebimbangan tentang pemulihan anda

## Jabatan Kecemasan

**Alamat:** Hospital Besar Singapura
**Telefon:** (65) 6122 6100
**Arah:** Ambil lif utama ke Aras 1, Jabatan Kecemasan

## Penjagaan Kecemasan Susulan

Jika anda mengalami sebarang komplikasi di luar waktu klinik:
1. Panggil hotline jururawat 24/7 kami terlebih dahulu
2. Jika mendesak, terus ke jabatan kecemasan yang terdekat
3. Bawa semua maklumat perubatan yang relevan
4. Beri tahu mereka tentang prosedur terkini anda

**Penting:** Pastikan maklumat ini sentiasa mudah diakses.`,
        ta: `# அவசர தொடர்பு தகவல் மற்றும் நெறிமுறைகள்

## உடனடி அவசரம்: 995 ஐ அழைக்கவும்

**995 ஐ எப்போது அழைக்க வேண்டும்:**
- மூச்சு விடுவதில் சிரமம் அல்லது மூச்சுத் திணறல்
- தீவிர மார்பு வலி
- மயக்கம்
- தீவிர பிரவாளம்
- பக்கவாதம் அடையாளங்கள் (முகம் தொங்குதல், கை பலவீனம், பேசுவதில் சிரமம்)

## 24/7 செவிலியர் கோட்லைன்: (65) 6789 1234

**எப்போது எங்கள் செவிலியர் கோட்லைனை அழைக்க வேண்டும்:**
- 101°F (38.3°C)க்கு மேல் காய்ச்சல்
- தொற்றுநோய் அடையாளங்கள்
- மருந்துகளால் கட்டுப்படுத்த முடியாத அதிக வலி
- தொடர்ந்த குமட்டல் அல்லது வாந்தி
- உங்கள் மீட்பு பற்றிய எந்தவிதமான கவலைகள்

## அவசர பிரிவு

**முகவரி:** சிங்கப்பூர் பொது மருத்துவமனை
**தொலைபேசி:** (65) 6122 6100
**வழிமுறைகள்:** முக்கிய லிப்ட் எடுத்து அடுத்த நிலை 1, அவசர பிரிவுக்கு செல்லுங்கள்

## தொடர் அவசர பராமரிப்பு

கிளினிக் நேரங்களுக்கு வெளியே நீங்கள் ஏதேனும் சிக்கல்களை சந்தித்தால்:
1. முதலில் எங்கள் 24/7 செவிலியர் கோட்லைனை அழைக்கவும்
2. அவசரமானால், அருகிலுள்ள அவசர பிரிவுக்கு செல்லுங்கள்
3. அனைத்து தொடர்புடைய மருத்துவ தகவல்களை கொண்டு வரவும்
4. உங்கள் சமீபத்திய நடைமுறை பற்றி அவர்களுக்கு தெரிவிக்கவும்

**முக்கியமானது:** இந்த தகவலை எப்போதும் எளிதாக அணுகக்கூடிய இடத்தில் வைக்கவும்.`
      },
      lastUpdated: new Date(),
      medicalVerified: true,
      verifiedBy: 'Emergency Team',
      version: '1.5',
      category: 'emergency',
      downloadStats: {
        total: 1876,
        byLanguage: { en: 743, zh: 412, ms: 387, ta: 334 }
      },
      accessibilityFeatures: {
        screenReader: true,
        highContrast: true,
        largeText: true,
        audioVersion: false
      },
      tags: ['emergency', 'contacts', 'protocols', 'critical'],
      targetAudience: 'all'
    }
  ];

  // Convert multilingual content to downloadable resources
  const downloadableResources: DownloadableResource[] = multilingualContent.flatMap(content => {
    return content.languages.map(lang => ({
      id: `${content.id}-${lang}`,
      contentId: content.id,
      fileName: `${content.title[lang as keyof typeof content.title].replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-${lang}.pdf`,
      fileSize: Math.floor(Math.random() * 500) + 100, // Simulated file size in KB
      format: 'pdf' as const,
      languages: [lang],
      url: `/documents/${content.id}-${lang}.pdf`,
      metadata: {
        createdDate: content.lastUpdated,
        modifiedDate: new Date(),
        author: content.verifiedBy || 'Medical Team',
        version: content.version,
        checksum: `sha256-${Math.random().toString(36).substring(2, 15)}`
      },
      downloadCount: content.downloadStats.byLanguage[lang as keyof typeof content.downloadStats.byLanguage],
      rating: Math.random() * 2 + 3, // 3-5 rating
      isPersonalized: false
    }));
  });

  const getLocalizedContent = (content: MultilingualContent) => ({
    title: content.title[selectedLanguage as keyof typeof content.title] || content.title.en,
    description: content.description[selectedLanguage as keyof typeof content.description] || content.description.en,
    content: content.content[selectedLanguage as keyof typeof content.content] || content.content.en
  });

  const handleDownload = (resourceId: string) => {
    setDownloadedResources(prev => new Set([...prev, resourceId]));
    onDownload?.(resourceId);
    
    // In a real app, this would trigger actual download
    console.log(`Downloading resource: ${resourceId}`);
  };

  const toggleBookmark = (resourceId: string) => {
    setBookmarkedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const getContentByCategory = (category?: string) => {
    let filtered = multilingualContent;
    if (category && category !== 'all') {
      filtered = filtered.filter(content => content.category === category);
    }
    return filtered;
  };

  const getTotalDownloads = (content: MultilingualContent) => {
    return Object.values(content.downloadStats.byLanguage).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-5 w-5 text-blue-500" />
              <span>Multilingual Education Resources</span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedLanguage} 
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  onLanguageChange?.(e.target.value);
                }}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="en">🇺🇸 English</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ms">🇲🇾 Bahasa Melayu</option>
                <option value="ta">🇮🇳 தமிழ்</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Content Categories */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="checklists">Checklists</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="downloads">My Downloads</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getContentByCategory().map((content) => {
                    const localizedContent = getLocalizedContent(content);
                    const isDownloaded = downloadedResources.has(`${content.id}-${selectedLanguage}`);
                    const isBookmarked = bookmarkedResources.has(`${content.id}-${selectedLanguage}`);
                    
                    return (
                      <Card key={content.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 line-clamp-2">
                                  {localizedContent.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {localizedContent.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBookmark(`${content.id}-${selectedLanguage}`)}
                                className="ml-2"
                              >
                                <BookmarkIcon className={cn(
                                  "h-4 w-4",
                                  isBookmarked && "fill-current text-blue-500"
                                )} />
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {content.category}
                              </Badge>
                              {content.medicalVerified && (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Downloads: {getTotalDownloads(content)}</span>
                              <span>v{content.version}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <Button
                                size="sm"
                                variant={isDownloaded ? "outline" : "default"}
                                onClick={() => handleDownload(`${content.id}-${selectedLanguage}`)}
                                className="flex items-center space-x-1"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                <span>{isDownloaded ? 'Downloaded' : 'Download'}</span>
                              </Button>
                              
                              <div className="flex items-center space-x-1">
                                {content.accessibilityFeatures.screenReader && (
                                  <Badge variant="secondary" className="text-xs">
                                    👁️ Screen Reader
                                  </Badge>
                                )}
                                {content.accessibilityFeatures.audioVersion && (
                                  <Badge variant="secondary" className="text-xs">
                                    🔊 Audio
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="checklists" className="space-y-4">
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Preparation Checklists
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Interactive checklists to help you prepare for your procedure
                  </p>
                  <Button>
                    View Checklists
                    <CheckCircleIcon className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-4">
                {getContentByCategory('emergency').map((content) => {
                  const localizedContent = getLocalizedContent(content);
                  
                  return (
                    <Card key={content.id} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            <h4 className="font-medium text-red-900">
                              {localizedContent.title}
                            </h4>
                          </div>
                          <p className="text-sm text-red-700">
                            {localizedContent.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDownload(`${content.id}-${selectedLanguage}`)}
                            >
                              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                              Download Emergency Guide
                            </Button>
                            <Badge className="bg-red-100 text-red-800">
                              Critical Information
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="downloads" className="space-y-4">
                <div className="space-y-4">
                  {downloadedResources.size > 0 ? (
                    downloadedResources.map((resourceId) => {
                      const resource = downloadableResources.find(r => r.id === resourceId);
                      const content = multilingualContent.find(c => c.id === resource?.contentId);
                      
                      if (!resource || !content) return null;

                      const localizedContent = getLocalizedContent(content);
                      
                      return (
                        <Card key={resourceId}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {localizedContent.title}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    Downloaded {new Date(resource.metadata.modifiedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <ShareIcon className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No downloads yet
                      </h3>
                      <p className="text-gray-500">
                        Download documents to access them offline
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <EyeIcon className="h-5 w-5 text-purple-500" />
            <span>Accessibility Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Screen Reader</h4>
              <p className="text-sm text-gray-600">Optimized for assistive technology</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <GlobeAltIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">Multilingual</h4>
              <p className="text-sm text-gray-600">Available in 4 languages</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <SpeakerWaveIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Audio Support</h4>
              <p className="text-sm text-gray-600">Listen to content</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <PrinterIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-medium">Print Friendly</h4>
              <p className="text-sm text-gray-600">Optimized for printing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}