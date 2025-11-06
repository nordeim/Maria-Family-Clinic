# My Family Clinic - Healthcare Platform

A comprehensive healthcare platform for Singapore, built with Next.js 15, Supabase, and modern web technologies. This platform enables citizens to locate clinics, explore healthcare services, find doctors, and access the Healthier SG program.

## 🏥 Project Overview

My Family Clinic is a healthcare discovery and service platform designed to help Singaporeans:
- **Locate Clinics**: Find nearby clinics with geolocation-based search
- **Explore Services**: Browse healthcare services and their availability
- **Find Doctors**: Search for doctors by specialty and language
- **Healthier SG Program**: Access information about Singapore's national health initiative
- **Contact & Enquiries**: Submit inquiries and get help

## 🚀 Technology Stack

### Core Technologies
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Supabase PostgreSQL with PostGIS extension
- **Authentication**: NextAuth 5 with Prisma adapter
- **API Layer**: tRPC 11 for type-safe APIs
- **State Management**: TanStack React Query 5
- **Styling**: Tailwind CSS v4 with shadcn/ui components

### Development Tools
- **Database**: Prisma ORM with PostgreSQL
- **Code Quality**: ESLint, Prettier, Husky Git hooks
- **Accessibility**: WCAG 2.2 AA compliance
- **Performance**: Core Web Vitals optimization
- **Testing**: Comprehensive testing suite (Phase 11)

### Infrastructure
- **Database**: Supabase PostgreSQL with PostGIS
- **Storage**: Supabase Storage for file uploads
- **Functions**: Supabase Edge Functions for serverless logic
- **Deployment**: Vercel (recommended) or other Next.js hosting

## 🏗️ Project Structure

```
my-family-clinic/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── forms/             # Form components
│   │   ├── layout/            # Layout components
│   │   ├── map/               # Map and location components
│   │   ├── search/            # Search and filtering
│   │   ├── clinic/            # Clinic-related components
│   │   ├── doctor/            # Doctor-related components
│   │   └── service/           # Service-related components
│   ├── lib/                   # Utilities and configurations
│   │   ├── auth.ts            # Authentication configuration
│   │   ├── supabase.ts        # Supabase client
│   │   ├── db.ts              # Database connection
│   │   └── types/             # TypeScript definitions
│   ├── server/                # Server-side code
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── api/               # API routes and procedures
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seeds/                 # Seed data
├── public/                    # Static assets
├── docs/                      # Documentation
├── .husky/                    # Git hooks
└── scripts/                   # Development scripts
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-family-clinic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   ```
   Update the environment variables in `.env.local` with your actual values.

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed development environment setup
- **[Architecture](./docs/architectural-decisions.md)** - Technical decisions and rationale
- **[Database Schema](./prisma/schema.prisma)** - Complete database model definitions
- **[API Documentation](./docs/api-documentation.md)** - API endpoints and usage
- **[Component Library](./docs/components.md)** - UI component guidelines

## 🎯 Core Features

### 1. Clinic Discovery
- **Geolocation Search**: Find clinics near your location
- **Advanced Filtering**: Filter by services, languages, operating hours
- **Interactive Maps**: Visual clinic locations with Google Maps integration
- **Real-time Availability**: Check clinic operating hours and wait times

### 2. Service Exploration
- **Service Taxonomy**: Browse healthcare services by category
- **Healthier SG Integration**: Filter Healthier SG covered services
- **Pricing Information**: Transparent pricing across participating clinics
- **Provider Comparison**: Compare services across different clinics

### 3. Doctor Directory
- **Specialty Search**: Find doctors by medical specialty
- **Language Preferences**: Filter doctors who speak your language
- **Experience & Qualifications**: View doctor credentials and experience
- **Clinic Affiliations**: See which clinics each doctor practices at

### 4. Healthier SG Program
- **Program Information**: Comprehensive details about Healthier SG
- **Eligibility Checker**: Determine if you qualify for the program
- **Participating Clinics**: Find Healthier SG enrolled clinics
- **Enrollment Guidance**: Step-by-step enrollment process

### 5. Contact & Support
- **Multi-channel Contact**: Website forms, email, phone
- **Enquiry Routing**: Automatic routing to appropriate clinic/staff
- **Priority Handling**: Urgent enquiries prioritized
- **Multi-language Support**: Support for English, Mandarin, Malay, Tamil

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database to initial state

### Code Quality

This project enforces high code quality standards:

- **TypeScript Strict Mode**: Full type safety
- **ESLint**: Code linting with healthcare-specific rules
- **Prettier**: Consistent code formatting
- **Accessibility**: WCAG 2.2 AA compliance checks
- **Security**: HIPAA-compliant data handling practices

### Git Workflow

The project uses conventional commits with pre-commit hooks:

```bash
# Commit message format
feat(auth): add user registration
fix(clinic): resolve location search bug
docs(readme): update setup instructions
```

## 🌐 Deployment

### Recommended: Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Database and hosting in one platform
- **DigitalOcean**: App Platform deployment

### Environment Variables (Production)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=your_domain
```

## 🔒 Security & Compliance

### Healthcare Data Protection
- **HIPAA Compliance**: Structured for healthcare data protection
- **PDPA Compliance**: Singapore Personal Data Protection Act compliance
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Access Control**: Role-based access control for all data
- **Audit Logging**: Comprehensive audit trail for all operations

### Security Features
- **Authentication**: Secure user authentication with NextAuth
- **Authorization**: Role-based permissions
- **Data Validation**: Input validation on all endpoints
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Properly configured cross-origin policies

## 🤝 Contributing

### Development Guidelines
1. Follow conventional commit messages
2. Ensure all tests pass before pushing
3. Update documentation for new features
4. Follow accessibility guidelines (WCAG 2.2 AA)
5. Maintain type safety (no `any` types)

### Code Review Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checking
4. Submit pull request with description
5. Address review comments
6. Merge after approval

## 📞 Support

For technical support or questions:
- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Create GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for general questions

## 📄 License

This project is proprietary software for My Family Clinic. All rights reserved.

## 🙏 Acknowledgments

- **Healthcare Data Sources**: Singapore Ministry of Health
- **Design Inspiration**: Healthcare.gov and NHS websites
- **Open Source**: Next.js, Supabase, and other amazing open-source projects

---

**Built with ❤️ for Singapore's healthcare community**