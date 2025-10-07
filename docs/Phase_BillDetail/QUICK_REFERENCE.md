# Bill Detail Enhancement - Quick Reference

## 🎯 **Key Decisions Made**

### **Split Methods** (Priority Order)
1. ✅ **Equal Split** (default)
2. ✅ **Percent Split** 
3. ❌ **Custom Split** (removed to simplify)

### **Payment Tracking**
- **Desktop**: Drag-and-drop PAID tokens
- **Mobile**: Tap/toggle system

### **Export Options**
- ✅ **Copy as Image** (clipboard)
- ✅ **Download PDF** 
- ❌ **Share Link** (removed per user request)

### **Settings Architecture**
- **Website Settings**: Global preferences (`/settings` page)
- **Per-Bill Settings**: Bill-specific config (in bill detail page)

## 🚨 **Critical Requirements**

### **Must Have**
- Item-level participation (checkboxes)
- "Đã Thanh Toán" payment tracking per item
- "–" symbol for non-participants
- Payer info integration (QR code, bank details)
- Mobile responsiveness (very important)
- Draft system for incomplete bills

### **Data Integration**
- Pull from People data: QR codes, bank info, account details
- Pull from Groups data: Member associations
- Handle missing info gracefully with warnings

## 🔄 **User Workflow**
1. Edit items and participation
2. Mark payments (drag/drop or toggle)
3. Calculate/Distribute 
4. Snapshot Preview (Google Sheet style)
5. Export (Image/PDF) from same page

## 📱 **Mobile Strategy**
- Full functionality (no feature reduction)
- Touch-friendly interactions
- Vertical item cards with horizontal participant scroll
- Sticky action bar

## ⚠️ **Implementation Notes**
- Wait for "NICELY DONE" before coding
- SQLite (dev) / PostgreSQL (prod)
- Build on existing InteractiveItemsTable component
- Integrate with current People/Groups pages

---

*Quick Reference for Bill Detail Enhancement Phase*
