# 🚀 BrandDefender - Brand Monitoring & Support Tickets System

### Live demo: https://branddefender.netlify.app/

## 📋 Project Description

**BrandDefender** is a comprehensive system for monitoring reviews, brand mentions, and managing support tickets with integrated analytics and AI analysis.

## 🎯 Key Features

### 📊 Dashboard with Real-time Analytics
- **Ticket Sentiment Analysis** - distribution into positive, negative, and neutral
- **Intent Classification** - analysis of user request types
- **Mention Sources** - statistics by data sources
- **Discussion Topics** - analysis of main themes
- **7-Day Dynamics** - chart showing ticket count changes with sentiment breakdown

### 🎫 Support Tickets System
- **Automatic Classification** based on `ai_ton_of_voice_value`
- **AI Sentiment Analysis** (positive/negative/neutral)
- **Intent Classification** via `ticket_type_title`
- **Thematic Analysis** via `ai_theme`
- **Sorted Tickets** by sentiment (positive → neutral → negative)

### 📱 Data Sources
- **Instagram** ✅ (active)
- **Facebook** 
- **Twitter**
- **App Store** ✅ (active)
- **Google Play** ✅ (active)
- **Google Maps** ✅ (active)
- **Google SERP**
- **TrustPilot**
- **Reddit**
- **Quora**
- **Forums**

### 🤖 AI Features
- **Automatic Response Generation** for tickets
- **Sentiment Analysis** of messages
- **Intent Classification** of users
- **Content Thematic Analysis**

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/          # UI components
│   │   ├── dashboard/       # Dashboard components
│   │   └── support/         # Support components
│   ├── pages/               # Application pages
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utilities and services
│   ├── store/               # Redux store
│   └── types/               # TypeScript types
```

### Backend (Supabase)
```
supabase/
├── migrations/              # Database migrations
├── functions/               # Edge Functions
└── seed/                    # Test data
```

## 🗄️ Database Structure

### Main Tables
- `companies` - companies
- `user_companies` - user-company relationships
- `companies_data_sources` - company data sources
- `v_company_support_tickets` - support tickets view
- `v_company_messages` - company messages view

### Dictionaries
- `data_sources_types` - data source types
- `msg_ticket_types` - ticket types
- `msg_ton_of_voices` - voice tones
- `system_roles` - user roles

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone <repository-url>
cd reactions

# Install frontend dependencies
cd frontend
npm install

# Start Supabase (locally)
cd ../supabase
supabase start

# Start frontend
cd ../frontend
npm run dev
```

### Configuration
1. Create `.env` file in `frontend/` folder:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Configure Supabase project
3. Run migrations: `supabase db reset`

## 📈 Analytics Features

### Sentiment Classification
```typescript
// Positive: ai_ton_of_voice_value > 0
// Negative: ai_ton_of_voice_value < 0  
// Neutral: ai_ton_of_voice_value = 0
```

### Category Statistics
- **Ticket Types** - distribution by `ticket_type_title`
- **Mention Sources** - analysis of `ai_company_answer_data_source_title`
- **Themes** - grouping by `ai_theme`
- **Dynamics** - changes over time via `created_at`

## 🛠️ Main Utilities

### `supportTicketsAnalysis.ts`
- Support tickets analysis
- Sentiment classification
- Statistics calculation
- Sorting and filtering

### `companyMessageService.ts`
- Working with company messages
- Getting latest messages
- Source statistics
- Data pagination

### `useSupportTickets.ts`
- React hook for ticket management
- Automatic data loading
- Status and sentiment filtering
- State management

## 🎨 UI/UX Features

### Design
- **Dark Theme** with gradients
- **Modern UI** with Tailwind CSS
- **Responsive Design** for all devices
- **Interactive Elements** with animations

### Components
- **MetricCard** - metric cards
- **LatestMessagesTable** - latest messages table
- **SupportTicketsAnalysis** - ticket analysis
- **ResponseConstructor** - response constructor

## 📊 Usage Examples

### Ticket Analysis
```typescript
import { analyzeSupportTickets } from '@/utils/supportTicketsAnalysis';

const analysis = analyzeSupportTickets(tickets);
console.log(analysis.sentimentStats);
// {
//   positive: { count: 15, percentage: 60.0 },
//   negative: { count: 5, percentage: 20.0 },
//   neutral: { count: 5, percentage: 20.0 }
// }
```

### Getting Messages
```typescript
import { companyMessageService } from '@/utils/companyMessageService';

const messages = await companyMessageService.getLatestCompanyMessages(companyId, 10);
```

## 🔧 Technologies

### Frontend
- **React 18** - UI library
- **TypeScript** - type safety
- **Tailwind CSS** - styling
- **Redux Toolkit** - state management
- **React Router** - routing
- **Lucide React** - icons

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - database
- **Edge Functions** - server logic
- **Row Level Security** - security

## 📝 API Endpoints

### Supabase Tables
- `companies` - CRUD operations with companies
- `user_companies` - user management
- `companies_data_sources` - data sources
- `v_company_support_tickets` - support tickets
- `v_company_messages` - messages

### Views
- `v_company_support_tickets` - aggregated ticket data
- `v_company_messages` - messages with context

## 🚀 Future Improvements

- [ ] Additional social networks
- [ ] Email notifications
- [ ] Report export
- [ ] API for external integrations
- [ ] Mobile application
- [ ] Extended analytics

## 📞 Support

For questions and suggestions, create Issues in the repository or contact the development team.

---

**BrandDefender** - your reliable assistant in brand reputation monitoring! 🎯