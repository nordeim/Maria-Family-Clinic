// Barrel export file for Healthier SG Program Information Components
// All components and types are exported for easy importing

// Types
export type * from './types';

// Main Components
export { HealthierSGOverview } from './HealthierSGOverview';
export { BenefitExplanation } from './BenefitExplanation';
export { ProgramComparisonTool } from './ProgramComparisonTool';
export { SuccessStories } from './SuccessStories';
export { ProgramTimeline } from './ProgramTimeline';
export { FAQSection } from './FAQSection';
export { ResourceDownload } from './ResourceDownload';
export { ProgramNews } from './ProgramNews';
export { ProgramGuide } from './ProgramGuide';
export { InteractiveGuide } from './InteractiveGuide';

// Demo and System Components
export { default as HealthierSGProgramInfoDemo } from './HealthierSGProgramInfoDemo';

// Component Props Types (re-export for convenience)
export type { ProgramComparisonToolProps } from './ProgramComparisonTool';
export type { FAQSectionProps } from './FAQSection';
export type { ResourceDownloadProps } from './ResourceDownload';
export type { ProgramNewsProps } from './ProgramNews';
export type { ProgramGuideProps } from './ProgramGuide';
export type { InteractiveGuideProps } from './InteractiveGuide';

// Note: HealthierSGOverview, BenefitExplanation, SuccessStories, ProgramTimeline 
// use base ProgramInfoComponentProps from types.ts