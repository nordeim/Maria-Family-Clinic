// Health Profile System - Component Exports
// Complete export file for all health profile components

// Main Components
export { default as HealthProfileDashboard } from './HealthProfileDashboard';
export { default as HealthAssessmentForm } from './HealthAssessmentForm';
export { default as GoalSettingWizard } from './GoalSettingWizard';
export { default as HealthProgressChart } from './HealthProgressChart';
export { default as HealthMetricsTracker } from './HealthMetricsTracker';
export { default as HealthRecommendation } from './HealthRecommendation';
export { default as HealthGoalCard } from './HealthGoalCard';
export { default as HealthAlert } from './HealthAlert';

// Type Definitions
export * from './types';

// Re-export commonly used UI components that may be needed
export { Button } from '@/components/ui/button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export { Badge } from '@/components/ui/badge';
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export { Progress } from '@/components/ui/progress';
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { ScrollArea } from '@/components/ui/scroll-area';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';