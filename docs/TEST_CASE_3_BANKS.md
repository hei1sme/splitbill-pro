# TEST CASE 3: BANKS PAGE (/banks)

## Purpose
Vietnamese bank management system with 16 pre-configured Vietnamese banks and e-wallets.

## Expected Behavior
Display, manage, and configure Vietnamese banking institutions for payment processing.

---

## Test Scenarios

### TC3.1: Banks Page Loading
**Action**: Navigate to `/banks`
**Expected Results**:
- ✅ Page loads without errors
- ✅ "Banks Management" header visible
- ✅ Banks data table displays
- ✅ "Add Bank" button present
- ✅ Search functionality available

### TC3.2: Pre-configured Vietnamese Banks
**Action**: Check default bank data
**Expected Results**:
- ✅ 16 Vietnamese banks pre-loaded
- ✅ Major banks present: VCB, ACB, Techcombank, BIDV, VietinBank
- ✅ E-wallets present: MoMo, ZaloPay, Viettel Money
- ✅ Bank codes are Vietnamese standard (VCB, ACB, etc.)
- ✅ Bank names in Vietnamese/English
- ✅ Logos display correctly

### TC3.3: Bank Data Table Functionality
**Action**: Interact with banks table
**Expected Results**:
- ✅ Sortable columns (Code, Name, Type)
- ✅ Pagination works if >10 banks
- ✅ Search filters banks correctly
- ✅ Bank type badges (Bank/E-Wallet) display correctly
- ✅ Actions dropdown (Edit/Delete) functional

### TC3.4: Add New Bank
**Action**: Click "Add Bank" and create new bank
**Test Data**:
```
Code: TEST
Name: Test Bank
Type: BANK
Logo URL: https://example.com/logo.svg
```
**Expected Results**:
- ✅ Form modal opens
- ✅ All fields available and functional
- ✅ Code validation (uppercase alphanumeric)
- ✅ Name validation (2-50 characters)
- ✅ Type selection (Bank/E-Wallet)
- ✅ Logo preview works
- ✅ Save creates new bank
- ✅ Table updates immediately

### TC3.5: Edit Existing Bank
**Action**: Edit VCB bank details
**Expected Results**:
- ✅ Edit form pre-populates with current data
- ✅ Code field disabled (cannot change existing code)
- ✅ Name and logo can be updated
- ✅ Changes save successfully
- ✅ Table reflects changes immediately

### TC3.6: Delete Bank
**Action**: Attempt to delete a bank
**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Delete cancellation works
- ✅ Delete confirmation removes bank
- ✅ Table updates immediately
- ⚠️ Cannot delete if bank is used by people

### TC3.7: Bank Code Validation
**Action**: Test invalid bank codes
**Test Invalid Codes**: `lowercase`, `special@chars`, `spaces`, `toolongcode123`
**Expected Results**:
- ❌ Lowercase rejected
- ❌ Special characters rejected  
- ❌ Spaces rejected
- ❌ >10 characters rejected
- ✅ Error messages clear and helpful

### TC3.8: Logo URL Functionality
**Action**: Test logo URL features
**Test Cases**:
- Valid image URL
- Invalid URL format
- Broken image URL
- No logo URL (empty)
**Expected Results**:
- ✅ Valid URLs show preview
- ❌ Invalid format shows validation error
- ⚠️ Broken URLs gracefully hide image
- ✅ Empty URLs work (no logo)

### TC3.9: Search and Filter
**Action**: Test search functionality
**Search Terms**: `VCB`, `Vietcombank`, `BANK`, `EWALLET`
**Expected Results**:
- ✅ Code search works
- ✅ Name search works
- ✅ Type filter works
- ✅ Case-insensitive search
- ✅ Real-time filtering
- ✅ "No results" state when appropriate

### TC3.10: Vietnamese Banking Integration
**Action**: Verify Vietnamese banking standards
**Expected Results**:
- ✅ All major Vietnamese banks included
- ✅ Correct bank codes (VCB, ACB, TCB, etc.)
- ✅ Popular e-wallets (MoMo, ZaloPay)
- ✅ Bank names recognizable to Vietnamese users
- ✅ Logos match actual bank branding

---

## Sample Test Data

### Valid Bank Entry
```json
{
  "code": "TESTBANK",
  "name": "Test Vietnamese Bank",
  "type": "BANK",
  "logoUrl": "https://via.placeholder.com/64x64/0066cc/ffffff?text=TB"
}
```

### Valid E-Wallet Entry
```json
{
  "code": "TESTWALLET",
  "name": "Test E-Wallet",
  "type": "EWALLET", 
  "logoUrl": "https://via.placeholder.com/64x64/ff6600/ffffff?text=TW"
}
```

---

## Pre-configured Banks to Verify

### Major Banks
1. **VCB** - Vietcombank
2. **ACB** - Asia Commercial Bank
3. **TCB** - Techcombank
4. **BIDV** - Bank for Investment and Development
5. **VTB** - VietinBank
6. **CTG** - Vietcombank
7. **STB** - Sacombank
8. **EIB** - Eximbank

### E-Wallets
1. **MOMO** - MoMo
2. **ZALOPAY** - ZaloPay
3. **VIETTEL** - Viettel Money
4. **VNPAY** - VNPay

---

## Success Criteria
- ✅ All 16+ Vietnamese banks load correctly
- ✅ CRUD operations work flawlessly
- ✅ Validation prevents invalid data
- ✅ Search and filtering functional
- ✅ UI responsive and user-friendly
- ✅ No errors in browser console
- ✅ Performance under 2 seconds
