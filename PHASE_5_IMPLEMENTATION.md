# Phase 5: Frontend Dashboard — Complete Implementation Guide

**Status:** 📋 IMPLEMENTATION SPECIFICATIONS  
**Version:** 1.0  
**Created:** May 1, 2026  
**Quality Target:** Production-Grade UI  
**Estimated Duration:** 8-10 weeks  

---

## 📑 Table of Contents

1. [Mission & Overview](#mission)
2. [Tech Stack & Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Component Specifications](#components)
5. [Page Specifications](#pages)
6. [API Integration](#api-integration)
7. [Data Models & TypeScript](#data-models)
8. [Styling & Design System](#design-system)
9. [State Management](#state-management)
10. [Testing Strategy](#testing)
11. [Deployment Guide](#deployment)
12. [Success Criteria](#success-criteria)

---

## 🎯 Mission {#mission}

Build a **production-grade user-facing dashboard** to manage, monitor, and optimize email sequences. Enable non-technical users (campaign managers) to:

- Schedule new email campaigns with a visual wizard
- Monitor real-time sending metrics
- Analyze A/B test results
- Control sequences (pause/resume)
- Preview emails before sending
- Import and manage contact lists
- Track compliance & bounce rates

### What Phase 5 Solves

| Problem | Phase 5 Solution |
|---------|-----------------|
| "How do I create a campaign?" | Campaign Scheduler wizard (visual, 4-step flow) |
| "What's happening right now?" | Real-time dashboard with KPI cards & activity feed |
| "How well is this working?" | Analytics dashboard with charts, trends, reports |
| "Which variant is winning?" | A/B test results viewer with statistical significance |
| "Can I see the email?" | Email preview with token substitution |
| "How do I add contacts?" | Contact import with drag-drop CSV upload |

---

## 🏗️ Tech Stack & Architecture {#architecture}

### Frontend Stack

```plaintext
React 18+          — Component framework
TypeScript         — Type-safe code
Vite               — Fast build tool (5x faster than Create React App)
React Router v6    — Client-side routing
TanStack Query     — Data fetching & caching
React Hook Form    — Lightweight form handling
Zod                — Type-safe validation
Tailwind CSS       — Utility-first styling
Recharts           — React charts library
Axios              — HTTP client
```

### Why These Choices?

- **React 18+**: Latest features (useTransition, useDeferredValue for smooth UX)
- **Vite**: 10-100x faster HMR than Create React App, better DX
- **TypeScript**: Catch errors at build time, better IDE support
- **TanStack Query**: Automatic caching, background refetching, optimistic updates
- **React Hook Form**: Minimal bundle size, great performance
- **Tailwind**: Modern utilities, 0 CSS file maintenance, dark mode built-in
- **Recharts**: React-native charts, responsive by default
- **Axios**: Better error handling than fetch, request/response interceptors

### Architecture Layers

```plaintext
┌─────────────────────────────────────────┐
│         Pages (Home, Campaigns...)      │
├─────────────────────────────────────────┤
│      Components (Reusable blocks)       │
├─────────────────────────────────────────┤
│     Hooks (useSequences, useAnalytics)  │
├─────────────────────────────────────────┤
│    Services (API client, formatters)    │
├─────────────────────────────────────────┤
│        Backend API (/api/...)           │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure {#file-structure}

```
frontend/
├── src/
│   ├── pages/                          # Route-level pages
│   │   ├── Home.tsx                    # Dashboard / real-time metrics
│   │   ├── Campaigns.tsx               # Campaign list & management
│   │   ├── Analytics.tsx               # Performance analysis
│   │   ├── ABTestResults.tsx           # A/B variant deep-dive
│   │   ├── CampaignScheduler.tsx       # 4-step wizard
│   │   ├── ContactImport.tsx           # CSV upload interface
│   │   └── Settings.tsx                # Config & preferences
│   │
│   ├── components/                     # Reusable components
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top navigation bar
│   │   │   ├── Sidebar.tsx             # Left nav menu
│   │   │   ├── Footer.tsx              # Footer info
│   │   │   └── MainLayout.tsx          # Page wrapper
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx             # Metric display (Active Sequences, etc.)
│   │   │   ├── RecentActivityTable.tsx # Email send log
│   │   │   ├── EmailsSentChart.tsx     # Line chart (emails/hour)
│   │   │   └── StatusBreakdown.tsx     # Pie chart (sent/failed/pending)
│   │   │
│   │   ├── campaigns/
│   │   │   ├── CampaignTable.tsx       # List of sequences
│   │   │   ├── CampaignDetailModal.tsx # Sequence details popup
│   │   │   ├── SequenceControls.tsx    # Pause/Resume/Manual Send buttons
│   │   │   └── BulkActions.tsx         # Pause all, Export CSV
│   │   │
│   │   ├── analytics/
│   │   │   ├── CampaignSummary.tsx     # Stats cards
│   │   │   ├── PerformanceTrends.tsx   # Multi-chart layout
│   │   │   ├── ABTestTable.tsx         # Variant comparison
│   │   │   ├── EmailNumberMetrics.tsx  # Per-email performance
│   │   │   └── DateRangeFilter.tsx     # Date filter
│   │   │
│   │   ├── scheduler/
│   │   │   ├── Step1ContactSelect.tsx  # File upload, preview
│   │   │   ├── Step2SequenceType.tsx   # A vs B choice
│   │   │   ├── Step3ConfigureTiming.tsx# Start date, caps
│   │   │   ├── Step4Review.tsx         # Summary & confirm
│   │   │   └── SuccessPage.tsx         # Confirmation
│   │   │
│   │   ├── preview/
│   │   │   ├── EmailPreview.tsx        # Full email display
│   │   │   └── TokenHighlight.tsx      # Highlight {{tokens}}
│   │   │
│   │   ├── import/
│   │   │   ├── CSVUpload.tsx           # Drag-drop uploader
│   │   │   ├── ColumnMapper.tsx        # Map CSV columns
│   │   │   └── ValidationReport.tsx    # Valid/Invalid counts
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx              # Reusable button
│   │   │   ├── Input.tsx               # Form input
│   │   │   ├── Modal.tsx               # Popup dialog
│   │   │   ├── Loading.tsx             # Spinner/skeleton
│   │   │   ├── Alert.tsx               # Error/success message
│   │   │   └── Pagination.tsx          # Table pagination
│   │   │
│   │   └── forms/
│   │       ├── Form.tsx                # Form wrapper
│   │       ├── FormField.tsx           # Field with label & error
│   │       └── DatePicker.tsx          # Date input
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── useSequences.ts             # Fetch & manage sequences
│   │   ├── useAnalytics.ts             # Fetch analytics data
│   │   ├── useCampaign.ts              # Control sequence (pause/resume)
│   │   ├── useContacts.ts              # Fetch contacts
│   │   ├── useApi.ts                   # Generic API hook
│   │   └── useLocalStorage.ts          # Persist preferences
│   │
│   ├── services/                       # Business logic
│   │   ├── api.ts                      # Axios instance + interceptors
│   │   ├── auth.ts                     # Auth helpers (if needed)
│   │   ├── validators.ts               # CSV validation, email checks
│   │   ├── formatters.ts               # Format dates, numbers
│   │   ├── csvParser.ts                # Parse CSV files
│   │   └── analytics.ts                # Calculate derived metrics
│   │
│   ├── types/                          # TypeScript interfaces
│   │   ├── index.ts                    # Export all types
│   │   ├── sequence.ts                 # Sequence type definitions
│   │   ├── contact.ts                  # Contact type definitions
│   │   ├── analytics.ts                # Analytics response shapes
│   │   └── api.ts                      # API request/response types
│   │
│   ├── constants/                      # Config & constants
│   │   ├── api.ts                      # API base URLs, endpoints
│   │   ├── colors.ts                   # Color palette
│   │   ├── messages.ts                 # Error/success messages
│   │   └── sequences.ts                # Sequence descriptions
│   │
│   ├── styles/                         # Global CSS
│   │   ├── globals.css                 # Reset, variables
│   │   └── animations.css              # Custom animations
│   │
│   ├── utils/                          # Helper functions
│   │   ├── dates.ts                    # Date manipulation
│   │   ├── strings.ts                  # String utilities
│   │   ├── math.ts                     # Calculations
│   │   └── storage.ts                  # LocalStorage helpers
│   │
│   ├── App.tsx                         # Root component
│   ├── main.tsx                        # Vite entry point
│   └── App.css                         # Root styles
│
├── public/                             # Static assets
│   ├── favicon.ico
│   └── logo.svg
│
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite config
├── tailwind.config.js                  # Tailwind config
├── .eslintrc.json                      # Linting rules
├── .env.example                        # Example env vars
└── README.md                           # Setup instructions
```

---

## 🧩 Component Specifications {#components}

### Layout Components

#### Header.tsx
```typescript
// Purpose: Top navigation bar with branding and user menu
// Props: user: User, onLogout: () => void
// Features:
//   - FactoryJet logo (left)
//   - "Campaign Manager" title (center)
//   - User dropdown (right) with Logout, Settings, Help

interface HeaderProps {
  user?: { name: string; email: string };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  // Renders: Logo | Title | User Dropdown
}
```

#### Sidebar.tsx
```typescript
// Purpose: Left navigation menu with collapsible sections
// Features:
//   - Dashboard (icon: home)
//   - Campaigns (icon: envelope)
//   - Analytics (icon: chart-bar)
//   - A/B Results (icon: flask)
//   - Import Contacts (icon: upload)
//   - Settings (icon: cog)
// Props: currentPage: string, onNavigate: (page: string) => void

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  // Renders: Navigation menu with active highlight
}
```

#### MainLayout.tsx
```typescript
// Purpose: Wraps pages with Header + Sidebar + Footer
// Props: children: React.ReactNode, title: string

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  // Renders: Header | (Sidebar + main content) | Footer
}
```

---

### Dashboard Components

#### KPICard.tsx
```typescript
// Purpose: Display a single metric (number + label + trend)
// Props: label, value, trend, icon, color
// Styling: Tailwind gradient background, hover shadow

interface KPICardProps {
  label: string;              // "Active Sequences"
  value: number;              // 42
  trend?: number;             // +5 (optional, shows % change)
  trendDirection?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  label, value, trend, icon, color 
}) => {
  // Renders:
  // ┌──────────────────┐
  // │ [icon] Active... │
  // │       42         │
  // │     ↑ 5% today   │
  // └──────────────────┘
}
```

#### RecentActivityTable.tsx
```typescript
// Purpose: Table of last 10 emails sent
// Columns: Contact Name | Email | Sequence | Subject | Status | Time
// Props: activities: Activity[], loading: boolean

interface Activity {
  id: string;
  contactName: string;
  email: string;
  sequenceType: 'A' | 'B';
  emailNumber: number;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: Date;
}

export const RecentActivityTable: React.FC<{ 
  activities: Activity[]; 
  loading: boolean 
}> = ({ activities, loading }) => {
  // Renders: Table with status badges, timestamps
}
```

#### EmailsSentChart.tsx
```typescript
// Purpose: Line chart showing emails sent per hour (last 24 hours)
// Data: [{ hour: "8am", count: 12 }, { hour: "9am", count: 18 }, ...]
// Props: data: ChartData[], loading: boolean

import { LineChart, Line, XAxis, YAxis } from 'recharts';

export const EmailsSentChart: React.FC<{
  data: { hour: string; count: number }[];
  loading: boolean;
}> = ({ data, loading }) => {
  // Renders: Recharts LineChart with responsive container
}
```

#### StatusBreakdown.tsx
```typescript
// Purpose: Pie chart showing sent/failed/pending breakdown
// Props: data: StatusData[], loading: boolean

export const StatusBreakdown: React.FC<{
  data: { status: string; count: number }[];
  loading: boolean;
}> = ({ data, loading }) => {
  // Renders: Recharts PieChart with custom colors
}
```

---

### Campaign Components

#### CampaignTable.tsx
```typescript
// Purpose: Sortable, filterable table of all sequences
// Columns: Name | Email | Type | Status | Progress | Next Send | Actions
// Features: 
//   - Sorting (click header)
//   - Filtering (status dropdown, date range)
//   - Pagination (10 per page)
//   - Bulk select checkbox

interface CampaignTableProps {
  campaigns: Sequence[];
  loading: boolean;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns, loading, onPause, onResume, onViewDetails
}) => {
  // Renders: Table with action buttons
}
```

#### CampaignDetailModal.tsx
```typescript
// Purpose: Popup showing full sequence details
// Sections:
//   - Contact info (name, email, company)
//   - Sequence timeline (Email 1/5, next on 2026-05-08)
//   - Email history (all sent emails with preview button)
//   - A/B variant assigned
//   - Reply status
// Props: campaign: Sequence, isOpen: boolean, onClose: () => void

interface CampaignDetailModalProps {
  campaign: Sequence;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = 
  ({ campaign, isOpen, onClose }) => {
  // Renders: Modal with scrollable content
}
```

#### SequenceControls.tsx
```typescript
// Purpose: Buttons to control sequence (pause/resume/manual send)
// Props: sequenceId, status, onPause, onResume, onManualSend

interface SequenceControlsProps {
  sequenceId: string;
  status: 'active' | 'paused' | 'completed' | 'bounced';
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onManualSend?: () => Promise<void>;
}

export const SequenceControls: React.FC<SequenceControlsProps> = 
  ({ sequenceId, status, onPause, onResume, onManualSend }) => {
  // Renders: Conditionally show Pause/Resume/Manual Send buttons
}
```

---

### Analytics Components

#### CampaignSummary.tsx
```typescript
// Purpose: High-level stats cards at top of Analytics page
// Cards:
//   - Total Started (count)
//   - Active (count)
//   - Completed (count)
//   - Replied (count)
//   - Reply Rate (%)
//   - Bounce Rate (%)

interface CampaignSummaryProps {
  analytics: Analytics;
  loading: boolean;
}

export const CampaignSummary: React.FC<CampaignSummaryProps> = 
  ({ analytics, loading }) => {
  // Renders: 6 KPI cards in grid
}
```

#### PerformanceTrends.tsx
```typescript
// Purpose: Multi-chart layout showing trends over time
// Charts:
//   - Emails sent per day (bar chart)
//   - Reply rate over time (line chart)
//   - Bounce rate over time (line chart)
//   - Status breakdown (pie chart)

export const PerformanceTrends: React.FC<{
  data: TrendData;
  loading: boolean;
}> = ({ data, loading }) => {
  // Renders: 4-chart grid layout
}
```

#### ABTestTable.tsx
```typescript
// Purpose: Compare A/B variants side-by-side
// Columns: Variant | Sent | Replies | Reply % | Statistical Significance
// Features:
//   - Sort by reply rate
//   - Winner badge (if significant)
//   - Confidence indicator (n=X, need n=100)

interface ABTestTableProps {
  results: ABTestResult[];
  loading: boolean;
}

export const ABTestTable: React.FC<ABTestTableProps> = 
  ({ results, loading }) => {
  // Renders: Variant comparison table
}
```

#### EmailNumberMetrics.tsx
```typescript
// Purpose: Show how each email number (1-5) performs
// Rows: Email 1 | Email 2 | ... | Email 5
// Columns: Sent Count | Reply Rate | Bounce Rate | Avg Response Time

export const EmailNumberMetrics: React.FC<{
  metrics: EmailMetric[];
  loading: boolean;
}> = ({ metrics, loading }) => {
  // Renders: Metrics table identifying best-performing emails
}
```

---

### Scheduler Components

#### Step1ContactSelect.tsx
```typescript
// Purpose: Upload CSV or select existing contacts
// Features:
//   - Drag-drop file upload
//   - File type validation (.csv only)
//   - Preview first 10 rows
//   - Validate required columns: firstName, email, companyName, industry
//   - Show: X valid, Y invalid, Z duplicates

interface Step1Props {
  onNext: (contacts: Contact[]) => void;
  loading: boolean;
}

export const Step1ContactSelect: React.FC<Step1Props> = 
  ({ onNext, loading }) => {
  // Renders: Upload zone + preview table
}
```

#### Step2SequenceType.tsx
```typescript
// Purpose: Choose between Sequence A and B
// Display:
//   - Radio button: Sequence A
//     Description: "5 emails over 19 days, focuses on ROI/cost"
//   - Radio button: Sequence B (UK variant)
//     Description: "5 emails over 19 days, GDPR-compliant"

interface Step2Props {
  onNext: (sequenceType: 'A' | 'B') => void;
  onBack: () => void;
}

export const Step2SequenceType: React.FC<Step2Props> = 
  ({ onNext, onBack }) => {
  // Renders: Radio buttons with descriptions
}
```

#### Step3ConfigureTiming.tsx
```typescript
// Purpose: Set start date and send configuration
// Fields:
//   - Start Date: DatePicker (today or future)
//   - Max Daily Sends: Slider (1-100, default 50)
//   - Notes: Show default send schedule (Tue-Wed, 7-11am)

interface Step3Props {
  onNext: (config: SendConfig) => void;
  onBack: () => void;
}

interface SendConfig {
  startDate: Date;
  maxDailySends: number;
}

export const Step3ConfigureTiming: React.FC<Step3Props> = 
  ({ onNext, onBack }) => {
  // Renders: Form inputs + info text
}
```

#### Step4Review.tsx
```typescript
// Purpose: Show summary and confirm before launch
// Display:
//   "Send Sequence A to 50 contacts starting today"
//   
//   Compliance Summary:
//   ✅ All 50 emails are valid format
//   ✅ No blocked domains
//   ✅ All tokens fillable
//   
//   Buttons: [Back] [Launch Campaign]

interface Step4Props {
  contacts: Contact[];
  sequenceType: 'A' | 'B';
  config: SendConfig;
  onLaunch: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export const Step4Review: React.FC<Step4Props> = 
  ({ contacts, sequenceType, config, onLaunch, onBack, loading }) => {
  // Renders: Summary cards + action buttons
}
```

#### SuccessPage.tsx
```typescript
// Purpose: Confirmation screen after launch
// Display:
//   ✅ 50 sequences initialized
//   📅 First emails send Tuesday at 7am
//   [View Campaigns] [Schedule Another]

interface SuccessPageProps {
  count: number;
  sequenceType: 'A' | 'B';
  onViewCampaigns: () => void;
  onScheduleAnother: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = 
  ({ count, sequenceType, onViewCampaigns, onScheduleAnother }) => {
  // Renders: Celebration message + next action buttons
}
```

---

### Email Preview Component

#### EmailPreview.tsx
```typescript
// Purpose: Display exactly how email will be sent
// Display:
//   From: Bhavesh at FactoryJet <email@...>
//   To: john@company.com
//   Subject: TechBrand's support costs [Variant: primary]
//   ---
//   [Full email body with token substitution]
//   ---
//   To unsubscribe: [link highlighted]
//
// Features:
//   - Token substitution visible ({{firstName}} → John)
//   - Highlight unsubscribe link
//   - Copy to clipboard button
//   - Test send to own email button (stretch goal)

interface EmailPreviewProps {
  email: {
    from: string;
    to: string;
    subject: string;
    body: string;
    variant: string;
  };
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ email }) => {
  // Renders: Text-formatted email with highlighting
}
```

---

### Import Components

#### CSVUpload.tsx
```typescript
// Purpose: Drag-drop zone for CSV file
// Features:
//   - Accept .csv files only
//   - Show file size
//   - Validate before upload
//   - Show loading spinner during parse

interface CSVUploadProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload, loading }) => {
  // Renders: Drag-drop zone with file input
}
```

#### ColumnMapper.tsx
```typescript
// Purpose: Map CSV columns to contact fields
// UI:
//   CSV Column: [CSV Header dropdown]  → Contact Field: [auto-detected]
//   firstName   → [Auto-detected: firstName]
//   company     → [Dropdown: companyName, industry, other...]
//   industry    → [Auto-detected: industry]
//
// Features:
//   - Auto-detect columns (fuzzy match)
//   - Manual override dropdowns
//   - Show required vs optional fields

interface ColumnMapperProps {
  csvHeaders: string[];
  onMap: (mapping: Record<string, string>) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = 
  ({ csvHeaders, onMap }) => {
  // Renders: Mapping UI with dropdowns
}
```

#### ValidationReport.tsx
```typescript
// Purpose: Show validation results
// Display:
//   ✅ 850 valid
//   ❌ 10 invalid (email format)
//   ⚠️  5 duplicates (removed)
//   
//   Ready to import: 850 contacts
//
//   Issues:
//   - Row 5: Invalid email (john@)
//   - Row 12: Missing firstName
//   ...

interface ValidationReportProps {
  report: {
    valid: number;
    invalid: number;
    duplicates: number;
    issues: { row: number; reason: string }[];
  };
}

export const ValidationReport: React.FC<ValidationReportProps> = 
  ({ report }) => {
  // Renders: Summary stats + detailed issues list
}
```

---

## 📄 Page Specifications {#pages}

### Home.tsx (Dashboard)

```typescript
export const Home: React.FC = () => {
  const { data: analytics, loading: analyticsLoading } = useAnalytics();
  const { data: activities, loading: activitiesLoading } = useSequences();
  
  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <KPICard 
          label="Active Sequences" 
          value={analytics?.activeCount || 0} 
          icon={<EnvelopeIcon />}
        />
        <KPICard 
          label="Emails Sent Today" 
          value={analytics?.sentToday || 0} 
          icon={<CheckIcon />}
        />
        <KPICard 
          label="Reply Rate" 
          value={analytics?.replyRate || 0} 
          trend={2.3}
          trendDirection="up"
        />
        <KPICard 
          label="Bounce Rate" 
          value={analytics?.bounceRate || 0} 
          trend={-0.5}
          trendDirection="down"
          color="red"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EmailsSentChart data={activities} loading={activitiesLoading} />
        </div>
        <StatusBreakdown data={analytics?.statusBreakdown} loading={analyticsLoading} />
      </div>
      
      <h2 className="text-xl font-bold mt-8 mb-4">Recent Activity</h2>
      <RecentActivityTable activities={activities} loading={activitiesLoading} />
    </MainLayout>
  );
};
```

### Campaigns.tsx

```typescript
export const Campaigns: React.FC = () => {
  const { data: campaigns, loading } = useSequences();
  const [selectedCampaign, setSelectedCampaign] = useState<Sequence | null>(null);
  const [filters, setFilters] = useState({ type: 'all', status: 'all' });
  
  const filtered = campaigns?.filter(c => 
    (filters.type === 'all' || c.sequenceType === filters.type) &&
    (filters.status === 'all' || c.sequenceStatus === filters.status)
  );
  
  return (
    <MainLayout title="Campaigns">
      <div className="mb-6 flex gap-4">
        <select 
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="A">Sequence A</option>
          <option value="B">Sequence B</option>
        </select>
        
        <select 
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="replied">Replied</option>
        </select>
      </div>
      
      <CampaignTable 
        campaigns={filtered || []} 
        loading={loading}
        onPause={(id) => pauseSequence(id)}
        onResume={(id) => resumeSequence(id)}
        onViewDetails={(id) => setSelectedCampaign(campaigns?.find(c => c._id === id) || null)}
      />
      
      <CampaignDetailModal 
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </MainLayout>
  );
};
```

### Analytics.tsx

```typescript
export const Analytics: React.FC = () => {
  const { data: analytics, loading } = useAnalytics();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  return (
    <MainLayout title="Analytics">
      <div className="mb-6">
        <label>Date Range: </label>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>
      
      <CampaignSummary analytics={analytics} loading={loading} />
      <PerformanceTrends data={analytics} loading={loading} />
      <EmailNumberMetrics metrics={analytics?.emailMetrics} loading={loading} />
    </MainLayout>
  );
};
```

### ABTestResults.tsx

```typescript
export const ABTestResults: React.FC = () => {
  const { data: results, loading } = useABTestResults();
  const [emailNumber, setEmailNumber] = useState(1);
  
  const filtered = results?.filter(r => r.emailNumber === emailNumber);
  
  return (
    <MainLayout title="A/B Test Results">
      <div className="mb-6">
        <label>Email Number: </label>
        <select 
          value={emailNumber}
          onChange={(e) => setEmailNumber(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Email {n}</option>)}
        </select>
      </div>
      
      <ABTestTable results={filtered || []} loading={loading} />
    </MainLayout>
  );
};
```

### CampaignScheduler.tsx (Wizard)

```typescript
export const CampaignScheduler: React.FC = () => {
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sequenceType, setSequenceType] = useState<'A' | 'B'>('A');
  const [config, setConfig] = useState<SendConfig>({ startDate: new Date(), maxDailySends: 50 });
  const [result, setResult] = useState<{ count: number; sequenceType: 'A' | 'B' } | null>(null);
  
  const handleLaunch = async () => {
    const response = await initializeSequences({ contacts, sequenceType, ...config });
    setResult({ count: response.count, sequenceType });
    setStep(5); // Success page
  };
  
  return (
    <MainLayout title="Campaign Scheduler">
      {step === 1 && <Step1ContactSelect onNext={(c) => { setContacts(c); setStep(2); }} />}
      {step === 2 && <Step2SequenceType onNext={(s) => { setSequenceType(s); setStep(3); }} onBack={() => setStep(1)} />}
      {step === 3 && <Step3ConfigureTiming onNext={(c) => { setConfig(c); setStep(4); }} onBack={() => setStep(2)} />}
      {step === 4 && (
        <Step4Review 
          contacts={contacts} 
          sequenceType={sequenceType} 
          config={config}
          onLaunch={handleLaunch}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && result && (
        <SuccessPage 
          count={result.count}
          sequenceType={result.sequenceType}
          onViewCampaigns={() => navigate('/campaigns')}
          onScheduleAnother={() => setStep(1)}
        />
      )}
    </MainLayout>
  );
};
```

---

## 🔌 API Integration {#api-integration}

### API Service (services/api.ts)

```typescript
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Sequences
  getSequences: (params?: { page?: number; limit?: number }) =>
    client.get('/sequences', { params }),
  getSequence: (id: string) => client.get(`/sequences/${id}`),
  initializeSequences: (payload: InitPayload) =>
    client.post('/sequences/initialize', payload),
  pauseSequence: (id: string) => client.post(`/sequences/${id}/pause`),
  resumeSequence: (id: string) => client.post(`/sequences/${id}/resume`),
  markReplied: (id: string) => client.post(`/sequences/${id}/mark-replied`),

  // Analytics
  getAnalytics: (params?: { dateRange?: string }) =>
    client.get('/sequences/analytics', { params }),
  getHealth: () => client.get('/sequences/health'),

  // Contacts
  getContacts: (params?: { page?: number; limit?: number }) =>
    client.get('/contacts', { params }),
  createContacts: (payload: Contact[]) =>
    client.post('/contacts', { contacts: payload }),
  updateContact: (id: string, payload: Partial<Contact>) =>
    client.patch(`/contacts/${id}`, payload),

  // Compliance (Phase 4)
  checkCompliance: (sequenceType: 'A' | 'B') =>
    client.get('/compliance/check', { params: { sequenceType } }),
  verifyEmail: (email: string) =>
    client.post('/compliance/verify-email', { email }),
  getAuditLog: (params?: { email?: string; type?: string; startDate?: string; endDate?: string }) =>
    client.get('/compliance/audit-log', { params }),
};
```

### Hooks for Data Fetching

#### useSequences.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useSequences = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['sequences', page, limit],
    queryFn: () => api.getSequences({ page, limit }),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds for real-time updates
  });
};

export const useSequenceDetail = (id: string) => {
  return useQuery({
    queryKey: ['sequence', id],
    queryFn: () => api.getSequence(id),
    staleTime: 30000,
  });
};
```

#### useAnalytics.ts

```typescript
export const useAnalytics = (dateRange = '30d') => {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => api.getAnalytics({ dateRange }),
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
};
```

#### useCampaign.ts

```typescript
import { useMutation } from '@tanstack/react-query';

export const usePauseSequence = () => {
  return useMutation({
    mutationFn: (id: string) => api.pauseSequence(id),
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
  });
};

export const useResumeSequence = () => {
  return useMutation({
    mutationFn: (id: string) => api.resumeSequence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
  });
};
```

---

## 📊 Data Models & TypeScript {#data-models}

### types/sequence.ts

```typescript
export interface Sequence {
  _id: string;
  contactId: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    industry: string;
  };
  sequenceType: 'A' | 'B';
  sequenceStatus: 'active' | 'paused' | 'completed' | 'replied' | 'bounced' | 'unsubscribed';
  currentEmailNumber: number; // 1-5
  nextEmailScheduledFor: Date | null;
  
  emailHistory: {
    emailNumber: number;
    subject: string;
    body: string;
    variant: string;
    sentAt: Date;
    deliveryStatus: 'sent' | 'failed' | 'pending';
    bounceCode?: string;
    bounceMessage?: string;
  }[];
  
  abTest: {
    variant: string; // Which subject/body variant was sent
    sequenceNumber: number;
  };
  
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### types/analytics.ts

```typescript
export interface Analytics {
  sequenceType: string;
  totalSequencesStarted: number;
  
  sequenceStatusBreakdown: {
    active: number;
    paused: number;
    completed: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
  };
  
  emailsSentBreakdown: {
    [key: string]: number; // Email 1 sent count, etc.
  };
  
  totalReplies: number;
  replyRate: number; // 0-1 (12.5%)
  
  bounceStats: {
    totalBounced: number;
    hardBounces: number;
    softBounces: number;
    complaints: number;
  };
  
  abTestResults: {
    [variant: string]: {
      sent: number;
      replies: number;
      replyRate: number;
      bounceRate: number;
    };
  };
  
  emailMetrics: {
    emailNumber: number;
    sent: number;
    replies: number;
    replyRate: number;
    bounceRate: number;
  }[];
  
  trendData: {
    date: string; // YYYY-MM-DD
    sent: number;
    replied: number;
    bounced: number;
    replyRate: number;
  }[];
}
```

### types/contact.ts

```typescript
export interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  industry: string;
  
  flags?: {
    bounced: boolean;
    bounceType?: 'hard' | 'soft' | 'complaint';
    bounceReason?: string;
    bouncedAt?: Date;
    unsubscribe: boolean;
    doNotContact: boolean;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

## 🎨 Design System {#design-system}

### Tailwind Configuration (tailwind.config.js)

```javascript
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        success: { 500: '#16a34a', 600: '#15803d' },
        error: { 500: '#dc2626', 600: '#b91c1c' },
        warning: { 500: '#ea580c', 600: '#c2410c' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

### Component Styling Examples

```typescript
// Button component (common/Button.tsx)
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = 
  ({ variant = 'primary', size = 'md', children, ...props }) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-error-600 text-white hover:bg-error-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`rounded font-medium transition ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
};
```

---

## 💾 State Management {#state-management}

### TanStack Query Setup

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById('root')
);
```

### Local Storage for Preferences

```typescript
// utils/storage.ts
export const storage = {
  getPreferences: () => {
    const saved = localStorage.getItem('user_preferences');
    return saved ? JSON.parse(saved) : {};
  },
  setPreferences: (prefs: Record<string, any>) => {
    localStorage.setItem('user_preferences', JSON.stringify(prefs));
  },
  getTheme: () => localStorage.getItem('theme') || 'light',
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
};
```

---

## 🧪 Testing Strategy {#testing}

### Unit Tests (Jest + React Testing Library)

```typescript
// components/common/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-error-600');
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### E2E Tests (Cypress)

```javascript
// cypress/e2e/campaigns.cy.js
describe('Campaign Management', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password');
    cy.visit('/campaigns');
  });

  it('displays campaign table', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('filters campaigns by status', () => {
    cy.get('select[name="status"]').select('active');
    cy.get('table tbody tr').each(row => {
      cy.wrap(row).within(() => {
        cy.contains('Active');
      });
    });
  });

  it('pauses a campaign', () => {
    cy.get('button:contains("Pause")').first().click();
    cy.contains('Campaign paused').should('be.visible');
    cy.get('table tbody tr').first().contains('Paused');
  });
});
```

---

## 🚀 Deployment Guide {#deployment}

### Development

```bash
# Install dependencies
npm install

# Start dev server (Vite HMR on port 5173)
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

### Production Build

```bash
# Build (generates dist/)
npm run build

# Test production build locally
npm run preview

# Output size analysis
npm run build -- --analyze
```

### Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add REACT_APP_API_URL https://api.factoryjet.com/api
```

### Environment Variables (.env.example)

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FactoryJet Campaign Manager
VITE_SENTRY_DSN=https://...@sentry.io/...
```

---

## ✅ Success Criteria {#success-criteria}

- ✅ **Dashboard real-time:** Updates every 30s, shows live metrics
- ✅ **Campaign scheduler:** Creates sequences in <2 minutes (4 steps)
- ✅ **Analytics:** Shows reply rates, bounce rates, trends with charts
- ✅ **A/B results:** Identifies winning variants, statistical significance
- ✅ **Email preview:** Matches sent email exactly, shows token substitution
- ✅ **Mobile responsive:** Works on phones, tablets, desktop
- ✅ **Performance:** <3s load time on 4G (Lighthouse 80+)
- ✅ **No console errors:** Zero warnings or errors in browser console
- ✅ **Accessibility:** WCAG 2.1 AA (keyboard nav, screen readers)
- ✅ **Tests:** 80%+ code coverage (unit + E2E)

---

## 📦 Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0",
    "@heroicons/react": "^2.0.0",
    "tailwindcss": "^3.3.0",
    "date-fns": "^2.30.0",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "@testing-library/react": "^14.1.0",
    "jest": "^29.7.0",
    "cypress": "^13.6.0"
  }
}
```

---

## 🎯 Phase 5 Implementation Timeline

| Week | Deliverable | Status |
|------|-------------|--------|
| 1 | Project setup, build config, component structure | 📋 Planned |
| 2 | Layout components (Header, Sidebar, MainLayout) | 📋 Planned |
| 2-3 | Dashboard page + KPI cards + charts | 📋 Planned |
| 3-4 | Campaigns page + table + detail modal | 📋 Planned |
| 4-5 | Analytics page + performance charts | 📋 Planned |
| 5 | A/B test results page | 📋 Planned |
| 5-6 | Campaign scheduler (4-step wizard) | 📋 Planned |
| 6-7 | Email preview + contact import | 📋 Planned |
| 7-8 | Styling, dark mode, responsive design | 📋 Planned |
| 8-9 | Unit & E2E tests, Lighthouse optimization | 📋 Planned |
| 9-10 | QA, bug fixes, documentation | 📋 Planned |

---

## 📚 References & Related Docs

- **Phase 3:** `PHASE_3_IMPLEMENTATION.md` — Email delivery infrastructure
- **Phase 4:** `PHASE_4_PLAN.md` — Compliance & audit logging
- **Backend API:** `/api/sequences`, `/api/contacts`, `/api/compliance`
- **DNS Setup:** `backend/DNS_SETUP.md`

---

**Status:** Ready for Implementation  
**Next Step:** Initialize React project with Vite + TypeScript setup  
**Target:** Production-quality SPA for campaign management  

---

*Created: May 1, 2026*  
*Purpose: Complete specification for Phase 5 frontend implementation*  
*Vision: Beautiful, intuitive dashboard that makes email outreach effortless*
