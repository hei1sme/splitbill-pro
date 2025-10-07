# SplitBill Pro - Comprehensive Test Cases

## Test Environment
- **Application**: SplitBill Pro (Vietnamese Bill Splitting App)
- **Currency**: VND (Vietnamese Dong)
- **Database**: SQLite with Prisma
- **Framework**: Next.js 15 with TypeScript

## Page Navigation Flow
1. **Home (/)** → Redirects to Dashboard
2. **Dashboard (/dashboard)** → Overview & Statistics
3. **Banks (/banks)** → Vietnamese Bank Management
4. **People (/people)** → Contact Management
5. **Groups (/groups)** → Group Organization
6. **Bills (/bills)** → Bill Management & Archive

---

## 🏠 **TEST CASE 1: HOME PAGE (/)**

### **Purpose**: Entry point and navigation
### **Expected Behavior**: Automatic redirect to dashboard

### **Test Scenarios**:

#### **TC1.1: Initial Access**
- **Action**: Navigate to `http://localhost:3000/`
- **Expected Result**: ✅ Automatically redirects to `/dashboard`
- **Status**: ⏳ To Test

#### **TC1.2: Direct URL Access**
- **Action**: Type `localhost:3000` in browser address bar
- **Expected Result**: ✅ Loads dashboard without user action required
- **Status**: ⏳ To Test

---

## 📊 **TEST CASE 2: DASHBOARD PAGE (/dashboard)**

### **Purpose**: Main overview and statistics display
### **Expected Behavior**: Shows summary cards, recent activity, and key metrics in VND

### **Test Scenarios**:

#### **TC2.1: Empty State (Fresh Installation)**
- **Precondition**: No data in database
- **Action**: Access `/dashboard`
- **Expected Results**:
  - ✅ "Total Amount" shows ₫0
  - ✅ "Total Bills" shows 0
  - ✅ "Active Groups" shows 0
  - ✅ "People Count" shows 0
  - ✅ "Recent Activity" shows "No recent activity"
  - ✅ Page loads without errors
- **Status**: ⏳ To Test

#### **TC2.2: Currency Formatting (VND)**
- **Precondition**: Some bills exist with amounts
- **Action**: View dashboard with sample data
- **Expected Results**:
  - ✅ All amounts display with ₫ symbol
  - ✅ Vietnamese number formatting (e.g., ₫1.000.000)
  - ✅ No USD references anywhere
- **Status**: ⏳ To Test

#### **TC2.3: Summary Cards Display**
- **Action**: Check all dashboard cards
- **Expected Results**:
  - ✅ **Total Amount Card**: Shows sum of all bill amounts in VND
  - ✅ **Total Bills Card**: Shows count with correct pluralization
  - ✅ **Settled Bills Card**: Shows percentage settled
  - ✅ **Average Bill Card**: Shows average amount in VND
- **Status**: ⏳ To Test

#### **TC2.4: Recent Activity Table**
- **Precondition**: Multiple bills exist
- **Action**: Check recent activity section
- **Expected Results**:
  - ✅ Shows last 10 bills ordered by update time
  - ✅ Bill titles are clickable links
  - ✅ Group names display correctly
  - ✅ Amounts in VND format
  - ✅ Status badges (Draft/Open/Settled) appear correctly
  - ✅ Timestamps in readable format
- **Status**: ⏳ To Test

#### **TC2.5: Navigation Integration**
- **Action**: Test sidebar navigation from dashboard
- **Expected Results**:
  - ✅ All navigation links work (Banks, People, Groups, Bills)
  - ✅ Active page highlighted correctly
  - ✅ SplitBill logo/title visible
  - ✅ Notification center accessible
- **Status**: ⏳ To Test

#### **TC2.6: Responsive Design**
- **Action**: Test dashboard on different screen sizes
- **Expected Results**:
  - ✅ **Desktop**: 4-column card layout
  - ✅ **Tablet**: 2-column card layout
  - ✅ **Mobile**: Single column layout
  - ✅ Table scrollable on small screens
  - ✅ No horizontal scroll issues
- **Status**: ⏳ To Test

#### **TC2.7: Performance & Loading**
- **Action**: Refresh dashboard page multiple times
- **Expected Results**:
  - ✅ Page loads within 3 seconds
  - ✅ No hydration errors in console
  - ✅ Smooth loading transitions
  - ✅ No flickering or layout shifts
- **Status**: ⏳ To Test

#### **TC2.8: Advanced Features Hidden**
- **Action**: Check for advanced showcase components
- **Expected Results**:
  - ✅ No Phase 7-10 showcase components visible
  - ✅ No AI features, enterprise features displayed
  - ✅ Clean, focused interface
  - ✅ Only core functionality shown
- **Status**: ⏳ To Test

### **Data Scenarios for Testing**:

#### **Scenario A: Single Bill Test Data**
```sql
-- Sample test data for basic functionality
INSERT INTO Bill (title, description, status, date, totalAmount) 
VALUES ('Test Dinner', 'Restaurant bill', 'OPEN', '2025-09-04', 500000);
```

#### **Scenario B: Multiple Bills Test Data**
```sql
-- Sample test data for comprehensive testing
INSERT INTO Bill (title, status, date, totalAmount) VALUES 
('Coffee Meeting', 'SETTLED', '2025-09-01', 150000),
('Team Lunch', 'OPEN', '2025-09-02', 800000),
('Office Supplies', 'DRAFT', '2025-09-03', 300000),
('Dinner Party', 'SETTLED', '2025-09-04', 1200000);
```

---

## 🧪 **Test Execution Instructions**:

### **Prerequisites**:
1. ✅ Development server running on `localhost:3000`
2. ✅ Database migrated and accessible
3. ✅ No compilation errors
4. ✅ Browser dev tools open for error monitoring

### **Test Execution Order**:
1. **Start Fresh**: Clear browser cache and database
2. **TC2.1**: Test empty state first
3. **Add Sample Data**: Insert test data via API or database
4. **TC2.2-TC2.8**: Test populated state scenarios
5. **Document Results**: Mark each test as ✅ Pass or ❌ Fail

### **Success Criteria**:
- ✅ All test cases pass without errors
- ✅ VND currency displayed correctly throughout
- ✅ No advanced features visible
- ✅ Responsive design works on all screen sizes
- ✅ Performance meets expectations (< 3s load time)

---

## 📝 **Next Test Cases to Create**:
- **TEST CASE 3**: Banks Page (/banks)
- **TEST CASE 4**: People Page (/people) 
- **TEST CASE 5**: Groups Page (/groups)
- **TEST CASE 6**: Bills Page (/bills)
- **TEST CASE 7**: Individual Bill Page (/bills/[id])

**Ready to execute Dashboard tests!** 🚀
