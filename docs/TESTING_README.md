# 🧪 SplitBill Pro Testing Suite

Comprehensive test cases and execution scripts for the Vietnamese bill splitting application.

## 🎯 Test Coverage

### Page Tests Available
- ✅ **Dashboard** (`test_dashboard.sh`) - Overview, statistics, VND currency
- ✅ **Banks** (`test_banks.sh`) - Vietnamese bank management
- ✅ **People** (`test_people.sh`) - Contact management & validation fixes
- 🔧 **Groups** (manual testing) - Group organization
- 🔧 **Bills** (manual testing) - Bill splitting functionality

## 🚀 Quick Start

### Run All Tests
```bash
bash run_all_tests.sh
```

### Run Individual Tests
```bash
# Test each page individually
bash test_dashboard.sh
bash test_banks.sh
bash test_people.sh
```

## 📋 Test Documentation

### Detailed Test Cases
- `TEST_CASES_MASTER.md` - Complete test case documentation
- `TEST_CASE_3_BANKS.md` - Banks page specific tests
- `TEST_CASE_4_PEOPLE.md` - People page specific tests

## 🔧 Recent Bug Fixes Tested

### Account Number Validation Fix
**Issue**: Empty account number fields were triggering validation errors
**Fix**: Modified validation to only apply regex when field has content
**Test**: TC4.2 in People page tests

**Before**: ❌ "Account number must contain only numbers, dashes, and spaces" (even when empty)
**After**: ✅ Can save people with display name only, no validation errors

## 💰 Currency Localization

All tests verify VND (Vietnamese Dong) currency formatting:
- ✅ Dashboard amounts show ₫ symbol
- ✅ Bill totals in VND format
- ✅ Vietnamese number formatting (₫1.000.000)
- ❌ No USD symbols anywhere

## 🇻🇳 Vietnamese Features Tested

### Vietnamese Banks
- 16+ pre-configured Vietnamese banks
- Major banks: VCB, ACB, Techcombank, BIDV, VietinBank
- E-wallets: MoMo, ZaloPay, Viettel Money

### Vietnamese Names
- Full diacritics support (Nguyễn, Trần, etc.)
- Search functionality with Vietnamese characters
- Proper sorting and display

## 📊 Test Results

### Success Criteria
- ✅ All core functionality working
- ✅ VND currency displayed correctly
- ✅ Vietnamese bank integration operational
- ✅ Account validation bug fixed
- ✅ Advanced features hidden from dashboard
- ✅ No console errors during testing

## 🛠️ Prerequisites

### Development Environment
- Development server running on `localhost:3000`
- Database migrated and accessible
- No compilation errors
- Browser dev tools available for error monitoring

### Start Testing
```bash
# 1. Start development server
npm run dev

# 2. Run master test suite
bash run_all_tests.sh

# 3. Follow interactive prompts
# Each test provides clear instructions for manual verification
```

## 📝 Test Strategy

### Manual Testing Approach
- **Interactive Scripts**: Step-by-step verification prompts
- **Visual Confirmation**: UI/UX elements verification
- **Functional Testing**: CRUD operations and workflows
- **Edge Case Testing**: Validation, error handling
- **Integration Testing**: Cross-page functionality

### Focus Areas
1. **Core Vietnamese Features**: Banks, currency, names
2. **Recent Bug Fixes**: Account validation, form handling
3. **User Workflows**: Add people → Create groups → Split bills
4. **Data Integrity**: Validation, error prevention
5. **Performance**: Load times, responsiveness

## 🎉 Ready for Production

After running all tests successfully:
- ✅ Core bill splitting functionality verified
- ✅ Vietnamese localization complete
- ✅ Critical bugs fixed and tested
- ✅ User experience optimized
- ✅ Advanced features appropriately hidden

**SplitBill Pro is ready for real-world Vietnamese bill splitting!** 🇻🇳
