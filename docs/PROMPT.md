# 🚀 SplitBill - Complete Enterprise Webapp Specification

> **Context:** Development on **Windows** (SQLite dev). **Docker + PostgreSQL + Caddy** for Linux server deployment.
> **Development Principle:** Work in **PHASES**. **STOP at the end of each PHASE**. Only proceed to next phase when I say **"NICE"**.

## 🛠️ Technology Stack & Standards

### Core Technologies
- **Frontend:** Next.js 14+ (App Router) + TypeScript 5+
- **Styling:** Tailwind CSS 3+ + shadcn/ui + Radix UI + Framer Motion
- **Icons:** Lucide React (consistent icon system)
- **State Management:** Zustand (lightweight, perfect for this scale)
- **Database:** Prisma ORM (SQLite dev / PostgreSQL prod)
- **Validation:** Zod with TypeScript inference
- **Testing:** Jest + React Testing Library for algorithm validation
- **Export:** html2canvas + jsPDF for snapshot export
- **Deployment:** Docker + PostgreSQL + Caddy reverse proxy

### Code Quality Standards
- **Linting:** ESLint + Prettier with strict TypeScript rules
- **Path Aliases:** `@/` for `src/` directory
- **Component Structure:** Atomic design principles
- **Error Handling:** Comprehensive error boundaries and validation
- **Accessibility:** WCAG 2.1 AA compliance (roles, labels, focus management)
- **Performance:** Code splitting, lazy loading, optimized images

### Currency & Number Handling
- **No forced rounding** - preserve decimal precision
- **Display formatting only** using `Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND'})`
- **Internal storage** as DECIMAL type in database

---

## 🎨 Modern Enterprise Design System

### Visual Identity & Color Palette
```css
/* Primary Brand Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-900: #1e3a8a;

/* Neutral Grays */
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-500: #64748b;
--neutral-600: #475569;
--neutral-700: #334155;
--neutral-800: #1e293b;
--neutral-900: #0f172a;

/* Accent Colors */
--emerald-500: #10b981;
--rose-500: #f43f5e;
--amber-500: #f59e0b;
--violet-500: #8b5cf6;

/* Glass Morphism */
--glass-background: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Modern UI Components Specification

#### Glass Morphism Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-card-dark {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Typography Scale
- **Display:** 48px/52px, font-weight: 700, tracking: -0.025em
- **H1:** 36px/40px, font-weight: 600, tracking: -0.025em  
- **H2:** 30px/36px, font-weight: 600, tracking: -0.025em
- **H3:** 24px/32px, font-weight: 600
- **H4:** 20px/28px, font-weight: 600
- **Body Large:** 18px/28px, font-weight: 400
- **Body:** 16px/24px, font-weight: 400
- **Body Small:** 14px/20px, font-weight: 400
- **Caption:** 12px/16px, font-weight: 500

#### Spacing System
- **Base unit:** 4px (0.25rem)
- **Component padding:** 24px (6 units)
- **Section gaps:** 24px (6 units) 
- **Page margins:** 32px (8 units)
- **Card padding:** 32px (8 units)

#### Interactive Elements
- **Border radius:** 12px for buttons, 16px for cards, 8px for inputs
- **Shadow system:**
  - sm: 0 1px 2px rgba(0, 0, 0, 0.05)
  - md: 0 4px 6px rgba(0, 0, 0, 0.07)
  - lg: 0 10px 15px rgba(0, 0, 0, 0.1)
  - xl: 0 20px 25px rgba(0, 0, 0, 0.15)
- **Focus rings:** 2px solid primary-500 with 4px offset
- **Hover transitions:** 150ms ease-out
- **Loading animations:** Subtle pulse and skeleton effects

#### Modern Component Specifications

**Navigation Sidebar:**
```
- Width: 280px (desktop), slide-over (mobile)
- Background: glass morphism with blur
- Logo area: 64px height with gradient accent
- Navigation items: 48px height with hover states
- Active state: subtle gradient + border accent
```

**Data Tables:**
```
- Header: sticky, glass background, 56px height
- Rows: 64px height, hover: subtle background change
- Alternating row colors: very subtle (2% opacity)
- Sort indicators: animated arrows
- Loading: skeleton rows with shimmer effect
```

**Form Controls:**
```
- Input height: 48px
- Select height: 48px  
- Checkbox/Switch: 24px with smooth animations
- Focus states: ring + border color change
- Error states: red border + icon + message
```

---

## 📊 Database Schema & Domain Models

### Prisma Schema Structure

#### Development Schema (`prisma/schema.dev.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client-dev"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Bank {
  id       String    @id @default(cuid())
  code     String    @unique
  name     String
  logoUrl  String?
  type     BankType  @default(BANK)
  people   Person[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Person {
  id            String   @id @default(cuid())
  displayName   String   @unique
  bankCode      String?
  accountNumber String?
  accountHolder String?
  qrUrl         String?
  active        Boolean  @default(true)
  bank          Bank?    @relation(fields: [bankCode], references: [code])
  groups        GroupMember[]
  bills         BillParticipant[]
  payerBills    Bill[]   @relation("PayerBills")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Group {
  id        String        @id @default(cuid())
  name      String        @unique
  members   GroupMember[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model GroupMember {
  id       String @id @default(cuid())
  groupId  String
  personId String
  group    Group  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  person   Person @relation(fields: [personId], references: [id], onDelete: Cascade)
  
  @@unique([groupId, personId])
}

model Bill {
  id           String            @id @default(cuid())
  title        String
  date         DateTime          @default(now())
  note         String?
  status       BillStatus        @default(DRAFT)
  tags         String[]          @default([])
  payerId      String
  payer        Person            @relation("PayerBills", fields: [payerId], references: [id])
  participants BillParticipant[]
  items        Item[]
  logs         BillLog[]
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

model BillParticipant {
  id       String  @id @default(cuid())
  billId   String
  personId String
  isPayer  Boolean @default(false)
  order    Int     @default(0)
  bill     Bill    @relation(fields: [billId], references: [id], onDelete: Cascade)
  person   Person  @relation(fields: [personId], references: [id], onDelete: Cascade)
  shares   ItemShare[]
  
  @@unique([billId, personId])
}

model Item {
  id          String      @id @default(cuid())
  billId      String
  name        String
  fee         Decimal?    @db.Decimal(10,2)
  splitMethod SplitMethod @default(EQUAL)
  type        ItemType    @default(NORMAL)
  order       Int         @default(0)
  bill        Bill        @relation(fields: [billId], references: [id], onDelete: Cascade)
  shares      ItemShare[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model ItemShare {
  id            String          @id @default(cuid())
  itemId        String
  participantId String
  include       Boolean         @default(true)
  locked        Boolean         @default(false)
  paid          Boolean         @default(false)
  rawInput      String?
  amount        Decimal         @default(0) @db.Decimal(10,2)
  item          Item            @relation(fields: [itemId], references: [id], onDelete: Cascade)
  participant   BillParticipant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  
  @@unique([itemId, participantId])
}

model BillLog {
  id        String      @id @default(cuid())
  billId    String
  action    LogAction
  payload   Json?
  timestamp DateTime    @default(now())
  bill      Bill        @relation(fields: [billId], references: [id], onDelete: Cascade)
}

enum BankType {
  BANK
  EWALLET
}

enum BillStatus {
  DRAFT
  ACTIVE
  SETTLED
}

enum SplitMethod {
  EQUAL
  PERCENT
  CUSTOM
}

enum ItemType {
  NORMAL
  CARRY_OVER
  SPECIAL
}

enum LogAction {
  BUILD_PARTICIPANTS
  DISTRIBUTE_ALL
  DISTRIBUTE_ITEM
  RESET
  EXPORT
  UPDATE_BILL
  UPDATE_ITEM
}
```

#### Production Schema (`prisma/schema.prod.prisma`)
```prisma
// Same schema but with PostgreSQL datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
// ... rest identical except @db.Decimal precision adjustments
```

---

## 🔧 Development Environment Setup

### Package Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:gen:dev": "prisma generate --schema prisma/schema.dev.prisma",
    "db:mig:dev": "prisma migrate dev --schema prisma/schema.dev.prisma",
    "db:gen:prod": "prisma generate --schema prisma/schema.prod.prisma", 
    "db:mig:prod": "prisma migrate deploy --schema prisma/schema.prod.prisma",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio:dev": "prisma studio --schema prisma/schema.dev.prisma",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write ."
  }
}
```

### Seed Data (`prisma/seed.ts`)
```typescript
// Comprehensive seed for Vietnamese banks and e-wallets
const vietnameseBanks = [
  { code: "VCB", name: "Vietcombank", type: "BANK", logoUrl: "/banks/vcb.svg" },
  { code: "ACB", name: "ACB", type: "BANK", logoUrl: "/banks/acb.svg" },
  { code: "TCB", name: "Techcombank", type: "BANK", logoUrl: "/banks/tcb.svg" },
  { code: "VTB", name: "Vietinbank", type: "BANK", logoUrl: "/banks/vtb.svg" },
  { code: "BIDV", name: "BIDV", type: "BANK", logoUrl: "/banks/bidv.svg" },
  { code: "MOMO", name: "MoMo", type: "EWALLET", logoUrl: "/banks/momo.svg" },
  { code: "ZALOPAY", name: "ZaloPay", type: "EWALLET", logoUrl: "/banks/zalopay.svg" },
  // ... additional banks
];
```

---

## 🎯 Detailed Page Specifications

### 1. Dashboard (`/`) - Landing & Overview

#### Layout Structure
```
┌─ Header ────────────────────────────────────────────────────────┐
│  SplitBill Logo + [New Bill] Primary Button                     │
├─ Filters ───────────────────────────────────────────────────────┤
│  Date Range | Payer Select | Group Select | Search Input        │
├─ Bills Grid/List ───────────────────────────────────────────────┤
│  ┌─ Bill Card ─────────────────────────────────────────────────┐ │
│  │  Title • Date • Status Badge                                │ │
│  │  Payer Avatar + Name • Total: 1,250,000 VND                 │ │
│  │  [View] [Clone]                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Component Specifications
- **Header:** Glass morphism navbar, 80px height, sticky
- **New Bill Button:** Primary gradient, 48px height, prominent placement
- **Filter Bar:** Glass card, 64px height, horizontal layout with gaps
- **Bill Cards:** Glass morphism, hover animations, 120px height minimum
- **Empty State:** Centered illustration + "Create your first bill" CTA
- **Loading State:** Skeleton cards with shimmer animation

#### Behavioral Requirements
- **New Bill Modal:** Multi-step form (Title → Payer → Participants mode)
- **Real-time search:** Debounced input with 300ms delay
- **Pagination:** Infinite scroll or paginated (configurable)
- **Responsive:** Grid to single column on mobile

#### API Integration
```typescript
// GET /api/bills?search=&payer=&group=&status=&page=
interface DashboardBillsResponse {
  bills: {
    id: string;
    title: string;
    date: string;
    totalFee: number;
    status: BillStatus;
    payer: {
      displayName: string;
      bank?: { logoUrl: string };
    };
  }[];
  pagination: {
    page: number;
    limit: number; 
    total: number;
  };
}
```

#### Acceptance Criteria
- [ ] Loads within 500ms on desktop
- [ ] New bill creation completes in <3 taps
- [ ] Search results update smoothly without jarring
- [ ] Mobile layout maintains usability
- [ ] Empty states are engaging and actionable

---

### 2. Banks Management (`/banks`) - Financial Institution Setup

#### Layout Structure
```
┌─ Header ────────────────────────────────────────────────────────┐
│  Banks Management + [Add Bank] Button                           │
├─ Banks Table ───────────────────────────────────────────────────┤
│  Code │ Name          │ Type    │ Logo  │ Actions              │
│  VCB  │ Vietcombank   │ Bank    │ [img] │ [Edit] [Delete]      │
│  MOMO │ MoMo          │ E-Wallet│ [img] │ [Edit] [Delete]      │
└─────────────────────────────────────────────────────────────────┘
```

#### Advanced Features
- **Logo Preview:** Real-time preview when entering logoUrl
- **Bulk Import:** CSV upload for multiple banks
- **Validation:** Unique code constraints with helpful error messages
- **Bank Type Icons:** Visual differentiation between banks and e-wallets
- **Usage Analytics:** Show count of people using each bank

#### Form Specifications
```
Modal Form Fields:
- Code: [Text Input] (uppercase, 2-10 chars, unique validation)
- Name: [Text Input] (required, 2-50 chars)
- Type: [Select] BANK | EWALLET with icons
- Logo URL: [URL Input] with preview thumbnail
- [Cancel] [Save] buttons with loading states
```

#### API Schema
```typescript
interface BankDTO {
  code: string;        // Primary key, uppercase
  name: string;        // Display name
  type: 'BANK' | 'EWALLET';
  logoUrl?: string;    // Optional logo URL
}
```

#### Acceptance Criteria
- [ ] Logo previews update in real-time
- [ ] Code validation prevents duplicates
- [ ] Table supports sorting and filtering
- [ ] Delete confirms impact on existing people
- [ ] Mobile table converts to cards

---

### 3. People Management (`/people`) - Contact Directory

#### Layout Structure
```
┌─ Header ────────────────────────────────────────────────────────┐
│  People Directory + [Add Person] + Search + Filter              │
├─ People Grid ───────────────────────────────────────────────────┤
│  ┌─ Person Card ───────────────────────────────────────────────┐ │
│  │  [Avatar] Display Name          [Active Toggle]             │ │
│  │  [Bank Logo] VCB • 1234567890                              │ │  
│  │  Account Holder Name                                        │ │
│  │  [QR Preview] [Edit] [Delete]                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Advanced Features
- **Smart Avatars:** Auto-generate from initials with color coding
- **QR Code Generation:** Auto-generate payment QR from bank + account
- **Quick Actions:** Inline editing of common fields
- **Batch Operations:** Multi-select for bulk activate/deactivate
- **Import/Export:** CSV support for contact management

#### Form Specifications
```
Person Form:
- Display Name: [Text] (required, unique, 2-50 chars)
- Bank: [Select] from Banks table with logos
- Account Number: [Text] (optional, bank-specific validation)
- Account Holder: [Text] (optional, full legal name)
- QR URL: [URL] (optional, payment QR code)
- Active: [Toggle] (default: true)
```

#### Card Specifications
- **Dimensions:** 320px width, auto height, glass morphism
- **Hover Effects:** Lift animation with enhanced shadow
- **Status Indicators:** Subtle opacity change for inactive users
- **Bank Integration:** Logo, colors from bank data

#### Acceptance Criteria
- [ ] Grid responsive (4→3→2→1 columns)
- [ ] Search works across all text fields
- [ ] Bank filter shows logo + count
- [ ] QR codes display properly sized
- [ ] Form validation prevents duplicate names

---

### 4. Groups Management (`/groups`) - Team Organization

#### Layout Structure
```
┌─ Header ────────────────────────────────────────────────────────┐
│  Groups + [Create Group] Button                                 │
├─ Groups Table ──────────────────────────────────────────────────┤
│  Group Name     │ Members                    │ Actions          │
│  Regular Dinner │ [Alice] [Bob] [Charlie]   │ [Edit] [Delete]  │
│  Work Team      │ [David] [Eve] [Frank]     │ [Edit] [Delete]  │
└─────────────────────────────────────────────────────────────────┘
```

#### Advanced Features
- **Member Chips:** Avatar thumbnails with names, removable
- **Quick Add:** Type-ahead search to add members
- **Templates:** Suggest groups based on bill history
- **Nested Groups:** Support for sub-groups (optional)

#### Dialog Specifications
```
Group Editor Modal:
- Group Name: [Text Input] (required, unique)
- Members: [Multi-Select with Search]
  - Shows: Avatar + Name + Bank
  - Supports: Type-ahead search
  - Actions: Add, Remove with animation
- [Cancel] [Save] buttons
```

#### Acceptance Criteria
- [ ] Member search is instant and accurate  
- [ ] Drag-and-drop reordering of members
- [ ] Groups show usage count in bills
- [ ] Delete prevention when group is in use
- [ ] Mobile layout stacks table rows

---

### 5. Bills Archive (`/bills`) - Historical Records

#### Layout Structure  
```
┌─ Header ────────────────────────────────────────────────────────┐
│  Bill Archive + Advanced Filters                                │
├─ Filter Panel ──────────────────────────────────────────────────┤
│  Date Range │ Payer │ Group │ Status │ Amount Range │ Tags       │
├─ Bills Table ───────────────────────────────────────────────────┤
│  Title        │Date     │Payer    │Amount    │Status │Actions   │
│  Team Lunch   │Dec 15   │Alice    │2,400,000 │Active │View Clone│
│  Coffee Run   │Dec 14   │Bob      │150,000   │Paid   │View Clone│
└─────────────────────────────────────────────────────────────────┘
```

#### Advanced Features
- **Smart Filters:** Combined filters with AND/OR logic
- **Export Options:** CSV, Excel, PDF exports of bill lists
- **Bulk Actions:** Multi-select for status updates
- **Analytics Panel:** Spending trends, top payers, etc.
- **Favorites:** Star frequently accessed bills

#### Filter Specifications
- **Date Range:** Calendar picker with presets (This Week, Last Month)
- **Amount Range:** Dual slider for min/max amounts
- **Status Filter:** Multi-select chips with colors
- **Tag Filter:** Auto-complete with existing tags

#### Acceptance Criteria
- [ ] Filters combine logically without conflicts
- [ ] Table supports column sorting and resizing
- [ ] Clone preserves structure but resets amounts  
- [ ] Export functions work reliably
- [ ] Search indexes all relevant text fields

---

### 6. Bill Detail (`/bill/[id]`) - Core Workspace

#### Layout Architecture
```
┌─ Header ────────────────────────────────────────────────────────┐
│  [← Back] Bill Title (editable) • Date • Status • Tags          │
├─ Main Content ──────────────────────┬─ Payer Sidebar ──────────┤
│  ┌─ Participants Panel ─────────────┐ │  ┌─ Payer Card ────────┐ │
│  │  Manual/Group Toggle • Build    │ │  │  [Avatar] Name      │ │
│  └─────────────────────────────────┘ │  │  [Bank] Account     │ │
│  ┌─ Items Table ───────────────────┐ │  │  [QR Code]          │ │
│  │  Item│Fee│Method│Alice│Bob│... │ │  │  "PAYER" Badge      │ │
│  │  ...items...                   │ │  └─────────────────────┘ │
│  │  Carry-over Adj│±amounts...    │ │                          │
│  │  Special Adj   │±amounts...    │ │  ┌─ Totals Card ───────┐ │
│  └─────────────────────────────────┘ │  │  Total Fee:         │ │
│  ┌─ Actions ───────────────────────┐ │  │  Per Person:        │ │
│  │  [Distribute] [Reset] [+Item]  │ │  │  Outstanding:       │ │
│  └─────────────────────────────────┘ │  └─────────────────────┘ │
└─────────────────────────────────────┴─────────────────────────┘
```

#### Participants Panel Deep Dive
```
┌─ Participants Setup ────────────────────────────────────────────┐
│  Mode: [Manual] [Group] (Toggle buttons)                        │
│  ┌─ Manual Mode ──────────────────────────────────────────────┐ │
│  │  Count: [5] → Render 5 person selectors                   │ │
│  │  [Person 1 ▼] [Person 2 ▼] [Person 3 ▼] ...              │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌─ Group Mode ───────────────────────────────────────────────┐ │
│  │  Group: [Work Team ▼] → Auto-populate members             │ │
│  │  ✓ Alice  ✓ Bob  ✓ Charlie  + Add More                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│  [Build Participants] (Primary button)                          │
└─────────────────────────────────────────────────────────────────┘
```

#### Items Table Specifications
```
Column Layout:
- Item Name: [Text Input] expandable
- Fee: [Number Input] VND formatting  
- Split Method: [Dropdown] Equal/Percent/Custom
- Per Person Columns (Payer always last):
  - Include: [Switch] colored indicators
  - Locked: [Lock Icon Switch] with tooltip
  - Amount/Raw: [Input] context-sensitive
  - Paid: [Checkbox] with checkmark animation

Row States:
- Normal: Standard styling
- All Paid: Green background + strikethrough
- Has Errors: Red border + error indicators
- Editing: Focused styling with save/cancel

Keyboard Navigation:
- Enter: Move to next row, same column
- Tab: Move to next column
- Ctrl/Cmd+Enter: Add new item row
- Escape: Cancel editing
```

#### Split Method Logic Detail
```
Equal Split:
- Distribute fee / count(include=true)
- Skip locked=true participants
- Show calculated amounts

Percent Split:
- Accept % in rawInput
- Calculate amount = fee × (percent/100)
- Warn if total ≠ 100%
- Skip locked participants

Custom Split:
- Accept currency amounts in rawInput
- Never override in distribute operations
- Allow manual balancing
```

#### Payer Card Specifications
```
Card Layout (280px width, sticky):
- Avatar: 64px circular with border
- Name: H3 typography + "PAYER" badge
- Bank Info: Logo + account details
- QR Code: 200px square, payment-ready
- Styling: Enhanced glass morphism + accent border
```

#### Advanced Interactions
- **Bulk Edit:** Multi-select rows for batch operations
- **Templates:** Save item patterns for reuse
- **Smart Distribution:** AI-suggested splits based on context
- **Real-time Validation:** Live error feedback
- **Auto-save:** Periodic background saves

#### Acceptance Criteria
- [ ] Payer always renders in last column with badge
- [ ] Build/Sync preserves existing data appropriately
- [ ] All split methods calculate accurately
- [ ] Adjustments affect totals but not Total Fee
- [ ] Table remains performant with 20+ participants
- [ ] Mobile layout maintains all functionality
- [ ] Keyboard navigation is intuitive
- [ ] Real-time updates don't cause UI jumps

---

### 7. Snapshot Export (`/bill/[id]/snapshot`) - Clean Presentation

#### Layout Design
```
┌─ Clean Header ──────────────────────────────────────────────────────────────────────┐
│  Bill Title • Date • Status • Total: 2,400,000 VND                                 │
├─ Main Content Area ─────────────────────────────────────────────────────────────────┤
│  ┌─ Items Distribution Table ──────────────────────────────────────────────────────┐ │
│  │  Item Name        │ Fee        │ Gia Hưng  │ Huynh Giao │ Công Phúc │ Payer   │ │
│  │  Udon Thịt Heo   │ 39,200 ₫   │     -     │     -      │     -      │ 39,200  │ │
│  │  Gà Rút Xương    │ 49,000 ₫   │ 12,250 ₫  │ 12,250 ₫   │     -      │ 12,250  │ │
│  │  Bún Chả Giò     │ 27,000 ₫   │     -     │     -      │     -      │ 27,000  │ │
│  │  Rau Xào         │ 17,640 ₫   │  5,880 ₫  │  5,880 ₫   │     -      │  5,880  │ │
│  │  Mì Xào Chay     │ 12,480 ₫   │     -     │     -      │ 12,480 ₫   │    -    │ │
│  │  ---------------  │ ---------- │ --------- │ ---------- │ ---------- │ ------- │ │
│  │  Carry-over Adj   │     -      │     -     │     -      │     -      │    -    │ │
│  │  Special Adj      │ -6,500 ₫   │     -     │     -      │     -      │ -6,500  │ │
│  │  ===============  │ ========== │ ========= │ ========== │ ========== │ ======= │ │
│  │  TOTAL            │346,024 ₫   │ 45,449 ₫  │ 51,940 ₫   │ 99,274 ₫   │ 51,940  │ │
│  └──────────────────────────────────────────────────────────────────────────────────┘ │
├─ Payment Information ───────────────────────────────────────────────────────────────┤
│  ┌─ Payer Details ──────────────────────┐ ┌─ Outstanding Summary ─────────────────┐ │
│  │  [QR Code 200x200]                   │ │  • Gia Hưng owes: 45,449 ₫           │ │
│  │  NGUYỄN QUỐC KHẢI                     │ │  • Huynh Giao owes: 51,940 ₫         │ │
│  │  MoMo: 909123                         │ │  • Công Phúc owes: 99,274 ₫          │ │
│  │  Scan to pay your share               │ │  • Payer paid: 346,024 ₫ total       │ │
│  └───────────────────────────────────────┘ └───────────────────────────────────────┘ │
├─ Export Actions ────────────────────────────────────────────────────────────────────┤
│  [📋 Copy as Image] [🖨️ Print PDF]                                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

#### Table-First Design Philosophy

**Distribution Table Specifications:**
```
Layout Structure:
- Header Row: Sticky, glass background with gradient
- Item Name Column: 200px fixed width, left-aligned
- Fee Column: 120px, right-aligned with VND formatting
- Participant Columns: 100px each, center-aligned amounts
- Payer Column: 100px, highlighted with accent color
- Visual Separators: Subtle lines between sections (normal items, adjustments, totals)

Styling Details:
- Normal Items: Standard row styling with hover effects
- Adjustment Items: Slightly muted background (carry-over, special)
- Separator Rows: Dotted lines with "---" visual dividers
- Total Row: Bold styling with darker background
- Zero amounts: Display as "-" (dash) for cleaner look
- Negative amounts: Red text with minus sign
```

**Color-Coded Participants:**
- Each participant column has a subtle background color tint
- Payer column uses primary accent color
- Paid items can show checkmark indicators
- Outstanding amounts highlighted in the summary

**Mobile Responsive Approach:**
```
Mobile Layout (< 768px):
┌─ Header (collapsed) ─────────────────┐
│  Bill Title • Total: 346,024 ₫      │
├─ Stacked Cards Layout ──────────────┤
│  ┌─ Per Person Card ──────────────┐  │
│  │  Gia Hưng                      │  │
│  │  • Gà Rút Xương: 12,250 ₫      │  │
│  │  • Rau Xào: 5,880 ₫            │  │
│  │  ═══════════════════            │  │
│  │  Total Owes: 45,449 ₫          │  │
│  └─────────────────────────────────┘  │
├─ Payment QR ────────────────────────┤
│  [Centered QR + Details]            │
└─────────────────────────────────────┘
```
but when copy or exprot it still keep the desktop looking sizee

#### Content Rules & Data Display

**Amount Display Standards:**
- **Fee Column**: Full item cost in VND format
- **Participant Columns**: Individual share amounts
- **Zero Values**: Show as "-" instead of "0 ₫"
- **Negative Values**: Red color with "-" prefix
- **Totals**: Bold formatting with separator lines above

**Item Categorization:**
1. **Normal Items**: Regular purchases with distribution
2. **Adjustment Items**: Carry-over amounts, special adjustments (visually separated)
3. **Discounts/Fees**: Service charges, discounts (can be negative)
4. **Final Totals**: Sum across all categories

**Status Indicators:**
- **Paid Items**: Subtle green checkmark or background tint
- **Outstanding**: Clear indication in summary section
- **Payer**: Highlighted column with "PAYER" badge in header

#### Export Specifications

**Copy as Image:**
```typescript
// Table-optimized image capture
const captureOptions = {
  backgroundColor: '#ffffff',
  scale: 2, // High DPI for mobile sharing
  width: 800, // Optimal for mobile sharing
  useCORS: true,
  allowTaint: false,
  removeContainer: true // Clean edges
};

// Focus on table area only
const tableElement = document.querySelector('.snapshot-table');
const canvas = await html2canvas(tableElement, captureOptions);
```

**Print PDF Optimizations:**
```css
@media print {
  .snapshot-table {
    page-break-inside: avoid;
    font-size: 12px;
    width: 100%;
  }
  
  .snapshot-table th,
  .snapshot-table td {
    border: 1px solid #000 !important;
    padding: 8px 4px;
  }
  
  .participant-column {
    background: #f8f8f8 !important; /* Light gray for print */
  }
  
  .payer-column {
    background: #e5e5e5 !important; /* Darker gray for payer */
    font-weight: bold;
  }
  
  .qr-section {
    page-break-before: always; /* QR on separate page */
    text-align: center;
  }
}
```

#### Component Architecture

**Snapshot Table Component:**
```typescript
interface SnapshotTableProps {
  bill: BillDetail;
  totals: BillTotals;
  readonly?: boolean;
}

const SnapshotTable = ({ bill, totals }: SnapshotTableProps) => {
  const normalItems = bill.items.filter(item => item.type === 'NORMAL');
  const adjustmentItems = bill.items.filter(item => item.type !== 'NORMAL');
  
  return (
    <div className="snapshot-table glass-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-primary/20 to-accent/20 sticky top-0">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Item Name</th>
            <th className="text-right py-3 px-4 font-semibold">Fee</th>
            {bill.participants.map((participant) => (
              <th 
                key={participant.id}
                className={cn(
                  "text-center py-3 px-2 font-semibold text-sm",
                  participant.isPayer && "bg-primary/30 text-primary-foreground"
                )}
              >
                {participant.person.displayName}
                {participant.isPayer && (
                  <div className="text-xs opacity-75">PAYER</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Normal items */}
          {normalItems.map((item) => (
            <ItemRow key={item.id} item={item} participants={bill.participants} />
          ))}
          
          {/* Separator */}
          <SeparatorRow colSpan={2 + bill.participants.length} />
          
          {/* Adjustment items */}
          {adjustmentItems.map((item) => (
            <ItemRow 
              key={item.id} 
              item={item} 
              participants={bill.participants}
              className="bg-muted/30"
            />
          ))}
          
          {/* Total row */}
          <TotalRow totals={totals} participants={bill.participants} />
        </tbody>
      </table>
    </div>
  );
};
```

**QR Payment Section:**
```typescript
const QRPaymentSection = ({ payer }: { payer: Person }) => (
  <div className="grid md:grid-cols-2 gap-6 mt-6">
    <GlassCard className="text-center p-6">
      <div className="space-y-4">
        {payer.qrUrl && (
          <img 
            src={payer.qrUrl} 
            alt="Payment QR Code"
            className="w-48 h-48 mx-auto rounded-lg shadow-md"
          />
        )}
        <div>
          <h3 className="font-semibold text-lg">{payer.displayName}</h3>
          {payer.bank && (
            <p className="text-muted-foreground">
              {payer.bank.name}: {payer.accountNumber}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Scan to pay your share
          </p>
        </div>
      </div>
    </GlassCard>
    
    <GlassCard className="p-6">
      <h4 className="font-semibold mb-4">Outstanding Summary</h4>
      <div className="space-y-2">
        {totals.perPersonTotals.map((total) => (
          <div key={total.participantId} className="flex justify-between">
            <span>{getParticipantName(total.participantId)}</span>
            <Currency amount={total.amount} size="sm" />
          </div>
        ))}
      </div>
    </GlassCard>
  </div>
);
```

#### Acceptance Criteria
- [ ] Table-first layout prioritizes transparency and clarity
- [ ] Participants displayed as columns for easy scanning
- [ ] Payer column highlighted with distinct styling
- [ ] Zero amounts show as "-" for cleaner appearance
- [ ] Mobile layout converts to stacked person cards
- [ ] Copy as Image captures table with high quality
- [ ] Print PDF maintains table structure and readability
- [ ] QR code remains scannable in all export formats
- [ ] Outstanding amounts clearly summarized
- [ ] Load time under 200ms for snapshot generation
- [ ] Share link feature removed as requested

---

## 🔗 API Architecture & Data Transfer Objects

### Response Format Standards
```typescript
// Success Response
interface APIResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
}

// Error Response  
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // Field validation errors
    timestamp: string;
  };
}

// Pagination Meta
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Comprehensive Zod Schemas
```typescript
// lib/validations.ts
import { z } from "zod";

// Bank Management
export const BankCreateSchema = z.object({
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code cannot exceed 10 characters")
    .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  type: z.enum(["BANK", "EWALLET"]).default("BANK"),
  logoUrl: z.string().url("Must be a valid URL").optional(),
});

export const BankUpdateSchema = BankCreateSchema.partial().required({ code: true });

// Person Management
export const PersonCreateSchema = z.object({
  displayName: z.string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name cannot exceed 50 characters"),
  bankCode: z.string().optional(),
  accountNumber: z.string()
    .regex(/^[0-9\-\s]+$/, "Account number must contain only numbers, dashes, and spaces")
    .optional(),
  accountHolder: z.string()
    .max(100, "Account holder name cannot exceed 100 characters")
    .optional(),
  qrUrl: z.string().url("Must be a valid URL").optional(),
  active: z.boolean().default(true),
});

export const PersonUpdateSchema = PersonCreateSchema.partial().required({ displayName: true });

// Group Management
export const GroupCreateSchema = z.object({
  name: z.string()
    .min(2, "Group name must be at least 2 characters")
    .max(50, "Group name cannot exceed 50 characters"),
  personIds: z.array(z.string().cuid("Invalid person ID")).default([]),
});

export const GroupUpdateSchema = GroupCreateSchema.partial().required({ name: true });

// Bill Management
export const BillCreateSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  payerId: z.string().cuid("Invalid payer ID"),
  date: z.string().datetime().optional(),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional(),
  tags: z.array(z.string().max(20)).default([]),
  // Participant setup mode
  participantsMode: z.enum(["MANUAL", "GROUP"]),
  personIds: z.array(z.string().cuid()).optional(), // For manual mode
  groupId: z.string().cuid().optional(), // For group mode
  participantCount: z.number().int().min(2).max(20).optional(), // For manual mode
});

export const BillUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  date: z.string().datetime().optional(),
  note: z.string().max(500).optional(),
  tags: z.array(z.string().max(20)).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "SETTLED"]).optional(),
});

// Participants Management
export const ParticipantsBuildSchema = z.object({
  payerId: z.string().cuid("Invalid payer ID"),
  personIds: z.array(z.string().cuid("Invalid person ID")).min(1, "At least one participant required"),
});

// Item Management
export const ItemCreateSchema = z.object({
  name: z.string()
    .min(1, "Item name is required")
    .max(100, "Item name cannot exceed 100 characters"),
  fee: z.number()
    .nonnegative("Fee cannot be negative")
    .max(999999999, "Fee is too large")
    .optional(),
  splitMethod: z.enum(["EQUAL", "PERCENT", "CUSTOM"]).default("EQUAL"),
  type: z.enum(["NORMAL", "CARRY_OVER", "SPECIAL"]).default("NORMAL"),
  order: z.number().int().nonnegative().optional(),
});

export const ItemUpdateSchema = ItemCreateSchema.partial();

// Item Share Management
export const ItemShareUpdateSchema = z.object({
  include: z.boolean().optional(),
  locked: z.boolean().optional(),
  paid: z.boolean().optional(),
  rawInput: z.string().optional(),
  amount: z.number().nonnegative().optional(),
});

// Distribution Operations
export const DistributeAllSchema = z.object({
  billId: z.string().cuid("Invalid bill ID"),
});

export const DistributeItemSchema = z.object({
  itemId: z.string().cuid("Invalid item ID"),
});

// Search & Filter Schemas
export const BillsFilterSchema = z.object({
  search: z.string().optional(),
  payerId: z.string().cuid().optional(),
  groupId: z.string().cuid().optional(), 
  status: z.enum(["DRAFT", "ACTIVE", "SETTLED"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
```

### API Endpoint Documentation

#### Banks API (`/api/banks`)
```typescript
// GET /api/banks
interface BanksListResponse {
  banks: {
    id: string;
    code: string;
    name: string;
    type: "BANK" | "EWALLET";
    logoUrl?: string;
    _count: { people: number }; // Usage count
  }[];
}

// POST /api/banks
interface BankCreateRequest {
  code: string;
  name: string;  
  type?: "BANK" | "EWALLET";
  logoUrl?: string;
}

// PUT /api/banks/[code]
interface BankUpdateRequest {
  name?: string;
  type?: "BANK" | "EWALLET"; 
  logoUrl?: string;
}

// DELETE /api/banks/[code]
// Returns: { success: true } or error if bank is in use
```

#### People API (`/api/people`)
```typescript
// GET /api/people?search=&bankCode=&active=
interface PeopleListResponse {
  people: {
    id: string;
    displayName: string;
    bankCode?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrUrl?: string;
    active: boolean;
    bank?: {
      code: string;
      name: string;
      logoUrl?: string;
      type: "BANK" | "EWALLET";
    };
  }[];
}
```

#### Bills API (`/api/bills`)
```typescript
// GET /api/bills (with filters)
interface BillsListResponse {
  bills: {
    id: string;
    title: string;
    date: string;
    totalFee: number;
    status: "DRAFT" | "ACTIVE" | "SETTLED";
    tags: string[];
    payer: {
      id: string;
      displayName: string;
      bank?: {
        logoUrl?: string;
      };
    };
    _count: {
      participants: number;
      items: number;
    };
  }[];
  meta: PaginationMeta;
}

// GET /api/bills/[id] (full bill details)
interface BillDetailResponse {
  bill: {
    id: string;
    title: string;
    date: string;
    note?: string;
    status: "DRAFT" | "ACTIVE" | "SETTLED";
    tags: string[];
    payerId: string;
    payer: {
      id: string;
      displayName: string;
      bankCode?: string;
      accountNumber?: string;
      accountHolder?: string;
      qrUrl?: string;
      bank?: {
        code: string;
        name: string;
        logoUrl?: string;
      };
    };
    participants: {
      id: string;
      isPayer: boolean;
      order: number;
      person: {
        id: string;
        displayName: string;
        bank?: {
          logoUrl?: string;
        };
      };
    }[];
    items: {
      id: string;
      name: string;
      fee?: number;
      splitMethod: "EQUAL" | "PERCENT" | "CUSTOM";
      type: "NORMAL" | "CARRY_OVER" | "SPECIAL";
      order: number;
      shares: {
        id: string;
        participantId: string;
        include: boolean;
        locked: boolean;
        paid: boolean;
        rawInput?: string;
        amount: number;
      }[];
    }[];
    totals: {
      totalFee: number;
      perPerson: { participantId: string; amount: number }[];
      outstanding: { participantId: string; amount: number }[];
    };
  };
}
```

---

## 🧮 Distribution Algorithm Implementation

### Core Distribution Logic (`lib/distribute.ts`)
```typescript
import { Decimal } from 'decimal.js';

export interface ItemShareInput {
  participantId: string;
  include: boolean;
  locked: boolean;
  rawInput?: string;
  currentAmount: number;
}

export interface DistributionResult {
  shares: {
    participantId: string;
    amount: number;
    wasCalculated: boolean;
  }[];
  warnings: string[];
}

export class DistributionEngine {
  /**
   * Distribute item fee across participants based on split method
   */
  static distributeItem(
    fee: number,
    splitMethod: 'EQUAL' | 'PERCENT' | 'CUSTOM',
    shares: ItemShareInput[]
  ): DistributionResult {
    switch (splitMethod) {
      case 'EQUAL':
        return this.distributeEqual(fee, shares);
      case 'PERCENT': 
        return this.distributePercent(fee, shares);
      case 'CUSTOM':
        return this.distributeCustom(fee, shares);
      default:
        throw new Error(`Unknown split method: ${splitMethod}`);
    }
  }

  private static distributeEqual(fee: number, shares: ItemShareInput[]): DistributionResult {
    const result: DistributionResult = { shares: [], warnings: [] };
    
    // Find participants to distribute to (include=true, locked=false)
    const includedUnlocked = shares.filter(s => s.include && !s.locked);
    const includedLocked = shares.filter(s => s.include && s.locked);
    const excluded = shares.filter(s => !s.include);
    
    if (includedUnlocked.length === 0) {
      result.warnings.push('No participants available for equal distribution');
      // Return current amounts
      return {
        shares: shares.map(s => ({
          participantId: s.participantId,
          amount: s.currentAmount,
          wasCalculated: false
        })),
        warnings: result.warnings
      };
    }

    // Calculate locked total
    const lockedTotal = includedLocked.reduce((sum, s) => sum + s.currentAmount, 0);
    const remainingFee = Math.max(0, fee - lockedTotal);
    
    // Distribute remaining fee equally
    const amountPerPerson = new Decimal(remainingFee).div(includedUnlocked.length).toNumber();
    
    // Build result
    shares.forEach(share => {
      if (!share.include) {
        result.shares.push({
          participantId: share.participantId,
          amount: 0,
          wasCalculated: true
        });
      } else if (share.locked) {
        result.shares.push({
          participantId: share.participantId,
          amount: share.currentAmount,
          wasCalculated: false
        });
      } else {
        result.shares.push({
          participantId: share.participantId,
          amount: amountPerPerson,
          wasCalculated: true
        });
      }
    });

    return result;
  }

  private static distributePercent(fee: number, shares: ItemShareInput[]): DistributionResult {
    const result: DistributionResult = { shares: [], warnings: [] };
    
    // Calculate percentages and detect issues
    let totalPercent = 0;
    const percentShares: { participantId: string; percent: number; locked: boolean }[] = [];
    
    shares.forEach(share => {
      if (!share.include) {
        percentShares.push({ participantId: share.participantId, percent: 0, locked: false });
        return;
      }

      if (share.locked) {
        // Locked shares keep current amount, calculate equivalent percent
        const equivalentPercent = fee > 0 ? (share.currentAmount / fee) * 100 : 0;
        percentShares.push({ 
          participantId: share.participantId, 
          percent: equivalentPercent, 
          locked: true 
        });
        totalPercent += equivalentPercent;
      } else {
        // Parse percentage from rawInput
        const percent = parseFloat(share.rawInput || '0') || 0;
        percentShares.push({ 
          participantId: share.participantId, 
          percent, 
          locked: false 
        });
        totalPercent += percent;
      }
    });

    // Warn if percentages don't add up to 100%
    if (Math.abs(totalPercent - 100) > 0.01) {
      result.warnings.push(`Percentages total ${totalPercent.toFixed(1)}%, expected 100%`);
    }

    // Calculate amounts
    percentShares.forEach(({ participantId, percent, locked }) => {
      if (locked) {
        const share = shares.find(s => s.participantId === participantId)!;
        result.shares.push({
          participantId,
          amount: share.currentAmount,
          wasCalculated: false
        });
      } else {
        const amount = new Decimal(fee).mul(percent).div(100).toNumber();
        result.shares.push({
          participantId,
          amount,
          wasCalculated: true
        });
      }
    });

    return result;
  }

  private static distributeCustom(fee: number, shares: ItemShareInput[]): DistributionResult {
    const result: DistributionResult = { shares: [], warnings: [] };
    
    // Custom distribution doesn't auto-calculate
    // It respects manually entered amounts in rawInput
    shares.forEach(share => {
      if (!share.include) {
        result.shares.push({
          participantId: share.participantId,
          amount: 0,
          wasCalculated: false
        });
      } else {
        // Use rawInput as amount, or keep current amount
        const amount = share.rawInput ? parseFloat(share.rawInput) || 0 : share.currentAmount;
        result.shares.push({
          participantId: share.participantId,
          amount,
          wasCalculated: false // Custom amounts are not calculated
        });
      }
    });

    // Calculate total and warn if it doesn't match fee
    const totalAmount = result.shares.reduce((sum, s) => sum + s.amount, 0);
    if (fee && Math.abs(totalAmount - fee) > 0.01) {
      result.warnings.push(`Custom amounts total ${totalAmount.toLocaleString('vi-VN')} VND, item fee is ${fee.toLocaleString('vi-VN')} VND`);
    }

    return result;
  }

  /**
   * Calculate bill totals
   */
  static calculateBillTotals(items: {
    type: 'NORMAL' | 'CARRY_OVER' | 'SPECIAL';
    fee?: number;
    shares: { participantId: string; amount: number }[];
  }[]): {
    totalFee: number;
    perPersonTotals: { participantId: string; amount: number }[];
  } {
    // Total fee only includes NORMAL items
    const totalFee = items
      .filter(item => item.type === 'NORMAL')
      .reduce((sum, item) => sum + (item.fee || 0), 0);

    // Per person totals include ALL items (NORMAL + adjustments)
    const participantTotals = new Map<string, number>();
    
    items.forEach(item => {
      item.shares.forEach(share => {
        const current = participantTotals.get(share.participantId) || 0;
        participantTotals.set(share.participantId, current + share.amount);
      });
    });

    const perPersonTotals = Array.from(participantTotals.entries()).map(([participantId, amount]) => ({
      participantId,
      amount
    }));

    return { totalFee, perPersonTotals };
  }
}
```

### Algorithm Test Suite (`__tests__/distribute.test.ts`)
```typescript
import { DistributionEngine } from '../lib/distribute';

describe('DistributionEngine', () => {
  describe('Equal Distribution', () => {
    test('should distribute equally among included participants', () => {
      const shares = [
        { participantId: '1', include: true, locked: false, currentAmount: 0 },
        { participantId: '2', include: true, locked: false, currentAmount: 0 },
        { participantId: '3', include: false, locked: false, currentAmount: 0 },
      ];

      const result = DistributionEngine.distributeItem(100, 'EQUAL', shares);
      
      expect(result.shares).toEqual([
        { participantId: '1', amount: 50, wasCalculated: true },
        { participantId: '2', amount: 50, wasCalculated: true },
        { participantId: '3', amount: 0, wasCalculated: true },
      ]);
      expect(result.warnings).toHaveLength(0);
    });

    test('should respect locked amounts', () => {
      const shares = [
        { participantId: '1', include: true, locked: true, currentAmount: 30 },
        { participantId: '2', include: true, locked: false, currentAmount: 0 },
        { participantId: '3', include: true, locked: false, currentAmount: 0 },
      ];

      const result = DistributionEngine.distributeItem(100, 'EQUAL', shares);
      
      expect(result.shares).toEqual([
        { participantId: '1', amount: 30, wasCalculated: false },
        { participantId: '2', amount: 35, wasCalculated: true },
        { participantId: '3', amount: 35, wasCalculated: true },
      ]);
    });
  });

  describe('Percent Distribution', () => {
    test('should calculate amounts from percentages', () => {
      const shares = [
        { participantId: '1', include: true, locked: false, rawInput: '40', currentAmount: 0 },
        { participantId: '2', include: true, locked: false, rawInput: '60', currentAmount: 0 },
      ];

      const result = DistributionEngine.distributeItem(100, 'PERCENT', shares);
      
      expect(result.shares).toEqual([
        { participantId: '1', amount: 40, wasCalculated: true },
        { participantId: '2', amount: 60, wasCalculated: true },
      ]);
      expect(result.warnings).toHaveLength(0);
    });

    test('should warn when percentages do not total 100%', () => {
      const shares = [
        { participantId: '1', include: true, locked: false, rawInput: '30', currentAmount: 0 },
        { participantId: '2', include: true, locked: false, rawInput: '40', currentAmount: 0 },
      ];

      const result = DistributionEngine.distributeItem(100, 'PERCENT', shares);
      
      expect(result.warnings).toContain('Percentages total 70.0%, expected 100%');
    });
  });

  describe('Custom Distribution', () => {
    test('should use raw input as amounts', () => {
      const shares = [
        { participantId: '1', include: true, locked: false, rawInput: '45', currentAmount: 0 },
        { participantId: '2', include: true, locked: false, rawInput: '55', currentAmount: 0 },
      ];

      const result = DistributionEngine.distributeItem(100, 'CUSTOM', shares);
      
      expect(result.shares).toEqual([
        { participantId: '1', amount: 45, wasCalculated: false },
        { participantId: '2', amount: 55, wasCalculated: false },
      ]);
    });

    test('should warn when custom amounts do not match fee', () => {
      const shares = [
        { participantId: '1', include: true, locked: false, rawInput: '30', currentAmount: 0 },
        { participantId: '2', include: true, locked: false, rawInput: '40', currentAmount: 0 },
      ];

      const result = DistributionEngine.distributeItem(100, 'CUSTOM', shares);
      
      expect(result.warnings).toContain('Custom amounts total 70 VND, item fee is 100 VND');
    });
  });

  describe('Bill Totals Calculation', () => {
    test('should calculate totals correctly with adjustments', () => {
      const items = [
        {
          type: 'NORMAL' as const,
          fee: 100,
          shares: [
            { participantId: '1', amount: 50 },
            { participantId: '2', amount: 50 }
          ]
        },
        {
          type: 'CARRY_OVER' as const,
          fee: undefined,
          shares: [
            { participantId: '1', amount: 10 },
            { participantId: '2', amount: -5 }
          ]
        }
      ];

      const result = DistributionEngine.calculateBillTotals(items);
      
      expect(result.totalFee).toBe(100); // Only NORMAL items
      expect(result.perPersonTotals).toEqual([
        { participantId: '1', amount: 60 }, // 50 + 10
        { participantId: '2', amount: 45 }  // 50 - 5
      ]);
    });
  });
});
```

---

## 🎭 State Management Architecture

### Zustand Store Structure (`lib/stores/`)
```typescript
// stores/billStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface BillState {
  currentBill: BillDetail | null;
  participants: BillParticipant[];
  items: BillItem[];
  totals: BillTotals;
  
  // UI State
  isDistributing: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  setBill: (bill: BillDetail) => void;
  updateBill: (updates: Partial<BillDetail>) => void;
  addParticipant: (person: Person) => void;
  removeParticipant: (participantId: string) => void;
  reorderParticipants: () => void; // Ensure payer is last
  
  addItem: (item: Partial<BillItem>) => void;
  updateItem: (itemId: string, updates: Partial<BillItem>) => void;
  deleteItem: (itemId: string) => void;
  
  updateItemShare: (itemId: string, participantId: string, updates: Partial<ItemShare>) => void;
  distributeAll: () => void;
  distributeItem: (itemId: string) => void;
  resetBill: () => void;
  
  calculateTotals: () => void;
  saveBill: () => Promise<void>;
  
  // Selectors
  getPayerParticipant: () => BillParticipant | null;
  getItemById: (itemId: string) => BillItem | null;
  getNormalItems: () => BillItem[];
  getAdjustmentItems: () => BillItem[];
  getOutstandingAmounts: () => { participantId: string; amount: number }[];
}

export const useBillStore = create<BillState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      currentBill: null,
      participants: [],
      items: [],
      totals: { totalFee: 0, perPersonTotals: [] },
      isDistributing: false,
      isDirty: false,
      lastSaved: null,

      setBill: (bill) => {
        set({
          currentBill: bill,
          participants: bill.participants,
          items: bill.items,
          isDirty: false,
          lastSaved: new Date()
        });
        get().calculateTotals();
      },

      updateBill: (updates) => {
        const currentBill = get().currentBill;
        if (!currentBill) return;
        
        set({
          currentBill: { ...currentBill, ...updates },
          isDirty: true
        });
      },

      reorderParticipants: () => {
        const { participants, currentBill } = get();
        if (!currentBill) return;
        
        const reordered = [...participants].sort((a, b) => {
          if (a.isPayer) return 1;  // Payer goes last
          if (b.isPayer) return -1;
          return a.order - b.order;
        });
        
        set({ participants: reordered, isDirty: true });
      },

      distributeAll: () => {
        const { items, participants } = get();
        set({ isDistributing: true });
        
        try {
          const updatedItems = items.map(item => {
            if (item.type !== 'NORMAL') return item;
            
            const shares = participants.map(p => ({
              participantId: p.id,
              include: item.shares.find(s => s.participantId === p.id)?.include ?? true,
              locked: item.shares.find(s => s.participantId === p.id)?.locked ?? false,
              rawInput: item.shares.find(s => s.participantId === p.id)?.rawInput,
              currentAmount: item.shares.find(s => s.participantId === p.id)?.amount ?? 0
            }));

            const result = DistributionEngine.distributeItem(
              item.fee || 0,
              item.splitMethod,
              shares
            );

            return {
              ...item,
              shares: item.shares.map(share => {
                const newAmount = result.shares.find(s => s.participantId === share.participantId)?.amount ?? share.amount;
                return { ...share, amount: newAmount };
              })
            };
          });

          set({ 
            items: updatedItems, 
            isDirty: true,
            isDistributing: false 
          });
          get().calculateTotals();
        } catch (error) {
          set({ isDistributing: false });
          throw error;
        }
      },

      calculateTotals: () => {
        const { items } = get();
        const totals = DistributionEngine.calculateBillTotals(
          items.map(item => ({
            type: item.type,
            fee: item.fee,
            shares: item.shares
          }))
        );
        set({ totals });
      },

      getPayerParticipant: () => {
        return get().participants.find(p => p.isPayer) || null;
      },

      getNormalItems: () => {
        return get().items.filter(item => item.type === 'NORMAL');
      },

      getAdjustmentItems: () => {
        return get().items.filter(item => item.type === 'CARRY_OVER' || item.type === 'SPECIAL');
      }
    })),
    { name: 'bill-store' }
  )
);

// Auto-save subscription
useBillStore.subscribe(
  (state) => state.isDirty,
  (isDirty) => {
    if (isDirty) {
      // Debounced auto-save
      const timeoutId = setTimeout(() => {
        useBillStore.getState().saveBill();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }
);
```

---

## 🎨 Component Architecture & Styling

### Global Styles (`app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
    
    /* Glass morphism variables */
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    --backdrop-blur: blur(16px);
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
    
    /* Dark mode glass morphism */
    --glass-bg: rgba(0, 0, 0, 0.3);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Glass morphism utilities */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: var(--backdrop-blur);
    -webkit-backdrop-filter: var(--backdrop-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }
  
  .glass-nav {
    @apply glass-card border-b;
    background: rgba(255, 255, 255, 0.8);
  }
  
  .dark .glass-nav {
    background: rgba(0, 0, 0, 0.8);
  }
  
  /* Modern scrollbars */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-muted-foreground/20 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-muted-foreground/30;
  }
  
  /* Focus ring improvements */
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }
  
  /* Table enhancements */
  .table-glass {
    @apply glass-card overflow-hidden;
  }
  
  .table-glass thead {
    @apply bg-muted/50 backdrop-blur-sm sticky top-0 z-10;
  }
  
  .table-glass tbody tr {
    @apply border-b border-border/50 hover:bg-muted/30 transition-colors;
  }
  
  /* Animation utilities */
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  /* Print styles for snapshot */
  @media print {
    .no-print { display: none !important; }
    .glass-card { 
      background: white !important; 
      backdrop-filter: none !important;
      border: 1px solid #e5e7eb !important;
    }
    .text-primary { color: #1f2937 !important; }
    .bg-primary { background-color: #f3f4f6 !important; }
  }
}
```

### Reusable Component Library

#### Glass Card Component (`components/ui/glass-card.tsx`)
```typescript
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: 'low' | 'medium' | 'high';
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md', 
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl'
};

const opacityClasses = {
  low: 'bg-white/5 border-white/10',
  medium: 'bg-white/10 border-white/20',
  high: 'bg-white/20 border-white/30'
};

export function GlassCard({ 
  className, 
  blur = 'md', 
  opacity = 'medium',
  ...props 
}: GlassCardProps) {
  return (
    <Card
      className={cn(
        'glass-card',
        blurClasses[blur],
        opacityClasses[opacity],
        'shadow-xl',
        className
      )}
      {...props}
    />
  );
}

export { CardContent as GlassCardContent, CardDescription as GlassCardDescription, CardHeader as GlassCardHeader, CardTitle as GlassCardTitle };
```

#### Modern Data Table (`components/ui/data-table.tsx`)
```typescript
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  className,
  onRowClick
}: DataTableProps<T>) {
  if (loading) {
    return (
      <GlassCard className={className}>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('table-glass', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  'font-semibold text-foreground',
                  column.width && `w-${column.width}`,
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-12 text-muted-foreground"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-4xl opacity-50">📄</div>
                  <p>{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(
                  'transition-colors duration-150',
                  onRowClick && 'cursor-pointer hover:bg-muted/50'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.cell ? column.cell(item) : item[column.key as keyof T]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </GlassCard>
  );
}
```

#### Currency Display Component (`components/ui/currency.tsx`)
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl font-semibold'
};

export function Currency({ 
  amount, 
  className, 
  showSign = false,
  size = 'md' 
}: CurrencyProps) {
  const formatVND = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getColorClass = (value: number): string => {
    if (!showSign) return '';
    if (value > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <span 
      className={cn(
        'font-mono',
        sizeClasses[size],
        getColorClass(amount),
        className
      )}
    >
      {showSign && amount > 0 && '+'}
      {formatVND(amount)}
    </span>
  );
}
```

#### Loading Skeleton Components (`components/ui/skeletons.tsx`)
```typescript
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card';

export function BillCardSkeleton() {
  return (
    <GlassCard>
      <GlassCardHeader className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </GlassCardHeader>
      <GlassCardContent className="space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <GlassCard className="space-y-4 p-6">
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </GlassCard>
  );
}

export function PayerCardSkeleton() {
  return (
    <GlassCard className="space-y-4">
      <GlassCardHeader>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-32 w-full" /> {/* QR Code */}
      </GlassCardContent>
    </GlassCard>
  );
}
```

---

## 🚀 Development Phases Implementation

### Phase Structure & Acceptance Criteria

#### **PHASE 1 - Scaffold & Development Environment**
```
Deliverables:
✅ Next.js 14 project with TypeScript setup
✅ Tailwind CSS + shadcn/ui configuration
✅ Prisma schema (dev) + initial migration
✅ Basic project structure with folders
✅ Development scripts configured
✅ Seed data for Vietnamese banks
✅ Layout shell (sidebar + main content)
✅ Stub pages for all routes (/, /banks, /people, /groups, /bills, /bill/[id])
✅ Stub API routes returning 200 status

Windows Setup Commands:
npm create next-app@latest splitbill --typescript --tailwind --eslint --app
cd splitbill
npx shadcn-ui@latest init
npm install prisma @prisma/client zustand zod framer-motion html2canvas jspdf
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**Acceptance Criteria:**
- [ ] `npm run dev` starts successfully on Windows
- [ ] Database schema generates without errors
- [ ] All routes return 200 status (even if empty)
- [ ] Sidebar navigation shows all menu items
- [ ] Glass morphism styling visible on navigation
- [ ] Bank seed data populates successfully

---

#### **PHASE 2 - Banks, People & Groups CRUD**
```
Deliverables:
✅ Complete Banks management page with glass UI
✅ People management with card grid layout
✅ Groups management with member chips
✅ All CRUD operations working
✅ Form validation with Zod
✅ Error handling and loading states
✅ API endpoints with proper DTOs
✅ Bank logo integration in People cards
```

**Technical Implementation:**
- API routes: `/api/banks`, `/api/people`, `/api/groups`
- Components: `BankForm`, `PersonCard`, `GroupEditor`
- Validation: Zod schemas for all DTOs
- UI: Glass morphism cards, modern data tables

**Acceptance Criteria:**
- [ ] Banks CRUD with logo preview functionality
- [ ] People displayed as responsive card grid
- [ ] Groups with searchable member selection
- [ ] All forms validate properly with helpful errors
- [ ] Loading states use skeleton components
- [ ] Empty states are engaging and actionable
- [ ] Mobile responsive layouts work correctly

---

#### **PHASE 3 - Bill Creation & Participants**
```
Deliverables:
✅ Bill creation form with Manual/Group modes
✅ Bill detail page layout with glass design
✅ Participants panel with build/sync functionality
✅ Payer card component with highlight styling
✅ Basic bill header with inline editing
✅ Participants build logic ensuring payer is last
✅ Initial adjustment items creation
✅ BillLog integration for BUILD_PARTICIPANTS
```

**Core Features:**
- Dashboard bill creation dialog
- Bill detail page structure
- Participants management panel
- Payer identification and ordering
- Adjustment items initialization

**Acceptance Criteria:**
- [ ] New bill creation works from dashboard
- [ ] Manual mode: N participants selection
- [ ] Group mode: preload group members
- [ ] Payer always appears in last column with badge
- [ ] Build/Sync preserves existing data appropriately
- [ ] Glass morphism payer card displays correctly
- [ ] Carry-over and Special adjustment rows always present

---

#### **PHASE 4 - Items Table & Distribution Logic**
```
Deliverables:
✅ Interactive items table with all column types
✅ Include/Locked/Paid state management
✅ Distribution algorithm implementation
✅ Equal/Percent/Custom split methods
✅ Real-time calculation updates
✅ Distribute All and per-item distribution
✅ Algorithm test suite with full coverage
✅ Keyboard navigation support
```

**Technical Deep Dive:**
- Items table with context-sensitive inputs
- Distribution engine with Decimal.js precision
- State synchronization between UI and calculations
- Keyboard shortcuts implementation
- Comprehensive Jest test suite

**Acceptance Criteria:**
- [ ] All three split methods calculate correctly
- [ ] Include/Locked flags respected in distribution
- [ ] Percent method warns when ≠100% 
- [ ] Custom method preserves manual amounts
- [ ] Table supports keyboard navigation (Enter, Tab, Ctrl+Enter)
- [ ] Real-time updates don't cause performance issues
- [ ] Algorithm tests achieve >95% coverage

---

#### **PHASE 5 - Totals & Visual Formatting**
```
Deliverables:
✅ Bill totals calculation (Total Fee + Per Person)
✅ Outstanding amounts vs payer calculation
✅ Row formatting for all-paid items
✅ Currency formatting throughout app
✅ Mobile responsive table design
✅ Visual indicators for payment status
✅ Totals card with breakdown display
```

**UI Enhancements:**
- Currency component with VND formatting
- All-paid rows: green background + strikethrough
- Responsive table conversion for mobile
- Totals card with clear breakdowns

**Acceptance Criteria:**
- [ ] Total Fee excludes adjustment items
- [ ] Per-person totals include all items + adjustments
- [ ] All-paid rows have distinct visual styling
- [ ] Currency displays consistently as VND format
- [ ] Mobile layout maintains all functionality
- [ ] Outstanding calculations are accurate
- [ ] Visual feedback is clear and intuitive

---

#### **PHASE 6 - Snapshot & Export**
```
Deliverables:
✅ Clean snapshot page without input elements
✅ Copy as Image functionality with html2canvas
✅ Print-optimized CSS for PDF generation
✅ Share-ready mobile layout
✅ QR code prominence for payments
✅ Export action logging
✅ Fallback download for unsupported browsers
```

**Export Features:**
- html2canvas integration for image capture
- CSS `@media print` optimizations
- Clipboard API with fallback
- Mobile-optimized sharing dimensions

**Acceptance Criteria:**
- [ ] Snapshot page loads quickly and looks clean
- [ ] Copy as Image works on desktop and mobile
- [ ] Print PDF maintains readable layout
- [ ] QR codes remain scannable in exports
- [ ] Fallback download works when clipboard unavailable
- [ ] Export actions are logged in BillLog
- [ ] Mobile sharing produces appropriate image dimensions

---

#### **PHASE 7 - Archive & Clone**
```
Deliverables:
✅ Bills archive page with advanced filtering
✅ Search functionality across bill content
✅ Clone bill functionality
✅ Bulk operations support
✅ Export archive to CSV/Excel
✅ Usage analytics display
✅ Archive pagination or infinite scroll
```

**Advanced Features:**
- Multi-criteria filtering with AND/OR logic
- Full-text search across bill data
- Bill cloning with structure preservation
- Export capabilities for archive data

**Acceptance Criteria:**
- [ ] Filter combinations work logically
- [ ] Search indexes all relevant text fields
- [ ] Clone preserves structure but resets amounts/paid status
- [ ] Bulk operations don't cause performance issues
- [ ] Export functions generate correct file formats
- [ ] Pagination/infinite scroll performs smoothly
- [ ] Archive loads quickly even with many bills

---

#### **PHASE 8 - Production Deployment**
```
Deliverables:
✅ Docker configuration for Linux deployment
✅ PostgreSQL production schema
✅ Caddy reverse proxy setup
✅ Environment variables configuration
✅ Production migration scripts
✅ Backup and restore procedures
✅ SSL certificate automation
✅ Production logging and monitoring
```

**Infrastructure:**
- Docker Compose with web + database + proxy
- PostgreSQL with proper schemas and indexes
- Caddy for SSL and reverse proxy
- Production environment configuration

**Acceptance Criteria:**
- [ ] Docker build completes successfully
- [ ] PostgreSQL migrations run without errors
- [ ] SSL certificates generate automatically
- [ ] Application accessible via domain name
- [ ] Database backups configured and tested
- [ ] Logging captures important events
- [ ] Performance acceptable under load
- [ ] Security headers properly configured

---

## 🛠️ Deployment Configuration

### Docker Setup
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS build
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
```

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    environment:
      - DATABASE_URL=postgresql://splitbill:${DB_PASSWORD}@db:5432/splitbill
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=splitbill
      - POSTGRES_USER=splitbill
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - app-network

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  caddy_data:
  caddy_config:

networks:
  app-network:
```

### Caddy Configuration
```caddyfile
# Caddyfile
{
    email your-email@domain.com
}

splitbill.yourdomain.com {
    reverse_proxy web:3000
    
    header {
        # Security headers
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; font-src 'self';"
    }
    
    # Gzip compression
    encode gzip
    
    # Static asset caching
    @static path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2
    header @static Cache-Control "public, max-age=31536000, immutable"
}
```

### Environment Configuration
```bash
# .env.production
DATABASE_URL="postgresql://splitbill:your_password@db:5432/splitbill"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="https://splitbill.yourdomain.com"
DB_PASSWORD="your_database_password"
```

---

## 📋 Final Implementation Checklist

### Pre-Development Setup
- [ ] Windows development environment configured
- [ ] Node.js 18+ installed with npm/yarn
- [ ] Git repository initialized with proper .gitignore
- [ ] Code editor configured with TypeScript and Tailwind extensions

### Code Quality Standards
- [ ] ESLint configuration with strict TypeScript rules
- [ ] Prettier formatting with consistent style
- [ ] Husky pre-commit hooks for linting and testing
- [ ] Path aliases configured for clean imports
- [ ] Component naming follows React conventions

### Performance Requirements
- [ ] Initial page load <2 seconds on 3G connection
- [ ] Distribution calculations complete <100ms
- [ ] Image exports generate <5 seconds
- [ ] Table with 20+ participants remains responsive
- [ ] Mobile performance equivalent to desktop

### Accessibility Compliance
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible and consistent
- [ ] Screen reader compatible with proper ARIA labels
- [ ] Color contrast ratios meet WCAG 2.1 AA standards
- [ ] Form validation provides clear error messages

### Browser Compatibility
- [ ] Chrome 90+ (primary target)
- [ ] Firefox 88+ (secondary)
- [ ] Safari 14+ (secondary) 
- [ ] Edge 90+ (secondary)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Security Considerations
- [ ] Input validation on both client and server
- [ ] SQL injection prevention with Prisma
- [ ] XSS protection with proper escaping
- [ ] CSRF protection for state-changing operations
- [ ] Secure headers configured in production

---

## 🎯 Success Metrics & Completion Criteria

### Phase Completion Standards
Each phase is considered complete when:
- [ ] All deliverables implemented and tested
- [ ] No blocking bugs or performance issues
- [ ] Code reviewed and meets quality standards
- [ ] Documentation updated for new features
- [ ] Phase-specific tests pass at >95% coverage

### User Experience Goals
- [ ] New users can create their first bill in <2 minutes
- [ ] Common operations (add item, distribute) take <3 clicks
- [ ] Error messages are helpful and actionable
- [ ] Mobile experience feels native and responsive
- [ ] Export/sharing works reliably across devices

### Technical Performance Targets
- [ ] Page load times <2s on standard connection
- [ ] Distribution calculations <100ms for complex bills  
- [ ] Database queries optimized for <50ms response
- [ ] Bundle size <500KB gzipped
- [ ] Lighthouse score >90 for Performance/A11y/Best Practices

---

**Final Note:** This specification represents a comprehensive, enterprise-grade implementation plan for the SplitBill webapp. Each phase builds upon the previous one, ensuring a solid foundation while maintaining the flexibility to stop at any point with a functional application.

**Development should strictly follow the PHASE system - complete one phase entirely before moving to the next, and STOP after each phase until receiving "NICE" confirmation to proceed.**

Ready to begin with **PHASE 1**?