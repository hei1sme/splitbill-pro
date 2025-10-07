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
    .optional()
    .refine((val) => !val || val === "" || /^[0-9\-\s]+$/.test(val), {
      message: "Account number must contain only numbers, dashes, and spaces"
    }),
  accountHolder: z.string()
    .max(100, "Account holder name cannot exceed 100 characters")
    .optional(),
  qrUrl: z.string().optional(),
  active: z.boolean().default(true),
});

export const PersonUpdateSchema = PersonCreateSchema.partial();

// Group Management
export const GroupCreateSchema = z.object({
  name: z.string()
    .min(2, "Group name must be at least 2 characters")
    .max(50, "Group name cannot exceed 50 characters"),
  personIds: z.array(z.string().cuid("Invalid person ID")).default([]),
});

export const GroupUpdateSchema = GroupCreateSchema.partial().required({ name: true });

// Bill Management
export const BillFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date(),
  groupId: z.string().cuid("Invalid group ID").min(1, "Group is required"),
  payerId: z.string().cuid("Invalid payer ID").min(1, "Payer is required"),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "SETTLED"]).default("DRAFT"),
});

// Enhanced Bill Form Schema for advanced participant management
export const BillFormEnhancedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.coerce.date(), // Handle string to date conversion (same as basic schema)
  groupId: z.string().optional(), // Optional for manual mode
  payerId: z.string().cuid("Invalid payer ID").min(1, "Payer is required"),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "SETTLED"]).default("DRAFT"),
  // Enhanced fields
  participantMode: z.enum(["GROUP", "MANUAL", "MIXED"]).default("GROUP"),
  selectedPeople: z.array(z.string()).default([]),
  quickAddNames: z.array(z.string()).default([]),
}).refine((data) => {
  // Validate that GROUP mode has groupId
  if (data.participantMode === "GROUP" || data.participantMode === "MIXED") {
    return data.groupId && data.groupId.length > 0;
  }
  // For MANUAL mode, validate that we have selectedPeople
  if (data.participantMode === "MANUAL") {
    return data.selectedPeople.length > 0;
  }
  return true;
}, {
  message: "Group is required for Group/Mixed mode, or select people for Manual mode",
  path: ["groupId"],
}).refine((data) => {
  // Additional validation for MANUAL mode - need participants
  if (data.participantMode === "MANUAL" && data.selectedPeople.length === 0) {
    return false;
  }
  return true;
}, {
  message: "Please select at least one person for Manual mode",
  path: ["selectedPeople"],
});

export const BillCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.coerce.date(), // Handle string to date conversion
  groupId: z.string().cuid("Invalid group ID").min(1, "Group is required"),
  payerId: z.string().cuid("Invalid payer ID").min(1, "Payer is required"),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "SETTLED"]).default("DRAFT"),
});
export const BillUpdateSchema = BillFormSchema.partial();

// Enhanced update schema for bill editing
export const BillUpdateEnhancedSchema = BillFormEnhancedSchema.partial();

// Dedicated schema for editing existing bills (more restrictive)
export const BillEditSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  date: z.coerce.date(),
  payerId: z.string().min(1, "Payer is required"),
  isEditMode: z.boolean().optional(),
});

// Bill Item Management
export const BillItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(100, "Description is too long"),
  amount: z.number().positive("Amount must be a positive number"),
});

export const BillItemCreateSchema = z.object({
  description: z.string().min(1, "Description is required").max(100, "Description is too long"),
  amount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null) ? 0 : Number(val),
    z.number().positive("Amount must be a positive number")
  ),
});
export const BillItemUpdateSchema = BillItemSchema.partial();

// Bill Split Management
export const BillSplitSchema = z.object({
  billItemId: z.string().cuid("Invalid bill item ID"),
  personId: z.string().cuid("Invalid person ID"),
  amount: z.number().positive("Amount must be positive"),
  splitMode: z.enum(["EVENLY", "BY_QUANTITY", "BY_PERCENTAGE", "BY_AMOUNT"]).default("EVENLY"),
});

export const BillSplitCreateSchema = BillSplitSchema;
export const BillSplitUpdateSchema = BillSplitSchema.partial();

// Settlement Management
export const SettlementSchema = z.object({
  billId: z.string().cuid("Invalid bill ID"),
  payerId: z.string().cuid("Invalid payer ID"),
  payeeId: z.string().cuid("Invalid payee ID"),
  amount: z.number().positive("Amount must be positive"),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING"),
});

export const SettlementCreateSchema = SettlementSchema;
export const SettlementUpdateSchema = SettlementSchema.partial();