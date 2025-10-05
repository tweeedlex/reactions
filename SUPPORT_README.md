# 🎫 Support Module - Frontend Integration Guide

## 📋 Overview

The Support module provides a comprehensive ticket management system with AI-powered analysis and automated response suggestions. This guide covers all the necessary information for frontend integration.

## 🗄️ Database Schema

### Core Tables

#### 1. Support Tickets (`public.company_support_tickets`)
```sql
- id: SERIAL PRIMARY KEY
- message_id: INTEGER → crawler.company_messages(id)
- status_id: INTEGER → dictionaries.tickets_status(id)
- ticket_type_id: INTEGER → dictionaries.msg_ticket_types(id)
- tags_array: TEXT[] (AI-generated tags)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- updated_user_id: UUID → auth.users(id)
```

#### 2. AI Analysis (`public.ai_msg_analyze`)
```sql
- id: SERIAL PRIMARY KEY
- msg_id: BIGINT → crawler.company_messages(id)
- msg_ticket_type_id: BIGINT → dictionaries.msg_ticket_types(id)
- theme_text: TEXT (AI-identified theme)
- ton_of_voice_value: SMALLINT (-100 to 100)
- tags_array: TEXT[] (AI-generated tags)
- answer_text: TEXT (AI-suggested response)
- company_answer_data_source_id: BIGINT → ai_company_faq_url_sources(id)
```

#### 3. Company Messages (`crawler.company_messages`)
```sql
- id: SERIAL PRIMARY KEY
- task_id: INTEGER → crawler.task_list(id)
- text: TEXT (original message content)
- context: TEXT (metadata JSON)
- created_at: TIMESTAMP
```

#### 4. Ticket Types (`dictionaries.msg_ticket_types`)
```sql
- id: SERIAL PRIMARY KEY
- company_id: INTEGER → companies(id)
- title: VARCHAR(255)
- priority_rank: INTEGER
```

#### 5. Ticket Status (`dictionaries.tickets_status`)
```sql
- id: SERIAL PRIMARY KEY
- title: TEXT (Open, In Progress, Solved, Closed)
```

### Automatic Ticket Creation

**Trigger**: When AI analysis is inserted into `ai_msg_analyze`, a support ticket is automatically created in `company_support_tickets` with:
- `status_id = 1` (Open)
- `ticket_type_id` from AI analysis
- `message_id` from AI analysis
- `tags_array` from AI analysis



## 🎯 Frontend Integration

### 1. Fetching Tickets

The main view `v_company_support_tickets` provides comprehensive ticket data with AI analysis:

```typescript
// Get all tickets for a company with full AI data
const { data: tickets, error } = await supabase
  .from('v_company_support_tickets')
  .select(`
    id,
    status_title,
    ticket_type_title,
    ai_theme,
    user_message,
    ai_ton_of_voice_value,
    ai_ton_of_voice_title,
    tags_array,
    ai_suggested_answer_text,
    ai_company_answer_data_source_title,
    ai_company_answer_data_source_url,
    company_name,
    created_at,
    updated_at,
    company_id
  `)
  .eq('company_id', companyId)
  .order('created_at', { ascending: false });

// Get tickets by status
const { data: openTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('status_title', 'Open')
  .eq('company_id', companyId);

// Get tickets by type
const { data: technicalTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('ticket_type_title', 'Технічна підтримка')
  .eq('company_id', companyId);
```

### 2. Ticket Filtering

```typescript
// Filter by AI tone of voice (negative sentiment)
const { data: negativeTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .in('ai_ton_of_voice_title', ['Агресивна', 'Максимально агресивна']);

// Filter by AI tone value range
const { data: criticalTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .lte('ai_ton_of_voice_value', -75); // Very negative tone

// Filter by tags (array contains)
const { data: urgentTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .contains('tags_array', ['терміново']);

// Search by AI theme
const { data: themeTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .ilike('ai_theme', '%проблема%');

// Complex filtering: High priority + negative tone
const { data: priorityNegativeTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .lte('ai_ton_of_voice_value', -50)
  .contains('tags_array', ['терміново', 'скарга-клієнта']);
```

### 3. Ticket Management

```typescript
// Update ticket status
const { error } = await supabase
  .from('company_support_tickets')
  .update({ 
    status_id: newStatusId,
    updated_user_id: userId 
  })
  .eq('id', ticketId);

// tickets_status
// id,title
// 1,Open
// 2,In Progress
// 3,Solved
// 4,Closed

// Add tags to ticket
const { error } = await supabase
  .from('company_support_tickets')
  .update({ 
    tags_array: [...existingTags, 'new-tag']
  })
  .eq('id', ticketId);

// Update ticket type
const { error } = await supabase
  .from('company_support_tickets')
  .update({ ticket_type_id: newTypeId })
  .eq('id', ticketId);
```

## 🤖 AI Integration Features

### Automatic Workflow

1. **Message Crawling**: Messages are collected from various sources (App Store, Google Play, etc.)
2. **AI Analysis**: Messages are analyzed by AI and stored in `ai_msg_analyze`
3. **Auto Ticket Creation**: Trigger automatically creates support tickets
4. **Manual Review**: Support team can review and manage tickets

### AI Analysis Fields

Each ticket includes comprehensive AI analysis:

- **`ai_theme`** - AI-identified topic/theme (e.g., "Проблема з повідомленнями про бонуси")
- **`ai_ton_of_voice_value`** - Numeric tone value (-100 to 100)
- **`ai_ton_of_voice_title`** - Human-readable tone description
- **`tags_array`** - AI-generated tags (e.g., ['сповіщення', 'бонуси', 'негатив'])
- **`ai_suggested_answer_text`** - AI-suggested response
- **`ai_company_answer_data_source_title`** - Source of AI knowledge
- **`ai_company_answer_data_source_url`** - URL to knowledge source

### Tone of Voice Mapping

```typescript
const toneMapping = {
  -100: 'Максимально агресивна',
  -75: 'Агресивна',
  -50: 'Негативна',
  -25: 'Легко негативна',
  0: 'Нейтральна',
  25: 'Легко позитивна',
  50: 'Позитивна',
  75: 'Дуже позитивна',
  100: 'Максимально позитивна'
};
```

## 📊 Dashboard Components

### 1. Ticket Statistics

```typescript
// Get ticket counts by status
const { data: statusCounts } = await supabase
  .from('v_company_support_tickets')
  .select('status_title')
  .eq('company_id', companyId);

// Get AI tone distribution
const { data: toneDistribution } = await supabase
  .from('v_company_support_tickets')
  .select('ai_ton_of_voice_title')
  .eq('company_id', companyId);

// Get tickets created today (auto-created from AI analysis)
const today = new Date().toISOString().split('T')[0];
const { data: todayTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .gte('created_at', today);
```

### 2. Priority Issues

```typescript
// Get high-priority tickets
const { data: priorityTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .in('ai_ton_of_voice_title', ['Агресивна', 'Максимально агресивна'])
  .order('created_at', { ascending: false });
```

## 🏷️ Tag Management

### Company Tags

```typescript
// Get company tags
const { data: companyTags } = await supabase
  .from('company_tags')
  .select('*')
  .eq('company_id', companyId)
  .order('attention_rank', { ascending: false });

// Create new tag
const { error } = await supabase
  .from('company_tags')
  .insert({
    company_id: companyId,
    title: 'new-tag',
    attention_rank: 80
  });
```

### Ticket Type Management

```typescript
// Get ticket types for company
const { data: ticketTypes } = await supabase
  .from('msg_ticket_types')
  .select('*')
  .eq('company_id', companyId)
  .order('priority_rank');

// Create new ticket type
const { error } = await supabase
  .from('msg_ticket_types')
  .insert({
    company_id: companyId,
    title: 'New Ticket Type',
    priority_rank: 1
  });
```

## 🔄 Real-time Updates

```typescript
// Subscribe to ticket updates
const subscription = supabase
  .channel('ticket-updates')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'company_support_tickets' 
    }, 
    (payload) => {
      console.log('Ticket updated:', payload);
      // Update UI
    }
  )
  .subscribe();

// Subscribe to AI analysis updates (new tickets being auto-created)
const aiSubscription = supabase
  .channel('ai-analysis-updates')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'ai_msg_analyze' 
    }, 
    (payload) => {
      console.log('New AI analysis:', payload);
      // This will trigger automatic ticket creation
    }
  )
  .subscribe();
```

## 🎫 Working with Auto-Created Tickets

### Understanding the Flow

1. **AI Analysis Insert**: When `ai_msg_analyze` gets a new row, the trigger automatically creates a support ticket
2. **Default Values**: New tickets start with:
   - `status_id = 1` (Open)
   - `ticket_type_id` from AI analysis
   - `tags_array` from AI analysis
3. **Manual Management**: Support team can then update status, add tags, etc.

### Monitoring Auto-Creation

```typescript
// Get recently auto-created tickets
const { data: recentTickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .eq('status_title', 'Open') // New tickets start as Open
  .order('created_at', { ascending: false })
  .limit(10);

// Get tickets with AI suggestions that haven't been addressed
const { data: pendingAITickets } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .eq('status_title', 'Open')
  .not('ai_suggested_answer_text', 'is', null);
```

## 📱 Mobile Considerations

### Responsive Design

- **Ticket Cards**: Display key information (status, type, AI theme)
- **AI Insights**: Show tone of voice and suggested responses
- **Tag Management**: Easy tag addition/removal
- **Status Updates**: Quick status change buttons

### Performance Optimization

```typescript
// Pagination for large ticket lists
const { data: tickets, error } = await supabase
  .from('v_company_support_tickets')
  .select('*')
  .eq('company_id', companyId)
  .range(0, 19) // First 20 tickets
  .order('created_at', { ascending: false);
```

## 🎨 UI/UX Recommendations

### Ticket List View
- **Status badges** with color coding
- **AI tone indicators** (emojis or colors)
- **Priority highlighting** for urgent tickets
- **Quick actions** (status change, tag addition)

### Ticket Detail View
- **Full AI analysis** display
- **Suggested response** with edit capability
- **Tag management** interface
- **Status history** tracking

### Dashboard Widgets
- **Ticket volume** over time
- **AI tone distribution** charts
- **Response time** metrics
- **Tag usage** statistics

## 🔐 Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled. Ensure proper policies are set for:
- Company-specific data access
- User role-based permissions
- Ticket ownership validation

### API Endpoints
Consider creating API endpoints for:
- Bulk ticket operations
- AI analysis updates
- Report generation
- Data export

## 🚀 Getting Started

1. **Install Supabase client** in your frontend project
2. **Configure RLS policies** for your use case
3. **Set up real-time subscriptions** for live updates
4. **Implement ticket management** components
5. **Add AI insights** display features
6. **Test with sample data** from seed files

### Database Setup

The support module is automatically set up with:
- ✅ **Migrations applied**: All tables and triggers are created
- ✅ **Sample data seeded**: Test tickets with AI analysis
- ✅ **Auto-ticket creation**: Trigger creates tickets from AI analysis
- ✅ **Comprehensive view**: `v_company_support_tickets` with all data

### Sample Data Available

The seed files provide:
- **5 test messages** from Rozetka company
- **AI analysis** with tone, themes, and suggested responses
- **Auto-created tickets** from the trigger
- **Company tags** and ticket types
- **FAQ sources** for AI knowledge base

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Arrays**: https://www.postgresql.org/docs/current/arrays.html
- **Real-time Subscriptions**: https://supabase.com/docs/guides/realtime
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

*This module integrates with the existing crawler and AI analysis systems to provide comprehensive support ticket management with intelligent insights.*
