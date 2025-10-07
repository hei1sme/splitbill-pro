# TEST CASE 4: PEOPLE PAGE (/people)

## Purpose
Contact management system with optional Vietnamese bank information for bill splitting participants.

## Expected Behavior
Manage people who participate in bill splitting with flexible bank account information.

---

## Test Scenarios

### TC4.1: People Page Loading
**Action**: Navigate to `/people`
**Expected Results**:
- ✅ Page loads without errors
- ✅ "People Management" header visible
- ✅ People data table displays
- ✅ "Add Person" button present
- ✅ Search functionality available

### TC4.2: Add Person - Display Name Only (Core Fix Test)
**Action**: Add person with only display name
**Test Data**:
```
Display Name: "Nguyen Van A"
(Leave all other fields empty)
```
**Expected Results**:
- ✅ Form opens successfully
- ✅ Display name field accepts Vietnamese names
- ✅ Bank fields are clearly marked "(Optional)"
- ✅ Can save with ONLY display name
- ✅ NO validation errors for empty optional fields
- ✅ Person appears in table immediately
- ✅ Bank info shows as "Not provided" or similar

### TC4.3: Add Person - Full Bank Information
**Action**: Add person with complete bank details
**Test Data**:
```
Display Name: "Tran Thi B"
Bank: VCB (Vietcombank)
Account Number: "1234567890"
Account Holder: "TRAN THI B"
QR Code: Upload test image
```
**Expected Results**:
- ✅ All fields work correctly
- ✅ Bank dropdown shows Vietnamese banks
- ✅ Account number accepts numbers, dashes, spaces
- ✅ QR upload works (drag & drop)
- ✅ QR preview displays correctly
- ✅ Person saves with full bank info
- ✅ Bank details visible in table

### TC4.4: Account Number Validation (Fixed Bug)
**Action**: Test account number validation rules
**Test Cases**:
- Empty account number (should work)
- "1234567890" (valid)
- "1234-5678-90" (valid with dashes)
- "1234 5678 90" (valid with spaces)
- "1234-5678 90" (valid mixed)
- "12abc34" (invalid - letters)
- "1234@5678" (invalid - special chars)
**Expected Results**:
- ✅ Empty field saves without error
- ✅ Number-only format accepted
- ✅ Dashes and spaces allowed
- ✅ Mixed dashes/spaces work
- ❌ Letters rejected with clear error
- ❌ Special characters rejected

### TC4.5: Vietnamese Name Support
**Action**: Test Vietnamese name handling
**Test Names**:
- "Nguyễn Văn Hoàng"
- "Trần Thị Hồng"
- "Lê Minh Châu"
- "Phạm Quốc Duy"
**Expected Results**:
- ✅ Vietnamese diacritics accepted
- ✅ Names display correctly in table
- ✅ Search works with Vietnamese characters
- ✅ No encoding issues
- ✅ Names sort correctly alphabetically

### TC4.6: QR Code Image Upload
**Action**: Test QR code upload functionality
**Test Scenarios**:
- Drag and drop image file
- Click to browse and select
- Invalid file type (PDF, TXT)
- Very large image file
- Remove uploaded QR code
**Expected Results**:
- ✅ Drag & drop area works
- ✅ Browse button functional
- ✅ Image preview shows immediately
- ✅ Invalid files rejected gracefully
- ✅ Large files handled appropriately
- ✅ Remove QR function works
- ✅ Upload area shows helpful instructions

### TC4.7: Edit Person
**Action**: Edit existing person details
**Test Scenarios**:
- Change display name
- Add bank info to person without it
- Remove bank info from person with it
- Update QR code
**Expected Results**:
- ✅ Edit form pre-populates all fields
- ✅ Can modify any field
- ✅ Bank info can be added/removed
- ✅ Changes save successfully
- ✅ Table updates immediately
- ✅ No data loss during edits

### TC4.8: Delete Person
**Action**: Delete person functionality
**Test Scenarios**:
- Delete person not in any groups
- Delete person in groups (should warn/prevent)
- Delete person with bills (should warn/prevent)
**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Simple delete works for unattached person
- ⚠️ Warning for person in groups
- ⚠️ Prevention if person has bills
- ✅ Cancellation works properly

### TC4.9: People Data Table
**Action**: Test table functionality
**Expected Results**:
- ✅ Display name column sortable
- ✅ Bank info column shows bank or "None"
- ✅ Active status toggle works
- ✅ Search filters by name
- ✅ Pagination works (if >10 people)
- ✅ Actions menu (Edit/Delete) functional
- ✅ Avatar initials generated correctly

### TC4.10: Active/Inactive Status
**Action**: Test person status management
**Expected Results**:
- ✅ Active toggle switch works
- ✅ Inactive people visually distinct
- ✅ Inactive people excluded from bill creation
- ✅ Can reactivate inactive people
- ✅ Status changes save immediately

### TC4.11: Search and Filtering
**Action**: Test search functionality
**Search Terms**: 
- Vietnamese names with diacritics
- Partial names
- Bank account numbers
- Bank names
**Expected Results**:
- ✅ Real-time search works
- ✅ Vietnamese character search
- ✅ Case-insensitive search
- ✅ Partial matching works
- ✅ "No results" state appropriate
- ✅ Search clears properly

---

## Critical Bug Fix Verification

### Account Number Validation Fix
**Issue**: Previously showing "Account number must contain only numbers, dashes, and spaces" even when field was empty.

**Test**: 
1. Add new person
2. Enter display name only
3. Leave account number completely empty
4. Click Save

**Expected**: ✅ Should save successfully without validation errors
**This was the main bug we fixed!**

---

## Sample Test Data

### Minimal Person (Fixed Bug Test)
```json
{
  "displayName": "Test User",
  "active": true
}
```

### Complete Person
```json
{
  "displayName": "Nguyễn Văn Test",
  "bankCode": "VCB",
  "accountNumber": "1234567890",
  "accountHolder": "NGUYEN VAN TEST",
  "qrUrl": "data:image/png;base64,...",
  "active": true
}
```

### Vietnamese Names Test Set
```json
[
  {"displayName": "Nguyễn Văn Hoàng"},
  {"displayName": "Trần Thị Hồng"},
  {"displayName": "Lê Minh Châu"},
  {"displayName": "Phạm Quốc Duy"}
]
```

---

## Success Criteria
- ✅ Can add person with display name only (no validation errors)
- ✅ Can add person with full bank information
- ✅ Account number validation works correctly
- ✅ Vietnamese names fully supported
- ✅ QR code upload functional
- ✅ Edit/Delete operations work
- ✅ Search and filtering responsive
- ✅ Active/Inactive status management
- ✅ No console errors
- ✅ Performance under 2 seconds
