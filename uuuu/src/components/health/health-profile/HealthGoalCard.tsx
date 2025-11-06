'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Target, Calendar, TrendingUp, CheckCircle, Circle, Edit, Trash2, Pause, Play, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  category: 'weight' | 'fitness' | 'nutrition' | 'chronic-disease' | 'mental-health' | 'preventive-care';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  progress: number; // 0-100
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate: string;
  targetDate: string;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
    targetDate: string;
  }>;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
  reminders: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
  };
}

interface HealthGoalCardProps {
  goal: HealthGoal;
  onGoalUpdate?: (goalId: string, updates: Partial<HealthGoal>) => void;
  onGoalDelete?: (goalId: string) => void;
  onGoalPause?: (goalId: string) => void;
  onGoalResume?: (goalId: string) => void;
  onGoalComplete?: (goalId: string) => void;
  onMilestoneUpdate?: (goalId: string, milestoneId: string, completed: boolean) => void;
  className?: string;
}

const categoryColors = {
  weight: 'bg-blue-100 text-blue-800',
  fitness: 'bg-green-100 text-green-800',
  nutrition: 'bg-orange-100 text-orange-800',
  'chronic-disease': 'bg-red-100 text-red-800',
  'mental-health': 'bg-purple-100 text-purple-800',
  'preventive-care': 'bg-cyan-100 text-cyan-800'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-red-400'
};

const categoryIcons = {
  weight: Target,
  fitness: TrendingUp,
  nutrition: Target,
  'chronic-disease': Target,
  'mental-health': Target,
  'preventive-care': Target
};

export default function HealthGoalCard({
  goal,
  onGoalUpdate,
  onGoalDelete,
  onGoalPause,
  onGoalResume,
  onGoalComplete,
  onMilestoneUpdate,
  className
}: HealthGoalCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: HealthGoal['status']) => {
    setIsUpdating(true);
    
    try {
      switch (newStatus) {
        case 'paused':
          onGoalPause?.(goal.id);
          toast.success('Goal paused');
          break;
        case 'active':
          onGoalResume?.(goal.id);
          toast.success('Goal resumed');
          break;
        case 'completed':
          onGoalComplete?.(goal.id);
          toast.success('Congratulations! Goal completed');
          break;
      }
    } catch (error) {
      toast.error('Failed to update goal status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMilestoneToggle = (milestoneId: string, completed: boolean) => {
    onMilestoneUpdate?.(goal.id, milestoneId, completed);
    
    // Calculate new progress based on completed milestones
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter(m => 
      m.id === milestoneId ? completed : m.completed
    ).length;
    
    const newProgress = Math.round((completedMilestones / totalMilestones) * 100);
    onGoalUpdate?.(goal.id, { progress: newProgress });
  };

  const getDaysRemaining = () => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = () => {
    if (goal.progress >= 100) return 'text-green-600';
    if (goal.progress >= 75) return 'text-blue-600';
    if (goal.progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const IconComponent = categoryIcons[goal.category];
  const isOverdue = getDaysRemaining() < 0;
  const daysRemaining = getDaysRemaining();
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;

  return (
    <Card className={`${className} ${priorityColors[goal.priority]} border-l-4 hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-gray-50">
              <IconComponent className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {goal.title}
                {goal.status === 'completed' && (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {goal.description}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isUpdating}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDetails(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {goal.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Goal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                </>
              )}
              {goal.status === 'paused' && (
                <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Goal
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  onGoalDelete?.(goal.id);
                  toast.success('Goal deleted');
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-2 mt-3">
          <Badge className={statusColors[goal.status]}>
            {goal.status}
          </Badge>
          <Badge variant="outline" className={categoryColors[goal.category]}>
            {goal.category.replace('-', ' ')}
          </Badge>
          {goal.priority === 'high' && (
            <Badge variant="outline" className="border-red-300 text-red-700">
              High Priority
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className={`text-sm font-bold ${getProgressColor()}`}>
              {goal.progress}%
            </span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          
          {/* Current vs Target Values */}
          {goal.currentValue !== undefined && goal.targetValue !== undefined && goal.unit && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Current: {goal.currentValue} {goal.unit}
              </span>
              <span className="text-gray-600">
                Target: {goal.targetValue} {goal.unit}
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          </div>
          <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            {isOverdue 
              ? `${Math.abs(daysRemaining)} days overdue` 
              : `${daysRemaining} days remaining`
            }
          </div>
        </div>

        {/* Milestones Summary */}
        {totalMilestones > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Milestones</span>
              <span className="text-sm text-gray-600">
                {completedMilestones} of {totalMilestones} completed
              </span>
            </div>
            <div className="space-y-1">
              {goal.milestones.slice(0, 3).map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleMilestoneToggle(milestone.id, !milestone.completed)}
                    className="flex-shrink-0"
                    disabled={goal.status !== 'active'}
                  >
                    {milestone.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <span className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {milestone.title}
                  </span>
                </div>
              ))}
              {totalMilestones > 3 && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  +{totalMilestones - 3} more milestones
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {goal.tags && goal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {goal.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
          
          {goal.status === 'active' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleStatusChange('completed')}
                disabled={goal.progress < 100}
              >
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('paused')}
              >
                Pause
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Detailed View Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {goal.title}
            </DialogTitle>
            <DialogDescription>
              {goal.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Detailed Progress */}
            <div className="space-y-4">
              <h3 className="font-semibold">Progress Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-3" />
                
                {goal.currentValue !== undefined && goal.targetValue !== undefined && goal.unit && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Value</span>
                      <div className="font-medium">{goal.currentValue} {goal.unit}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Value</span>
                      <div className="font-medium">{goal.targetValue} {goal.unit}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* All Milestones */}
            {goal.milestones.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">All Milestones</h3>
                <div className="space-y-3">
                  {goal.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <button
                        onClick={() => handleMilestoneToggle(milestone.id, !milestone.completed)}
                        className="mt-0.5"
                        disabled={goal.status !== 'active'}
                      >
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                          {milestone.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          Target: {new Date(milestone.targetDate).toLocaleDateString()}
                        </div>
                        {milestone.completed && milestone.completedAt && (
                          <div className="text-sm text-green-600">
                            Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Timeline</h4>
                <div className="text-sm text-gray-600">
                  <div>Start: {new Date(goal.startDate).toLocaleDateString()}</div>
                  <div>Target: {new Date(goal.targetDate).toLocaleDateString()}</div>
                  <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {isOverdue 
                      ? `${Math.abs(daysRemaining)} days overdue` 
                      : `${daysRemaining} days remaining`
                    }
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Settings</h4>
                <div className="text-sm text-gray-600">
                  <div>Priority: {goal.priority}</div>
                  <div>Status: {goal.status}</div>
                  {goal.reminders.enabled && (
                    <div>Reminders: {goal.reminders.frequency}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {goal.notes && (
              <div className="space-y-2">
                <h4 className="font-medium">Notes</h4>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {goal.notes}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}