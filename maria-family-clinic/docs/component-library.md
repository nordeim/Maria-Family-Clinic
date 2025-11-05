# UI Component Library Documentation

## Overview

This is a comprehensive UI component library for the My Family Clinic healthcare platform, built with React, TypeScript, Tailwind CSS v4, and shadcn/ui. The library consists of 50+ production-ready components optimized for healthcare applications with WCAG 2.2 AA accessibility compliance.

## Design Principles

### Healthcare-Focused Design
- **Professional Appearance**: Clean, trustworthy aesthetics appropriate for medical environments
- **High Contrast**: 4.5:1 minimum contrast ratios for readability
- **Calming Colors**: Healthcare-optimized color palette avoiding aggressive tones
- **Clear Hierarchy**: Important medical information is visually prioritized

### Accessibility First
- **WCAG 2.2 AA Compliant**: All components meet or exceed accessibility standards
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: Comprehensive ARIA labels and semantic HTML
- **Reduced Motion**: Respects `prefers-reduced-motion` user preferences
- **High Contrast Mode**: Enhanced visibility for users who need it

### Mobile-First Responsive
- **Touch-Friendly**: 44px minimum touch target sizes
- **Fluid Typography**: Responsive text scaling across all screen sizes
- **Adaptive Layouts**: Optimized for mobile, tablet, and desktop viewports
- **60fps Interactions**: Smooth animations and transitions

## Installation & Setup

The component library is pre-configured in this project. To use components:

\`\`\`tsx
import { Button, Card, Input } from "@/components/ui"
import { DoctorCard, ClinicCard } from "@/components/healthcare"
\`\`\`

## Core UI Components

### Buttons

**Variants**: default, destructive, outline, secondary, success, warning, ghost, link  
**Sizes**: sm, default, lg, icon

\`\`\`tsx
<Button variant="default">Book Appointment</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="success">Confirm</Button>
<Button variant="destructive">Delete</Button>
\`\`\`

### Cards

Flexible container for grouping related content.

\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>Appointment Details</CardTitle>
    <CardDescription>Your upcoming visit</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Dr. Smith - March 15, 2025 at 2:00 PM</p>
  </CardContent>
  <CardFooter>
    <Button>Reschedule</Button>
  </CardFooter>
</Card>
\`\`\`

### Form Components

#### Input
\`\`\`tsx
<Input type="text" placeholder="Enter your name" />
<Input type="email" placeholder="Email address" />
<Input type="tel" placeholder="Phone number" />
\`\`\`

#### Label
\`\`\`tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
\`\`\`

#### Textarea
\`\`\`tsx
<Textarea placeholder="Describe your symptoms" rows={4} />
\`\`\`

#### Select
\`\`\`tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a specialty" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="cardiology">Cardiology</SelectItem>
    <SelectItem value="dermatology">Dermatology</SelectItem>
    <SelectItem value="pediatrics">Pediatrics</SelectItem>
  </SelectContent>
</Select>
\`\`\`

#### Checkbox & Radio
\`\`\`tsx
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">I agree to terms and conditions</Label>
</div>

<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
</RadioGroup>
\`\`\`

#### Switch
\`\`\`tsx
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Email notifications</Label>
</div>
\`\`\`

### React Hook Form Integration

\`\`\`tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Your full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
\`\`\`

### Feedback Components

#### Alert
\`\`\`tsx
<Alert variant="default">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>Your appointment has been scheduled.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Unable to process your request.</AlertDescription>
</Alert>

<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Payment confirmed.</AlertDescription>
</Alert>
\`\`\`

#### Badge
\`\`\`tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="success">Confirmed</Badge>
<Badge variant="warning">Attention Needed</Badge>
<Badge variant="destructive">Cancelled</Badge>
\`\`\`

#### Progress
\`\`\`tsx
<Progress value={65} />
\`\`\`

#### Skeleton
\`\`\`tsx
<Skeleton className="h-4 w-full" />
<Skeleton className="h-12 w-12 rounded-full" />
\`\`\`

### Overlays

#### Dialog
\`\`\`tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Appointment</DialogTitle>
      <DialogDescription>
        Are you sure you want to book this appointment?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
\`\`\`

#### Sheet (Drawer)
\`\`\`tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Open Menu</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
      <SheetDescription>Navigation options</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
\`\`\`

#### Tooltip
\`\`\`tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Helpful information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\`

### Navigation

#### Tabs
\`\`\`tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="history">History content</TabsContent>
  <TabsContent value="settings">Settings content</TabsContent>
</Tabs>
\`\`\`

#### Breadcrumbs
\`\`\`tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "Dr. Smith", current: true },
  ]}
  showHome={true}
/>
\`\`\`

#### Pagination
\`\`\`tsx
<Pagination
  currentPage={3}
  totalPages={10}
  onPageChange={(page) => console.log(page)}
  showFirstLast={true}
  siblingCount={1}
/>
\`\`\`

### Layout Components

#### Container
\`\`\`tsx
<Container size="lg">
  <h1>My Content</h1>
</Container>
\`\`\`

#### Grid
\`\`\`tsx
<Grid cols={3} gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
\`\`\`

#### Stack
\`\`\`tsx
<Stack direction="vertical" spacing="md" align="start">
  <h2>Title</h2>
  <p>Description</p>
  <Button>Action</Button>
</Stack>
\`\`\`

#### Flex
\`\`\`tsx
<Flex direction="row" gap="md" justify="between" align="center">
  <h2>Title</h2>
  <Button>Action</Button>
</Flex>
\`\`\`

### Utility Components

#### Loading
\`\`\`tsx
<Loading size="md" text="Loading appointments..." />
<Loading fullScreen text="Please wait..." />
\`\`\`

#### EmptyState
\`\`\`tsx
<EmptyState
  title="No appointments found"
  description="You don't have any upcoming appointments"
  action={{
    label: "Book Appointment",
    onClick: () => navigate("/book"),
  }}
/>
\`\`\`

## Healthcare-Specific Components

### DoctorCard

Display doctor information with booking functionality.

\`\`\`tsx
<DoctorCard
  doctor={{
    id: "1",
    name: "Sarah Smith",
    specialty: "Cardiology",
    qualifications: "MD, FACC",
    experience: "15 years",
    rating: 4.8,
    reviewCount: 245,
    availableSlots: ["Today 2:00 PM", "Tomorrow 10:00 AM"],
    clinics: ["Main Clinic", "Downtown Branch"],
    languages: ["English", "Spanish"],
  }}
  onBookAppointment={(id) => console.log("Book", id)}
  onViewProfile={(id) => console.log("View", id)}
/>
\`\`\`

### ClinicCard

Display clinic information with directions and booking.

\`\`\`tsx
<ClinicCard
  clinic={{
    id: "1",
    name: "Family Health Center",
    address: "123 Main St, City, State 12345",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM",
    rating: 4.6,
    distance: "2.3 miles",
    specialties: ["Primary Care", "Pediatrics", "Women's Health"],
  }}
  onBookAppointment={(id) => console.log("Book", id)}
  onGetDirections={(id) => console.log("Directions", id)}
/>
\`\`\`

### ServiceCard

Display medical services with booking and pricing.

\`\`\`tsx
<ServiceCard
  service={{
    id: "1",
    name: "Annual Physical Exam",
    description: "Comprehensive health assessment including vital signs, lab work, and consultation",
    category: "Preventive Care",
    duration: "45 minutes",
    price: "$150",
    available: true,
    popular: true,
    requirements: ["Fasting for 8 hours", "Bring insurance card", "List of current medications"],
  }}
  onBookService={(id) => console.log("Book", id)}
  onLearnMore={(id) => console.log("Learn more", id)}
/>
\`\`\`

### TimeSlots

Interactive time slot selector for appointment booking.

\`\`\`tsx
<TimeSlots
  date={new Date()}
  slots={[
    { id: "1", time: "9:00 AM", available: true },
    { id: "2", time: "10:00 AM", available: false },
    { id: "3", time: "11:00 AM", available: true },
  ]}
  selectedSlot="1"
  onSlotSelect={(id) => console.log("Selected", id)}
/>
\`\`\`

### MultiStepForm

Wizard-style form for complex workflows.

\`\`\`tsx
<MultiStepForm
  steps={[
    { id: "1", title: "Patient Info", description: "Basic details" },
    { id: "2", title: "Select Service", description: "Choose service" },
    { id: "3", title: "Choose Time", description: "Pick date & time" },
    { id: "4", title: "Confirm", description: "Review booking" },
  ]}
  currentStep={1}
  onStepChange={(step) => setCurrentStep(step)}
  isFirstStep={currentStep === 1}
  isLastStep={currentStep === 4}
  onBack={() => setCurrentStep(currentStep - 1)}
  onSubmit={handleSubmit}
>
  {/* Step content goes here */}
</MultiStepForm>
\`\`\`

## Design Tokens

### Colors

#### Primary (Healthcare Blue)
- Used for primary actions and emphasis
- Accessible on white backgrounds
- HSL: 199.5° 89% 48%

#### Secondary (Neutral Gray)
- Supporting UI elements
- Subtle backgrounds
- HSL: 210° 40% 96.1%

#### Success (Medical Green)
- Positive feedback
- Confirmed states
- HSL: 142.1° 76.2% 36.3%

#### Warning (Attention Amber)
- Important notices
- Requires attention
- HSL: 37.7° 92.1% 50.2%

#### Destructive (Medical Red)
- Errors and dangerous actions
- Cancellations
- HSL: 0° 84.2% 60.2%

### Typography

- **Font Family**: Inter (system fallback: system-ui, sans-serif)
- **Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl-6xl
- **Line Heights**: Optimized for readability (1.5 for body, 1.2 for headings)

### Spacing

Based on 4px grid system:
- 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px), 20 (80px), 24 (96px)

### Border Radius

- sm: calc(var(--radius) - 4px)
- md: calc(var(--radius) - 2px)
- lg: var(--radius) (default: 0.5rem / 8px)

### Shadows

- soft: Subtle elevation
- medium: Standard cards and modals
- large: High-priority overlays

### Animations

- **Duration**: fast (100ms), normal (200ms), slow (300ms)
- **Easing**: ease-out for exits, ease-in for entrances
- **Respects**: prefers-reduced-motion

## Accessibility Guidelines

### Keyboard Navigation

All interactive components support:
- **Tab**: Move to next element
- **Shift + Tab**: Move to previous element
- **Enter/Space**: Activate buttons and controls
- **Escape**: Close dialogs and menus
- **Arrow Keys**: Navigate within menus and selects

### Screen Reader Support

- Semantic HTML elements used throughout
- ARIA labels on all interactive elements
- Live regions for dynamic content updates
- Descriptive error messages

### Focus Management

- Visible focus indicators on all interactive elements
- Focus trap in modals and dialogs
- Focus returns to trigger element when closing overlays

### Color Contrast

All text meets WCAG 2.2 AA requirements:
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- Interactive elements: 3:1 minimum

## Performance Optimization

- **Tree Shaking**: Only import components you use
- **Code Splitting**: Dynamic imports for large components
- **CSS-in-JS**: No runtime CSS, all Tailwind compiled
- **Bundle Size**: ~45KB gzipped for core library

## Browser Support

- Chrome 120+
- Firefox 120+
- Safari 16+
- Edge 120+
- Mobile Safari (iOS 16+)
- Chrome Mobile 120+

## Dark Mode

All components support dark mode via the `dark` class on the root element:

\`\`\`tsx
<html className="dark">
  {/* Dark mode active */}
</html>
\`\`\`

Components automatically adapt their colors based on the theme.

## Best Practices

1. **Use semantic HTML**: Prefer `<button>` over `<div onClick>`
2. **Provide labels**: Always label form inputs
3. **Handle errors**: Display validation errors clearly
4. **Loading states**: Show feedback during async operations
5. **Empty states**: Guide users when no content is available
6. **Responsive design**: Test on mobile, tablet, and desktop
7. **Keyboard access**: Ensure all features work without a mouse
8. **Reduce motion**: Respect user preferences

## Component Count

- **Core UI Components**: 30+
- **Healthcare-Specific Components**: 5
- **Layout Components**: 5
- **Utility Components**: 2
- **Form Components**: 8
- **Total**: 50+ production-ready components

## Support

For questions or issues with the component library, please refer to the project documentation or contact the development team.
