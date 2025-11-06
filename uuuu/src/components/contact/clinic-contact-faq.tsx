// ========================================
// CLINIC FAQ INTEGRATION AND AUTO-SUGGESTIONS
// Sub-Phase 9.4: Intelligent FAQ System for Contact Forms
// Healthcare Platform Contact System Design
// ========================================

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Alert, 
  AlertDescription 
} from '../ui/alert';
import { 
  HelpCircle, 
  Search, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Sparkles,
  Filter,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ClinicContactFAQProps {
  clinicId: string;
  onFAQSelect?: (faq: FAQItem) => void;
  enableAutoSuggestions?: boolean;
  maxSuggestions?: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  viewCount: number;
  medicalSpecialty?: string;
  applicableServices: string[];
  accuracyRating?: number;
  verificationStatus: string;
}

interface FAQAutoSuggestionProps {
  clinicId: string;
  contactContent: string;
  serviceType?: string;
  onSuggestionSelect?: (suggestion: FAQItem) => void;
  onShowMore?: (category: string) => void;
}

/**
 * Main FAQ Component for Clinic Contact
 */
export function ClinicContactFAQ({ 
  clinicId,
  onFAQSelect,
  enableAutoSuggestions = true,
  maxSuggestions = 5
}: ClinicContactFAQProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadFAQs();
  }, [clinicId, selectedLanguage]);

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchTerm, selectedCategory]);

  const loadFAQs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic-contact-integration/faq/get-faqs?clinicId=${clinicId}&language=${selectedLanguage}`);
      const data = await response.json();
      setFaqs(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((faq: FAQItem) => faq.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    setFilteredFAQs(filtered);
  };

  const handleFAQClick = (faq: FAQItem) => {
    // Record view
    recordFAQView(faq.id);
    
    if (onFAQSelect) {
      onFAQSelect(faq);
    }
  };

  const recordFAQView = async (faqId: string) => {
    try {
      await fetch(`/api/clinic-contact-integration/faq/record-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId })
      });
    } catch (error) {
      console.error('Failed to record FAQ view:', error);
    }
  };

  const recordFAQFeedback = async (faqId: string, isHelpful: boolean) => {
    try {
      await fetch(`/api/clinic-contact-integration/faq/record-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId, isHelpful })
      });

      // Update local state
      setFaqs(faqs.map(faq => 
        faq.id === faqId 
          ? { 
              ...faq, 
              helpfulCount: isHelpful ? faq.helpfulCount + 1 : faq.helpfulCount,
              notHelpfulCount: !isHelpful ? faq.notHelpfulCount + 1 : faq.notHelpfulCount
            }
          : faq
      ));
    } catch (error) {
      console.error('Failed to record FAQ feedback:', error);
    }
  };

  const getHelpfulnessPercentage = (faq: FAQItem) => {
    const total = faq.helpfulCount + faq.notHelpfulCount;
    return total > 0 ? Math.round((faq.helpfulCount / total) * 100) : 0;
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="default" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'APPROVED':
        return <Badge variant="secondary" className="text-xs">Approved</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="text-xs">Draft</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading FAQs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* FAQ Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Find quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ms">Melayu</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Showing {filteredFAQs.length} of {faqs.length} FAQs
          </p>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.map((faq) => (
          <Card 
            key={faq.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFAQClick(faq)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Question and Category */}
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900 flex-1 pr-4">
                    {faq.question}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getVerificationBadge(faq.verificationStatus)}
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                </div>

                {/* Answer Preview */}
                <p className="text-sm text-gray-600 line-clamp-3">
                  {faq.answer}
                </p>

                {/* Tags and Services */}
                <div className="flex flex-wrap gap-1">
                  {faq.applicableServices.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {faq.medicalSpecialty && (
                    <Badge variant="outline" className="text-xs">
                      {faq.medicalSpecialty}
                    </Badge>
                  )}
                </div>

                {/* Engagement Metrics */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {faq.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {faq.helpfulCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />
                      {faq.notHelpfulCount}
                    </span>
                    {faq.accuracyRating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {faq.accuracyRating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Helpfulness Percentage */}
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">
                        {getHelpfulnessPercentage(faq)}% helpful
                      </span>
                    </div>

                    {/* Feedback Buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          recordFAQFeedback(faq.id, true);
                        }}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          recordFAQFeedback(faq.id, false);
                        }}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No FAQs found matching your search criteria</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Auto-suggestion component for contact forms
 */
export function ContactFormAutoSuggestions({ 
  clinicId, 
  contactContent, 
  serviceType,
  onSuggestionSelect,
  onShowMore 
}: FAQAutoSuggestionProps) {
  const [suggestions, setSuggestions] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contactContent.length > 20) {
      getAutoSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [contactContent, serviceType]);

  const getAutoSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clinic-contact-integration/faq/get-suggested-faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          contactContent,
          serviceType
        })
      });
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to get auto suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Sparkles className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-900">💡 Suggested FAQ answers:</h4>
            {suggestions.length > 0 && onShowMore && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-blue-600 h-6 px-2"
                onClick={() => onShowMore('all')}
              >
                View all
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Finding relevant answers...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className="bg-white p-3 rounded border border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => onSuggestionSelect?.(suggestion)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-gray-900">
                      {suggestion.question}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {suggestion.answer}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <span className="text-xs text-green-600">
                        ✓ {suggestion.helpfulCount} found helpful
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * FAQ Management Component for Admin/Staff
 */
export function FAQManagement({ 
  clinicId,
  onFAQUpdate 
}: { 
  clinicId: string;
  onFAQUpdate?: () => void;
}) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: '',
    tags: [] as string[],
    applicableServices: [] as string[],
    medicalSpecialty: ''
  });

  useEffect(() => {
    loadFAQs();
  }, [clinicId]);

  const loadFAQs = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/faq/get-faqs?clinicId=${clinicId}`);
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    }
  };

  const handleAddFAQ = async () => {
    try {
      const response = await fetch(`/api/clinic-contact-integration/faq/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          ...newFAQ
        })
      });

      if (response.ok) {
        await loadFAQs();
        setNewFAQ({
          question: '',
          answer: '',
          category: '',
          tags: [],
          applicableServices: [],
          medicalSpecialty: ''
        });
        setIsAddingFAQ(false);
        onFAQUpdate?.();
      }
    } catch (error) {
      console.error('Failed to add FAQ:', error);
    }
  };

  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/clinic-contact-integration/faq/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId })
      });

      if (response.ok) {
        await loadFAQs();
        onFAQUpdate?.();
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  const getCategoryStats = () => {
    const stats = faqs.reduce((acc, faq) => {
      acc[faq.category] = (acc[faq.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                FAQ Management
              </CardTitle>
              <CardDescription>
                Manage and optimize your clinic's frequently asked questions
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingFAQ(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add New FAQ Form */}
      {isAddingFAQ && (
        <Card>
          <CardHeader>
            <CardTitle>Add New FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Input
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                placeholder="What would patients like to know?"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                placeholder="Provide a helpful and detailed answer..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={newFAQ.category}
                  onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                  placeholder="e.g., Appointments, Healthier SG, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Medical Specialty</label>
                <Input
                  value={newFAQ.medicalSpecialty}
                  onChange={(e) => setNewFAQ({ ...newFAQ, medicalSpecialty: e.target.value })}
                  placeholder="e.g., Family Medicine, etc."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddFAQ} size="sm">
                Save FAQ
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingFAQ(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Category Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getCategoryStats().map(({ category, count }) => (
              <div key={category} className="text-center p-3 border rounded">
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-sm text-gray-600">{category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <Card>
        <CardHeader>
          <CardTitle>All FAQs ({faqs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border rounded p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{faq.question}</h4>
                      {getVerificationBadge(faq.verificationStatus)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{faq.category}</span>
                      <span>{faq.viewCount} views</span>
                      <span>{faq.helpfulCount} helpful</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingFAQ(faq)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteFAQ(faq.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default {
  ClinicContactFAQ,
  ContactFormAutoSuggestions,
  FAQManagement
};
