# UI Foundation & Design System

## Quick Start

### Import Components

```tsx
// Core UI Components
import { Button, Card, Input, Label, Select } from "@/components/ui"

// Healthcare Components
import { DoctorCard, ClinicCard, TimeSlots } from "@/components/healthcare"
```

### Basic Usage

```tsx
// Button Example
<Button variant="default" size="lg">
  Book Appointment
</Button>

// Form Example
<div className="space-y-4">
  <div>
    <Label htmlFor="name">Full Name</Label>
    <Input id="name" placeholder="John Doe" />
  </div>
  <Button type="submit">Submit</Button>
</div>

// Doctor Card Example
<DoctorCard
  doctor={{
    id: "1",
    name: "Sarah Smith",
    specialty: "Cardiology",
    qualifications: "MD, FACC",
    rating: 4.8,
  }}
  onBookAppointment={(id) => navigate(`/book/${id}`)}
/>
```

## Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run tests
npm run test:ui         # Interactive test UI
npm run test:coverage   # Coverage report

# Storybook (requires installation)
npm run storybook       # Start Storybook dev server
npm run build-storybook # Build Storybook

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run type-check      # TypeScript validation
```

## Component Categories

### Form Components
- Input, Label, Textarea
- Select, Checkbox, Radio, Switch
- Form (React Hook Form integration)

### Feedback Components
- Alert, Badge, Progress, Skeleton
- Loading, EmptyState

### Overlays
- Dialog, AlertDialog, Sheet
- Popover, Tooltip, DropdownMenu

### Navigation
- Tabs, Breadcrumbs, Pagination

### Layout
- Container, Grid, Stack, Flex, Spacer

### Data Display
- Table, Card, Avatar

### Healthcare-Specific
- DoctorCard, ClinicCard, ServiceCard
- TimeSlots, MultiStepForm

## Design Tokens

### Colors
- Primary: Healthcare Blue (#0ea5e9)
- Success: Medical Green (#22c55e)
- Warning: Attention Amber (#f59e0b)
- Destructive: Alert Red (#ef4444)

### Spacing (4px grid)
- 1 (4px), 2 (8px), 3 (12px), 4 (16px)
- 5 (20px), 6 (24px), 8 (32px), 10 (40px)

### Typography
- Font: Inter
- Sizes: xs, sm, base, lg, xl, 2xl-6xl
- Responsive scaling enabled

## Accessibility

All components meet WCAG 2.2 AA standards:
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Reduced motion support
- 4.5:1 minimum contrast ratios

## Documentation

- [Component Library Guide](./component-library.md) - Comprehensive documentation
- [Implementation Summary](./phase4-implementation-summary.md) - Technical details
- Storybook (run `npm run storybook`) - Interactive examples

## File Structure

```
src/components/
├── ui/              # Core UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
└── healthcare/      # Healthcare-specific
    ├── doctor-card.tsx
    ├── clinic-card.tsx
    └── ...
```

## Dark Mode

Toggle dark mode by adding/removing the `dark` class on the root element:

```tsx
<html className={theme === 'dark' ? 'dark' : ''}>
```

## Performance

- Bundle size: ~45KB gzipped
- Tree-shaking enabled
- Lazy loading ready
- 60fps animations

## Browser Support

- Chrome 120+
- Firefox 120+
- Safari 16+
- Edge 120+
- Mobile browsers (iOS 16+, Android Chrome 120+)

## Support

For issues or questions, refer to the [Component Library Documentation](./component-library.md).
