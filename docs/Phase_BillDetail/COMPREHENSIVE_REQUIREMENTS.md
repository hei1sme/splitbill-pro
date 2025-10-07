# Phase: Bill Detail Enhancement - Comprehensive Requirements

## 📋 **Project Overview**

**Goal**: Transform the current basic bill details view into a sophisticated expense management interface inspired by Google Sheets workflow, with precise item-level tracking and payment management.

**Current State**: SQLite for development, PostgreSQL for production  
**Implementation Status**: Discussion phase - waiting for "NICELY DONE" signal to begin coding

---

## 🎯 **Core Requirements from User**

### **1. Item-Level Detail Management**
- ✅ **Manual Item Entry**: Users add items with names and prices
- ✅ **Participation Matrix**: Checkbox system for who participates in each item
- ✅ **"–" Symbol Display**: Clear indication when a user did NOT purchase a specific item
- ✅ **Individual Payment Status**: Track "Đã Thanh Toán" (paid) status per person per item

### **2. Advanced Split Methods**
**Priority Order** (confirmed by user):
1. **Equal Split** (default) - Auto-divide among checked participants
2. **Percent Split** - Percentage-based distribution with 100% validation
3. ~~**Custom Split**~~ - Removed to simplify UI (user preference)

### **3. Payment Tracking System**
**Desktop**: Drag-and-drop PAID tokens onto table cells  
**Mobile**: Tap/toggle system for touch-friendly interaction  
**Features**:
- Individual item payment marking
- Bulk actions (mark all items paid for a person)
- Visual feedback for paid vs unpaid items

### **4. Participant Management**
**Four Real-World Scenarios** (identified by user):
1. Select existing Group + assign payer
2. Manually add People for one-off expenses
3. Mixed: Group + additional manual People
4. Quick draft mode with temporary names (validate later)

**Implementation**: Hybrid approach
- Bill creation: Quick setup with Groups/Manual selection
- Bill details: Full editing capabilities for complex scenarios

### **5. Adjustment Support**
- **Carry-over Adjustments**: "Previous Debt" section
- **Special Adjustments**: "Discount" section with positive/negative values
- **Visual Separation**: Different styling from normal items

### **6. Payer Information Integration**
- **Auto-fetch from People data**: Bank info, QR code, account details
- **Missing Info Warnings**: Alert when payer data incomplete
- **Draft Mode**: Allow incomplete data, save as draft
- **Visual Block**: Dedicated payer card with QR code display

---

## ⚙️ **Settings Architecture**

### **Website Settings** (Global - `/settings` page)
```
├── General Preferences
│   ├── Default Currency
│   ├── Language/Locale
│   └── Theme Preferences
├── Bill Defaults
│   ├── Default Split Method (Equal/Percent)
│   ├── Auto-save Frequency
│   └── Default Participant Source (Groups vs Manual)
├── Payment Preferences
│   ├── Interaction Style (Drag vs Click)
│   └── Default Payment Tracking Method
└── Export Defaults
    ├── Default Format (PDF vs Image)
    ├── Layout Style
    └── Include QR Code (Yes/No)
```

### **Per-Bill Settings** (Bill Detail Page)
```
├── Split Configuration
│   ├── Default Split Method for this bill
│   ├── Rounding Rules (Round up/down/nearest)
│   └── Currency for this bill
├── Participant Rules
│   ├── Allow partial participation
│   ├── Minimum participants per item
│   └── Payer assignment rules
├── Payment Tracking
│   ├── Payment deadline
│   ├── Reminder preferences
│   └── Payment confirmation required
└── Export Configuration
    ├── Snapshot layout style
    ├── Include/exclude specific fields
    └── Custom notes for export
```

---

## 📸 **Export/Snapshot Integration**

### **User Workflow** (confirmed):
1. Edit bill details (items, participation, payments)
2. Click "Calculate/Distribute" for final validation
3. Click "📸 Snapshot Preview" to see Google Sheet-style layout
4. Export directly from same page:
   - **📋 Copy as Image** → Clipboard for WhatsApp/social media
   - **📄 Download PDF** → Save/email attachment
   - ~~**Share Link**~~ → Removed per user request

### **Snapshot Layout** (Google Sheet inspired):
```
┌─────────────────────────────────────────────┐
│ Bill Title & Date                           │
├─────────────────────────────────────────────┤
│ Items Table with Participant Columns       │
│ ├── Item names and prices                  │
│ ├── Participation checkboxes               │
│ ├── Payment status indicators              │
│ └── Per-person totals                      │
├─────────────────────────────────────────────┤
│ Adjustment Section                          │
│ ├── Carry-over debts                       │
│ └── Discounts/special adjustments          │
├─────────────────────────────────────────────┤
│ Payer Information Block                     │
│ ├── Payer name and details                 │
│ ├── Bank logo and account info             │
│ └── QR code for payments                   │
├─────────────────────────────────────────────┤
│ Summary Totals                              │
│ ├── Grand total                            │
│ ├── Outstanding balances                   │
│ └── Payment completion status              │
└─────────────────────────────────────────────┘
```

---

## 🏗️ **Component Architecture Plan**

### **Bill Detail Page Structure**
```
BillDetailPage
├── BillHeader 
│   ├── Title, Date, Status
│   ├── Participant Summary (with edit option)
│   ├── Per-bill Settings Toggle
│   └── Action Buttons
├── MainEditingArea
│   ├── ItemManagementTable
│   │   ├── Item CRUD operations
│   │   ├── Participation Matrix (checkboxes)
│   │   ├── Split Method per Item
│   │   ├── Payment Tracking Zone
│   │   └── Live Calculations
│   └── AdjustmentSection
│       ├── Carry-over items
│       └── Special adjustment items
├── PayerInfoSidebar
│   ├── Payer Profile (from People data)
│   ├── Bank Information
│   ├── QR Code Display
│   └── Missing Info Warnings
├── SummaryFooter
│   ├── Totals by Person
│   ├── Outstanding Balances
│   └── Validation Status
└── ActionBar (sticky)
    ├── Save Draft
    ├── Calculate/Distribute
    ├── 📸 Snapshot Preview
    └── Export Options
```

### **Data Models Enhancement**
```typescript
// Enhanced Bill Status
enum BillStatus {
  DRAFT = "DRAFT",           // Unsaved changes, flexible validation
  PENDING = "PENDING",       // Ready for review
  OPEN = "OPEN",            // Finalized, awaiting payments  
  SETTLED = "SETTLED"       // All payments complete
}

// Item participation and payment tracking
interface ItemShare {
  participantId: string;
  include: boolean;         // Checkbox - whether person buys this item
  locked: boolean;          // Lock icon - prevents auto-calculation  
  paid: boolean;            // "Đã Thanh Toán" status
  rawInput?: string;        // User-entered amount or percentage
  amount: number;           // Calculated or entered amount
}

// Enhanced item structure
interface Item {
  id: string;
  name: string;
  fee?: number;
  splitMethod: "EQUAL" | "PERCENT";  // Removed CUSTOM per user
  type: "NORMAL" | "CARRY_OVER" | "SPECIAL";
  order: number;
  shares: ItemShare[];
}
```

---

## 📱 **Mobile Responsiveness**

### **User Requirements**:
- **Very Important**: Users need to split bills anywhere, anytime
- **Full Functionality**: No feature reduction for mobile
- **Optimized UX**: Touch-friendly interactions

### **Mobile Layout Strategy**:
```
Mobile Bill Detail Layout:
├── Collapsible Header (bill info)
├── Expandable Payer Card (bank info + QR)
├── Item Cards (vertical list)
│   ├── Item name and price
│   ├── Horizontal scroll participant grid
│   ├── Tap-to-mark payment system
│   └── Split method selector
├── Adjustment Section (collapsible)
└── Sticky Action Bar
    ├── Calculate
    ├── Snapshot
    └── Export
```

---

## 🔄 **Implementation Phases**

### **Phase 1: Core Functionality** (Priority)
1. **Item Detail Logic**
   - Manual item entry with prices
   - Participation matrix (checkboxes)
   - Basic equal split calculation

2. **Payment Tracking**
   - Desktop: Drag-and-drop implementation
   - Mobile: Tap-to-toggle system
   - Visual indicators for paid items

3. **Participant Management**
   - Group selection integration
   - Manual People selection
   - Hybrid mode support

### **Phase 2: Advanced Features**
4. **Split Methods**
   - Equal split (default)
   - Percentage-based split
   - Validation and error handling

5. **Adjustment Support**
   - Carry-over debt items
   - Special discount items
   - Visual separation

### **Phase 3: Export & Polish**
6. **Snapshot/Export System**
   - Google Sheet-style layout generation
   - Copy as Image functionality
   - PDF download capability

7. **Settings Integration**
   - Per-bill settings panel
   - Global website settings
   - User preference persistence

### **Phase 4: Mobile Optimization**
8. **Responsive Design**
   - Mobile-specific layouts
   - Touch-friendly interactions
   - Performance optimization

---

## ⚠️ **Critical Notes & Reminders**

### **User Preferences Confirmed**:
- ❌ **No Share Link**: Removed from export options
- ❌ **No Custom Split**: Simplified to Equal/Percent only
- ✅ **Draft System**: Essential for data persistence
- ✅ **Real-time Warnings**: For missing payer info
- ✅ **Mobile First**: Very high priority

### **Integration Requirements**:
- **People Data**: QR codes, bank info, account details
- **Groups Data**: Member associations and reuse
- **Banks Data**: Logos and display information
- **Database**: SQLite (dev) / PostgreSQL (prod)

### **UI/UX Principles**:
- **Google Sheet Inspired**: But optimized for web
- **Drag-and-Drop**: Desktop payment tracking
- **Touch Friendly**: Mobile payment tracking
- **Visual Hierarchy**: Clear separation of sections
- **Immediate Feedback**: Live calculations and validation

---

## 🚦 **Current Status**

**Phase**: Requirements gathering and discussion  
**Next Step**: Await user's "NICELY DONE" signal to begin implementation  
**Key Decision Points Resolved**: All major architectural decisions confirmed  

**Ready for Implementation**: ✅ All requirements documented and confirmed

---

## 📚 **Reference Files**

- **Current Bill Details**: `src/app/bills/[id]/BillDetails.tsx`
- **Interactive Table**: `src/components/bills/InteractiveItemsTable.tsx`
- **People Management**: `src/app/people/page.tsx`
- **Groups Management**: `src/app/groups/page.tsx`
- **Database Schema**: `prisma/schema.dev.prisma` & `prisma/schema.prod.prisma`

---

*Last Updated: September 5, 2025*  
*Status: Awaiting implementation approval*
