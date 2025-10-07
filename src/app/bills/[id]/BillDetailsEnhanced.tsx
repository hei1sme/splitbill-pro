'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Users, QrCode, Calculator, Settings, Camera, Download, 
  Plus, AlertTriangle, Check, X, Copy, ArrowLeft, Trash2, Pencil, RefreshCw, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { BillEditForm, BillEditValues } from "@/components/bills/BillEditForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types based on our documented requirements
interface Participant {
  id: string;
  displayName: string;
  isPayer: boolean;
  order: number;
  accountNumber?: string;
  bankCode?: string;
  accountHolder?: string;
  qrUrl?: string;
  completed: boolean;
  bankName?: string;
  bankLogoUrl?: string;
}

interface ItemShare {
  participantId: string;
  include: boolean;
  locked: boolean;
  paid: boolean; // "Đã Thanh Toán" status
  rawInput?: string;
  amount: number;
  isManualEntry?: boolean; // Track if user manually set this percentage
}

interface Item {
  id: string;
  name: string;
  fee?: number;
  splitMethod: "EQUAL" | "PERCENT"; // Removed CUSTOM per requirements
  type: "NORMAL" | "CARRY_OVER" | "SPECIAL";
  order: number;
  shares: ItemShare[];
}

interface BillSettings {
  defaultSplitMethod: "EQUAL" | "PERCENT";
  roundingRule: "UP" | "DOWN" | "NEAREST";
  currency: string;
  allowPartialParticipation: boolean;
  minParticipantsPerItem?: number;
  autoValidatePercentages?: boolean;
  requirePaymentConfirmation?: boolean;
  includeQRInExport?: boolean;
}

export default function BillDetails({ bill }: { bill: any }) {
  // State management
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [billSettings, setBillSettings] = useState<BillSettings>({
    defaultSplitMethod: "EQUAL",
    roundingRule: "NEAREST",
    currency: "VND",
    allowPartialParticipation: true,
  });
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
  const [draggedPayment, setDraggedPayment] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [availablePeople, setAvailablePeople] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [allPeople, setAllPeople] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Load groups and people for edit form
  useEffect(() => {
    const fetchGroupsAndPeople = async () => {
      try {
        const [groupsRes, peopleRes] = await Promise.all([
          fetch('/api/groups'),
          fetch('/api/people')
        ]);
        
        if (groupsRes.ok && peopleRes.ok) {
          const groupsResponseData = await groupsRes.json();
          const peopleResponseData = await peopleRes.json();
          
          // Handle different response structures
          const groupsData = Array.isArray(groupsResponseData) ? groupsResponseData : groupsResponseData.data || [];
          const peopleData = Array.isArray(peopleResponseData) ? peopleResponseData : peopleResponseData.data || [];
          
          setGroups(groupsData);
          setAllPeople(peopleData);
        }
      } catch (error) {
        console.error('Error fetching groups and people:', error);
      }
    };

    fetchGroupsAndPeople();
  }, []);

  // Refresh participant data to get updated bank logos and QR codes
  useEffect(() => {
    const refreshParticipantData = async () => {
      try {
        // Re-fetch people data to get updated bank information
        const peopleRes = await fetch('/api/people');
        if (peopleRes.ok) {
          const responseData = await peopleRes.json();
          
          // Handle different response structures
          const updatedPeople = Array.isArray(responseData) ? responseData : responseData.data || [];
          
          if (!Array.isArray(updatedPeople)) {
            console.error('Invalid response format in useEffect:', responseData);
            return;
          }
          
          // Update participants with fresh bank data
          setParticipants(prevParticipants => 
            prevParticipants.map(participant => {
              const updatedPerson = updatedPeople.find((p: any) => p.id === participant.id);
              if (updatedPerson) {
                return {
                  ...participant,
                  accountNumber: updatedPerson.accountNumber,
                  bankCode: updatedPerson.bankCode,
                  accountHolder: updatedPerson.accountHolder,
                  qrUrl: updatedPerson.qrUrl,
                  bankName: updatedPerson.bank?.name,
                  bankLogoUrl: updatedPerson.bank?.logoUrl,
                };
              }
              return participant;
            })
          );
        }
      } catch (error) {
        console.error('Error refreshing participant data:', error);
      }
    };

    // Only refresh if we have participants
    if (participants.length > 0) {
      refreshParticipantData();
    }
  }, [bill?.id]); // Refresh when bill changes

  // Handle edit form submission
  const handleEditFormSubmit = async (values: BillEditValues) => {
    if (isPending) return;
    
    setIsPending(true);
    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          date: values.date,
          payerId: values.payerId,
          // Only send fields that should be editable
          isEditMode: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        if (errorData.errors) {
          console.error('Validation Errors:', errorData.errors);
          const errorMessages = errorData.errors.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.message || 'Failed to update bill');
      }

      toast.success('Bill updated successfully!');
      setShowEditDialog(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update bill');
    } finally {
      setIsPending(false);
    }
  };

  // Initialize participants from bill data
  useEffect(() => {
    if (!bill) return;

    const initParticipants = () => {
      const payerData = bill?.payer;
      let participantList: Participant[] = [];
      
      // Check the participant mode to determine how to load participants
      const participantMode = (bill as any).participantMode;
      const customParticipants = (bill as any).customParticipants;
      
      console.log("[BILL_DETAILS] Participant mode:", participantMode);
      console.log("[BILL_DETAILS] Custom participants:", customParticipants);
      console.log("[BILL_DETAILS] Group members:", bill?.group?.members?.length || 0);
      
      if (participantMode === "MANUAL" && customParticipants) {
        // MANUAL mode: Load only custom participants
        try {
          const customParticipantIds = JSON.parse(customParticipants);
          const customParticipantsData = (bill as any).customParticipantsData || [];
          
          console.log("[BILL_DETAILS] Loading MANUAL participants:", customParticipantIds);
          console.log("[BILL_DETAILS] Custom participants data:", customParticipantsData);
          
          // Map IDs to actual person data
          participantList = customParticipantIds.map((personId: string, index: number) => {
            const personData = customParticipantsData.find((p: any) => p.id === personId);
            
            return {
              id: personId,
              displayName: personData?.displayName || `Unknown Participant ${index + 1}`,
              isPayer: personId === payerData?.id,
              order: index,
              accountNumber: personData?.accountNumber,
              bankCode: personData?.bankCode,
              accountHolder: personData?.accountHolder,
              qrUrl: personData?.qrUrl,
              bankName: personData?.bank?.name,
              bankLogoUrl: personData?.bank?.logoUrl,
              completed: false,
            };
          });
          
        } catch (error) {
          console.error("[BILL_DETAILS] Error parsing custom participants:", error);
        }
        
      } else if (participantMode === "MIXED" && customParticipants) {
        // MIXED mode: Combine group members + custom participants
        const groupMembers = bill?.group?.members || [];
        const customParticipantsData = (bill as any).customParticipantsData || [];
        
        // Add group members first
        const groupParticipants = groupMembers.map((member: any, index: number) => ({
          id: member.person?.id || `member-${index}`,
          displayName: member.person?.displayName || `Member ${index + 1}`,
          isPayer: member.person?.id === payerData?.id,
          order: index,
          accountNumber: member.person?.accountNumber,
          bankCode: member.person?.bankCode,
          accountHolder: member.person?.accountHolder,
          qrUrl: member.person?.qrUrl,
          bankName: member.person?.bank?.name,
          bankLogoUrl: member.person?.bank?.logoUrl,
          completed: false,
        }));
        
        // Add custom participants (these are additional people, not duplicates)
        try {
          const additionalParticipantIds = JSON.parse(customParticipants);
          console.log("[BILL_DETAILS] Loading MIXED additional participants:", additionalParticipantIds);
          console.log("[BILL_DETAILS] Group members:", groupParticipants.map((p: any) => p.id));
          console.log("[BILL_DETAILS] Additional participants data:", customParticipantsData);
          
          // These are already filtered additional people from the API
          const additionalParticipants = additionalParticipantIds.map((personId: string, index: number) => {
            const personData = customParticipantsData.find((p: any) => p.id === personId);
            
            return {
              id: personId,
              displayName: personData?.displayName || `Additional ${index + 1}`,
              isPayer: personId === payerData?.id,
              order: groupParticipants.length + index,
              accountNumber: personData?.accountNumber,
              bankCode: personData?.bankCode,
              accountHolder: personData?.accountHolder,
              qrUrl: personData?.qrUrl,
              bankName: personData?.bank?.name,
              bankLogoUrl: personData?.bank?.logoUrl,
              completed: false,
            };
          });
          
          participantList = [...groupParticipants, ...additionalParticipants];
          console.log("[BILL_DETAILS] Final MIXED participant list:", participantList.map(p => p.displayName));
          
          // Always ensure payer is at the end
          const nonPayers = participantList.filter(p => !p.isPayer);
          const payer = participantList.find(p => p.isPayer);
          participantList = payer ? [...nonPayers, payer] : nonPayers;
          
        } catch (error) {
          console.error("[BILL_DETAILS] Error parsing mixed participants:", error);
          participantList = groupParticipants;
          
          // Always ensure payer is at the end even in fallback
          const nonPayers = participantList.filter(p => !p.isPayer);
          const payer = participantList.find(p => p.isPayer);
          participantList = payer ? [...nonPayers, payer] : nonPayers;
        }
        
      } else {
        // GROUP mode or fallback: Use group members only
        const groupMembers = bill?.group?.members || [];
        
        if (groupMembers.length > 0) {
          // Separate payer and non-payers
          const nonPayers = groupMembers
            .filter((member: any) => member.person?.id !== payerData?.id)
            .map((member: any, index: number) => ({
              id: member.person?.id || `member-${index}`,
              displayName: member.person?.displayName || `Member ${index + 1}`,
              isPayer: false,
              order: index,
              accountNumber: member.person?.accountNumber,
              bankCode: member.person?.bankCode,
              accountHolder: member.person?.accountHolder,
              qrUrl: member.person?.qrUrl,
              bankName: member.person?.bank?.name,
              bankLogoUrl: member.person?.bank?.logoUrl,
              completed: false,
            }));
          
          // Add payer at the end
          const payerMember = groupMembers.find((member: any) => member.person?.id === payerData?.id);
          if (payerMember) {
            participantList = [...nonPayers, {
              id: payerMember.person?.id || 'payer',
              displayName: payerMember.person?.displayName || 'Payer',
              isPayer: true,
              order: nonPayers.length,
              accountNumber: payerMember.person?.accountNumber,
              bankCode: payerMember.person?.bankCode,
              accountHolder: payerMember.person?.accountHolder,
              qrUrl: payerMember.person?.qrUrl,
              bankName: payerMember.person?.bank?.name,
              bankLogoUrl: payerMember.person?.bank?.logoUrl,
              completed: false,
            }];
          } else {
            participantList = nonPayers;
          }
        } else {
          // Fallback to default participants with payer at the end
          const defaultParticipants = Array.from({ length: 3 }, (_, i) => ({
            id: `participant-${i + 1}`,
            displayName: `Participant ${i + 1}`,
            isPayer: false,
            order: i,
            completed: false,
          }));
          
          participantList = [...defaultParticipants, {
            id: 'payer',
            displayName: payerData?.displayName || 'Payer',
            isPayer: true,
            order: 3,
            accountNumber: payerData?.accountNumber,
            bankCode: payerData?.bankCode,
            accountHolder: payerData?.accountHolder,
            qrUrl: payerData?.qrUrl,
            bankName: payerData?.bank?.name,
            bankLogoUrl: payerData?.bank?.logoUrl,
            completed: false,
          }];
        }
      }
      
      console.log("[BILL_DETAILS] Final participant list:", participantList);
      setParticipants(participantList);
      return participantList;
    };

    // Initialize items with participants  
    const initItems = (participantList: Participant[]) => {
      // Try to load saved data first
      let savedData = null;
      try {
        if (bill?.description && bill.description.startsWith('{')) {
          savedData = JSON.parse(bill.description);
        }
      } catch (error) {
        console.log('No saved data found, creating default items');
      }

      if (savedData && savedData.items && savedData.participants) {
        console.log('Loading saved bill data:', savedData);
        console.log('Saved participants:', savedData.participants.map((p: any) => ({ id: p.id, name: p.displayName })));
        console.log('Current participants:', participantList.map(p => ({ id: p.id, name: p.displayName })));
        
        setItems(savedData.items);
        
        // Use saved participants as the primary source, but merge with current data for any missing info
        const savedParticipants = savedData.participants || [];
        const finalParticipants = savedParticipants.map((saved: any) => {
          // Find matching current participant to get any updated info
          const current = participantList.find(p => p.id === saved.id);
          // Prioritize saved data but fill in any missing fields from current
          return current ? { ...current, ...saved } : saved;
        });
        
        // Add any participants from current list that aren't in saved (shouldn't happen but safety)
        participantList.forEach(current => {
          if (!finalParticipants.find((p: any) => p.id === current.id)) {
            finalParticipants.push(current);
          }
        });
        
        console.log('Final merged participants:', finalParticipants.map((p: any) => ({ id: p.id, name: p.displayName })));
        setParticipants(finalParticipants);
        
        if (savedData.settings) {
          setBillSettings(prev => ({ ...prev, ...savedData.settings }));
        }
        return;
      }

      // Create from bill items or default
      const billItems = bill?.items || [];
      
      // Convert bill items to our format
      const normalItems: Item[] = billItems.length > 0 ? billItems.map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        name: item.description || `Item ${index + 1}`,
        fee: item.amount || 0,
        splitMethod: "EQUAL",
        type: "NORMAL",
        order: index,
        shares: participantList.map(p => ({
          participantId: p.id,
          include: true,
          locked: false,
          paid: false,
          amount: 0,
        })),
      })) : [
        // Default item if no items exist
        {
          id: 'item-1',
          name: 'Main Course',
          fee: 150000,
          splitMethod: "EQUAL",
          type: "NORMAL",
          order: 0,
          shares: participantList.map(p => ({
            participantId: p.id,
            include: true,
            locked: false,
            paid: false,
            amount: 0,
          })),
        }
      ];
      
      // Add adjustment items
      const adjustmentItems: Item[] = [
        {
          id: 'carry-over',
          name: 'Previous Debt',
          fee: 0,
          splitMethod: "EQUAL",
          type: "CARRY_OVER",
          order: 1000,
          shares: participantList.map(p => ({
            participantId: p.id,
            include: false,
            locked: false,
            paid: false,
            amount: 0,
          })),
        },
        {
          id: 'discount',
          name: 'Discount',
          fee: -500,
          splitMethod: "EQUAL", 
          type: "SPECIAL",
          order: 1001,
          shares: participantList.map(p => ({
            participantId: p.id,
            include: false,
            locked: false,
            paid: false,
            amount: 0,
          })),
        },
      ];
      
      setItems([...normalItems, ...adjustmentItems]);
    };

    const participantList = initParticipants();
    initItems(participantList);
  }, [bill]);

  // Fetch available people for search
  useEffect(() => {
    const fetchAvailablePeople = async () => {
      try {
        const response = await fetch('/api/people');
        if (response.ok) {
          const result = await response.json();
          // Fix: Extract data from API response format {success: true, data: [...]}
          if (result.success && Array.isArray(result.data)) {
            setAvailablePeople(result.data);
          } else if (Array.isArray(result)) {
            setAvailablePeople(result);
          } else {
            console.error('Unexpected API response format:', result);
            setAvailablePeople([]);
          }
        }
      } catch (error) {
        console.error('Error fetching people:', error);
        setAvailablePeople([]);
      }
    };
    
    fetchAvailablePeople();
  }, []);

  // Auto-save functionality
  const saveBillData = async () => {
    if (!bill?.id || isSaving) return;
    
    setIsSaving(true);
    try {
      const billData = {
        participants: participants,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          fee: item.fee,
          splitMethod: item.splitMethod,
          type: item.type,
          order: item.order,
          shares: item.shares
        })),
        settings: billSettings
      };

      console.log('Saving bill data:', {
        participantCount: participants.length,
        participants: participants.map(p => ({ id: p.id, name: p.displayName })),
        itemCount: items.length
      });

      const response = await fetch(`/api/bills/${bill.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(billData)
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log('Bill data saved successfully');
      } else {
        console.error('Failed to save bill data');
      }
    } catch (error) {
      console.error('Error saving bill data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Bill status management
  const changeBillStatus = async (newStatus: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'SETTLED') => {
    if (!bill?.id || isChangingStatus) return;
    
    setIsChangingStatus(true);
    try {
      const response = await fetch(`/api/bills/${bill.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Bill status changed to ${newStatus}`);
        // Refresh the page to show new status
        window.location.reload();
      } else {
        toast.error('Failed to change bill status');
      }
    } catch (error) {
      console.error('Error changing bill status:', error);
      toast.error('Error changing bill status');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'DRAFT': return 'ACTIVE';
      case 'ACTIVE': return 'COMPLETED';
      case 'COMPLETED': return 'SETTLED';
      default: return null;
    }
  };

  const canAdvanceStatus = (currentStatus: string) => {
    if (currentStatus === 'DRAFT') {
      // Can advance to ACTIVE if has items and participants
      return items.some(item => item.type === 'NORMAL' && (item.fee || 0) > 0) && participants.length > 1;
    }
    if (currentStatus === 'ACTIVE') {
      // Can advance to COMPLETED if all items are properly allocated
      return items.filter(item => item.type === 'NORMAL').every(item => {
        if (item.splitMethod === 'EQUAL') {
          // For EQUAL split, check if at least one participant is included
          return item.shares.some(s => s.include);
        } else if (item.splitMethod === 'PERCENT') {
          // For PERCENT split, check if percentages add up to 100%
          const total = item.shares
            .filter(s => s.include && s.rawInput)
            .reduce((sum, s) => sum + (parseFloat(s.rawInput || '0') || 0), 0);
          return Math.abs(total - 100) <= 0.1;
        }
        return false;
      });
    }
    if (currentStatus === 'COMPLETED') {
      // Can advance to SETTLED if all payments are marked as paid
      return items.every(item => 
        item.shares.every(share => !share.include || share.paid)
      );
    }
    return false;
  };

  // Auto-save when items or participants change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (items.length > 0 || participants.length > 0) {
        saveBillData();
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [items, participants, billSettings]);

  // Color coding for participants (professional purple theme)
  const participantColors = [
    'bg-purple-600 text-purple-100 border-purple-400',
    'bg-indigo-600 text-indigo-100 border-indigo-400', 
    'bg-pink-600 text-pink-100 border-pink-400',
    'bg-blue-600 text-blue-100 border-blue-400',
    'bg-violet-600 text-violet-100 border-violet-400',
    'bg-fuchsia-600 text-fuchsia-100 border-fuchsia-400',
    'bg-cyan-600 text-cyan-100 border-cyan-400',
    'bg-teal-600 text-teal-100 border-teal-400',
    'bg-emerald-600 text-emerald-100 border-emerald-400',
    'bg-green-600 text-green-100 border-green-400',
    'bg-amber-600 text-amber-100 border-amber-400',
    'bg-orange-600 text-orange-100 border-orange-400',
  ];

  const getParticipantColor = (index: number, isPayer: boolean = false) => {
    if (isPayer) return 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-purple-500';
    return participantColors[index % participantColors.length];
  };

  const getParticipantBadgeClass = (index: number) => {
    const baseColors = [
      'purple', 'indigo', 'pink', 'blue', 'violet', 'fuchsia', 
      'cyan', 'teal', 'emerald', 'green', 'amber', 'orange'
    ];
    const color = baseColors[index % baseColors.length];
    return `bg-${color}-100 text-${color}-800 border-${color}-200`;
  };

  // Find the payer
  const payer = participants.find(p => p.isPayer);

  // Calculations - keeping grand total method that works correctly
  const totalNormalFee = useMemo(() => {
    const total = items
      .filter(item => item.type === "NORMAL")
      .reduce((sum, item) => sum + (item.fee || 0), 0);
    
    return total;
  }, [items]);

  const totalAdjustments = useMemo(() => {
    const adjustmentItems = items.filter(item => item.type !== "NORMAL");
    
    const total = adjustmentItems.reduce((sum, item) => {
      // For adjustment items, sum all individual participant amounts
      const itemTotal = item.shares.reduce((shareSum, share) => shareSum + (share.amount || 0), 0);
      return sum + itemTotal;
    }, 0);
    
    return total;
  }, [items]);

  const grandTotal = totalNormalFee + totalAdjustments;
  
  // Verification: Ensure sum of participant totals equals grand total (only included shares)
  const participantTotalSum = useMemo(() => {
    return participants.reduce((total, participant) => {
      const participantTotal = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        return sum + (share?.include ? (share.amount || 0) : 0);
      }, 0);
      return total + participantTotal;
    }, 0);
  }, [participants, items]);

  // Log any calculation discrepancies in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && items.length > 0 && participants.length > 0) {
      if (participantTotalSum !== grandTotal) {
        console.warn('⚠️ CALCULATION DISCREPANCY DETECTED:');
        console.warn('Grand Total:', grandTotal, '₫');
        console.warn('Sum of Participant Totals:', participantTotalSum, '₫');
        console.warn('Difference:', Math.abs(grandTotal - participantTotalSum), '₫');
      }
    }
  }, [grandTotal, participantTotalSum, items.length, participants.length]);

  const participantTotals = useMemo(() => {
    if (items.length === 0 || participants.length === 0) {
      return [];
    }
    
    return participants.map(participant => {
      // FIXED: Only count shares where include=true
      const total = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        // Only add to total if the share is included
        return sum + (share?.include ? (share.amount || 0) : 0);
      }, 0);
      
      const paidAmount = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        return sum + (share?.paid && share?.include ? share.amount : 0);
      }, 0);
      
      return {
        participant,
        total,
        paidAmount,
        outstanding: total - paidAmount,
      };
    });
  }, [participants, items]);

  // Validation
  useEffect(() => {
    const errors: string[] = [];
    
    // Check payer info completeness
    if (payer) {
      if (!payer.accountNumber) errors.push("Payer account number missing");
      if (!payer.bankCode) errors.push("Payer bank information missing");
      if (!payer.qrUrl) errors.push("Payer QR code missing");
    }
    
    // Check for items without participants
    const itemsWithoutParticipants = items.filter(item => 
      item.type === "NORMAL" && !item.shares.some(s => s.include)
    );
    if (itemsWithoutParticipants.length > 0) {
      errors.push(`${itemsWithoutParticipants.length} items have no participants`);
    }
    
    setValidationErrors(errors);
  }, [payer, items]);

  // Event handlers
  const handleItemUpdate = (itemId: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleShareUpdate = (itemId: string, participantId: string, updates: Partial<ItemShare>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      return {
        ...item,
        shares: item.shares.map(share =>
          share.participantId === participantId ? { ...share, ...updates } : share
        ),
      };
    }));
  };

  const handleDistributeItem = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      if (item.splitMethod === "EQUAL") {
        const includedShares = item.shares.filter(s => s.include && !s.locked);
        if (includedShares.length === 0) return item;
        
        const amountPerShare = (item.fee || 0) / includedShares.length;
        
        return {
          ...item,
          shares: item.shares.map(share => {
            if (!share.include || share.locked) return share;
            return { ...share, amount: amountPerShare };
          }),
        };
      } else if (item.splitMethod === "PERCENT") {
        // Validate percentages sum to 100%
        const totalPercentage = item.shares.reduce((sum, share) => {
          const percentage = parseFloat(share.rawInput || "0");
          return sum + (share.include ? percentage : 0);
        }, 0);
        
        if (billSettings.autoValidatePercentages && Math.abs(totalPercentage - 100) > 0.01) {
          toast.error(`${item.name}: Percentages must sum to 100% (currently ${totalPercentage.toFixed(1)}%)`);
          return item;
        }
        
        return {
          ...item,
          shares: item.shares.map(share => {
            if (!share.include) return { ...share, amount: 0 };
            const percentage = parseFloat(share.rawInput || "0");
            return { ...share, amount: (item.fee || 0) * (percentage / 100) };
          }),
        };
      }
      
      return item;
    }));
  };

  const handleDistributeAll = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    items.forEach(item => {
      if (item.type === "NORMAL") {
        handleDistributeItem(item.id);
      }
    });
    
    setIsCalculating(false);
    toast.success("All items distributed successfully!");
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Remove item from local state
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      // In a real app, you would also call the API:
      // const response = await fetch(`/api/bills/${bill.id}/items/${itemId}`, {
      //   method: 'DELETE',
      // });
      
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: `New Item ${items.filter(i => i.type === "NORMAL").length + 1}`,
      fee: 0,
      splitMethod: billSettings.defaultSplitMethod,
      type: "NORMAL",
      order: items.filter(i => i.type === "NORMAL").length,
      shares: participants.map(p => ({
        participantId: p.id,
        include: true,
        locked: false,
        paid: false,
        amount: 0,
      })),
    };
    
    setItems(prev => [...prev.filter(i => i.type === "NORMAL"), newItem, ...prev.filter(i => i.type !== "NORMAL")]);
  };

  const toggleParticipantCompleted = (participantId: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, completed: !p.completed } : p
    ));
  };

  // Drag and drop for payment tracking (desktop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, itemId: string, participantId: string) => {
    e.preventDefault();
    if (draggedPayment === "PAID") {
      handleShareUpdate(itemId, participantId, { paid: true });
      setDraggedPayment(null);
      toast.success("Payment marked as PAID!");
    } else if (draggedPayment === "UNPAID") {
      handleShareUpdate(itemId, participantId, { paid: false });
      setDraggedPayment(null);
      toast.success("Payment marked as UNPAID!");
    }
  };

  // Handle drop on participant header to mark ALL items for that participant
  const handleParticipantDrop = (e: React.DragEvent, participantId: string) => {
    e.preventDefault();
    if (draggedPayment === "PAID") {
      // Mark ALL items as PAID for this participant where they are included
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          shares: item.shares.map(share => 
            share.participantId === participantId && share.include 
              ? { ...share, paid: true }
              : share
          )
        }))
      );
      setDraggedPayment(null);
      toast.success(`All items marked as PAID for participant!`);
    } else if (draggedPayment === "UNPAID") {
      // Mark ALL items as UNPAID for this participant where they are included
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          shares: item.shares.map(share => 
            share.participantId === participantId && share.include 
              ? { ...share, paid: false }
              : share
          )
        }))
      );
      setDraggedPayment(null);
      toast.success(`All items marked as UNPAID for participant!`);
    }
  };

  // Export functions
  const handleSnapshotPreview = () => {
    setShowSnapshot(true);
  };

  const handleCopyAsImage = async () => {
    try {
      const element = document.getElementById('snapshot-content');
      if (!element) {
        toast.error("Snapshot content not found");
        return;
      }

      // Wait for complete rendering and force recalculation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Force layout recalculation
      element.style.display = 'block';
      element.offsetHeight; // Trigger reflow

      // Ensure all images are loaded
      const images = element.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 3000); // Timeout fallback
        });
      }));

      // Get computed styles from the preview window
      const computedStyle = window.getComputedStyle(element);

      const canvas = await html2canvas(element, {
        backgroundColor: computedStyle.backgroundColor || '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 30000,
        onclone: (clonedDoc, element) => {
          // Apply export-safe styles to fix gradient text issues
          const style = clonedDoc.createElement('style');
          style.textContent = `
            /* Fix gradient text issues */
            .export-safe-title {
              color: inherit !important;
              background: none !important;
              -webkit-text-fill-color: unset !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
            }
            .export-safe-title h1,
            .export-safe-title h2,
            .export-safe-title h3,
            .export-safe-title h4 {
              color: inherit !important;
              background: none !important;
              -webkit-text-fill-color: unset !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
            }
            
            /* Fix all gradient text elements */
            [class*="bg-gradient"][class*="bg-clip-text"],
            [class*="text-transparent"] {
              background: none !important;
              -webkit-text-fill-color: unset !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
              color: #374151 !important; /* Default dark gray */
            }
            
            /* Specific color fixes for different sections */
            .text-purple-600 { color: #9333ea !important; }
            .text-yellow-700 { color: #a16207 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            
            /* Ensure all text is visible */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix backdrop filters */
            [class*="backdrop-blur"] {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Get the original element for style copying
          const originalElement = document.getElementById('snapshot-content');
          const clonedElement = clonedDoc.getElementById('snapshot-content');
          
          if (clonedElement && originalElement) {
            // Fix specific problematic elements
            const gradientTexts = clonedElement.querySelectorAll('[class*="bg-gradient"][class*="bg-clip-text"], [class*="text-transparent"]');
            gradientTexts.forEach(el => {
              const element = el as HTMLElement;
              element.style.background = 'none';
              element.style.webkitTextFillColor = 'unset';
              element.style.backgroundClip = 'unset';
              element.style.webkitBackgroundClip = 'unset';
              element.style.color = '#374151'; // Dark gray fallback
            });
            
            // Ensure proper text colors for specific elements
            const purpleTexts = clonedElement.querySelectorAll('.text-purple-600');
            purpleTexts.forEach(el => (el as HTMLElement).style.color = '#9333ea');
            
            const yellowTexts = clonedElement.querySelectorAll('.text-yellow-700');
            yellowTexts.forEach(el => (el as HTMLElement).style.color = '#a16207');
            
            // Copy all child elements styles recursively
            const copyStyles = (original: Element, cloned: Element) => {
              const originalStyle = window.getComputedStyle(original);
              const clonedElement = cloned as HTMLElement;
              const clonedStyle = clonedElement.style;
              
              // Copy essential styles, skipping problematic ones
              const skipProperties = ['background-clip', '-webkit-background-clip', 'backdrop-filter', '-webkit-backdrop-filter'];
              for (let i = 0; i < originalStyle.length; i++) {
                const property = originalStyle[i];
                if (!skipProperties.includes(property)) {
                  clonedStyle.setProperty(property, originalStyle.getPropertyValue(property));
                }
              }
              
              // Recursively copy child styles
              for (let i = 0; i < original.children.length; i++) {
                if (cloned.children[i]) {
                  copyStyles(original.children[i], cloned.children[i]);
                }
              }
            };
            
            copyStyles(originalElement, clonedElement);
            
            // Ensure grid layouts work
            const grids = clonedElement.querySelectorAll('[class*="grid"]');
            grids.forEach(grid => {
              const gridElement = grid as HTMLElement;
              gridElement.style.display = 'grid';
              if (grid.className.includes('grid-cols-2')) {
                gridElement.style.gridTemplateColumns = '1fr 1fr';
              }
            });
            
            // Force all text to be visible
            const textElements = clonedElement.querySelectorAll('*');
            textElements.forEach(el => {
              const element = el as HTMLElement;
              element.style.opacity = '1';
              element.style.visibility = 'visible';
            });
          }
        }
      });

      canvas.toBlob(async (blob: Blob | null) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast.success("📋 Perfect snapshot with matching fonts copied!");
          } catch (err) {
            // Fallback: create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${bill?.title || 'bill'}-snapshot.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("📋 Perfect snapshot with matching fonts downloaded!");
          }
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Copy as image failed:', error);
      toast.error("Failed to copy image");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('snapshot-content');
      if (!element) {
        toast.error("Snapshot content not found");
        return;
      }

      // Wait for complete rendering and force recalculation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Force layout recalculation
      element.style.display = 'block';
      element.offsetHeight; // Trigger reflow

      // Ensure all images are loaded
      const images = element.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 3000); // Timeout fallback
        });
      }));

      // Use enhanced html2canvas like the image function
      const computedStyle = window.getComputedStyle(element);

      const canvas = await html2canvas(element, {
        backgroundColor: computedStyle.backgroundColor || '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 30000,
        onclone: (clonedDoc, element) => {
          // Apply same enhanced export-safe styles as image function
          const style = clonedDoc.createElement('style');
          style.textContent = `
            /* Fix gradient text issues */
            .export-safe-title {
              color: inherit !important;
              background: none !important;
              -webkit-text-fill-color: unset !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
            }
            .export-safe-title h1,
            .export-safe-title h2,
            .export-safe-title h3,
            .export-safe-title h4 {
              color: inherit !important;
              background: none !important;
              -webkit-text-fill-color: unset !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
            }
            
            /* Fix all gradient text elements */
            [class*="bg-gradient"][class*="bg-clip-text"],
            [class*="text-transparent"] {
              background: none !important;
              -webkit-text-fill-color: unset !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
              color: #374151 !important;
            }
            
            /* Specific color fixes for different sections */
            .text-purple-600 { color: #9333ea !important; }
            .text-yellow-700 { color: #a16207 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            
            /* Ensure all text is visible */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Fix backdrop filters */
            [class*="backdrop-blur"] {
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Get the original element for style copying
          const originalElement = document.getElementById('snapshot-content');
          const clonedElement = clonedDoc.getElementById('snapshot-content');
          
          if (clonedElement && originalElement) {
            // Fix specific problematic elements
            const gradientTexts = clonedElement.querySelectorAll('[class*="bg-gradient"][class*="bg-clip-text"], [class*="text-transparent"]');
            gradientTexts.forEach(el => {
              const element = el as HTMLElement;
              element.style.background = 'none';
              element.style.webkitTextFillColor = 'unset';
              element.style.backgroundClip = 'unset';
              element.style.webkitBackgroundClip = 'unset';
              element.style.color = '#374151';
            });
            
            // Ensure proper text colors for specific elements
            const purpleTexts = clonedElement.querySelectorAll('.text-purple-600');
            purpleTexts.forEach(el => (el as HTMLElement).style.color = '#9333ea');
            
            const yellowTexts = clonedElement.querySelectorAll('.text-yellow-700');
            yellowTexts.forEach(el => (el as HTMLElement).style.color = '#a16207');
            
            // Copy all child elements styles recursively
            const copyStyles = (original: Element, cloned: Element) => {
              const originalStyle = window.getComputedStyle(original);
              const clonedElement = cloned as HTMLElement;
              const clonedStyle = clonedElement.style;
              
              // Copy essential styles, skipping problematic ones
              const skipProperties = ['background-clip', '-webkit-background-clip', 'backdrop-filter', '-webkit-backdrop-filter'];
              for (let i = 0; i < originalStyle.length; i++) {
                const property = originalStyle[i];
                if (!skipProperties.includes(property)) {
                  clonedStyle.setProperty(property, originalStyle.getPropertyValue(property));
                }
              }
              
              // Recursively copy child styles
              for (let i = 0; i < original.children.length; i++) {
                if (cloned.children[i]) {
                  copyStyles(original.children[i], cloned.children[i]);
                }
              }
            };
            
            copyStyles(originalElement, clonedElement);
            
            // Ensure grid layouts work
            const grids = clonedElement.querySelectorAll('[class*="grid"]');
            grids.forEach(grid => {
              const gridElement = grid as HTMLElement;
              gridElement.style.display = 'grid';
              if (grid.className.includes('grid-cols-2')) {
                gridElement.style.gridTemplateColumns = '1fr 1fr';
              }
            });
            
            // Force all text to be visible
            const textElements = clonedElement.querySelectorAll('*');
            textElements.forEach(el => {
              const element = el as HTMLElement;
              element.style.opacity = '1';
              element.style.visibility = 'visible';
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new (await import('jspdf')).jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit on single A4 page with proper margins
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 15; // Margin in mm
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);

      // Calculate scaling to fit content on one page
      const imgAspectRatio = canvas.height / canvas.width;
      let imgWidth = maxWidth;
      let imgHeight = imgWidth * imgAspectRatio;

      // If height exceeds page, scale down based on height
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight / imgAspectRatio;
      }

      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${bill?.title || 'bill'}-snapshot.pdf`);
      toast.success("📄 Perfect PDF with matching fonts downloaded!");
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error("Failed to download PDF");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Manual refresh function for bank data
  const handleRefreshBankData = async () => {
    try {
      const peopleRes = await fetch('/api/people', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (peopleRes.ok) {
        const responseData = await peopleRes.json();
        console.log('API Response:', responseData);
        
        // Handle different response structures
        const updatedPeople = Array.isArray(responseData) ? responseData : responseData.data || [];
        
        if (!Array.isArray(updatedPeople)) {
          console.error('Invalid response format:', responseData);
          toast.error("Invalid response format from server");
          return;
        }
        
        // Update participants with fresh bank data
        setParticipants(prevParticipants => 
          prevParticipants.map(participant => {
            const updatedPerson = updatedPeople.find((p: any) => p.id === participant.id);
            if (updatedPerson) {
              return {
                ...participant,
                accountNumber: updatedPerson.accountNumber,
                bankCode: updatedPerson.bankCode,
                accountHolder: updatedPerson.accountHolder,
                qrUrl: updatedPerson.qrUrl,
                bankName: updatedPerson.bank?.name,
                bankLogoUrl: updatedPerson.bank?.logoUrl,
              };
            }
            return participant;
          })
        );
        
        toast.success("Bank data refreshed successfully!");
      } else {
        const errorText = await peopleRes.text();
        console.error('API Error:', errorText);
        toast.error("Failed to fetch updated data from server");
      }
    } catch (error) {
      console.error('Error refreshing bank data:', error);
      toast.error("Failed to refresh bank data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {bill?.title || 'CHIA TIỀN MUA ĐỒ'}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>📅 {new Date(bill?.date || Date.now()).toLocaleDateString('vi-VN')}</span>
                <span>👥 Group: {bill?.group?.name || 'Manual'}</span>
                <span>💰 Total: {formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditDialog(true)}
              title="Edit bill details"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshBankData}
              title="Refresh bank logos and QR codes"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowParticipantsModal(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Participants
            </Button>
            <Badge 
              variant={bill?.status === 'OPEN' ? 'default' : 'secondary'}
              className="px-3 py-1"
            >
              {bill?.status || 'DRAFT'}
            </Badge>
          </div>
        </div>

        {/* Validation Warnings */}
        {validationErrors.length > 0 && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-200">Validation Warnings</h3>
                <ul className="mt-2 text-sm text-yellow-300 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Per-Bill Settings Panel */}
        {showSettings && (
          <Card className="border-blue-600 bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                Bill Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Split Configuration - Basic */}
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Split Configuration</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Default Split Method</label>
                      <Select 
                        value={billSettings.defaultSplitMethod}
                        onValueChange={(value: "EQUAL" | "PERCENT") => 
                          setBillSettings(prev => ({ ...prev, defaultSplitMethod: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EQUAL">Equal Split</SelectItem>
                          <SelectItem value="PERCENT">Percentage Split</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Rounding Rule</label>
                      <Select 
                        value={billSettings.roundingRule}
                        onValueChange={(value: "UP" | "DOWN" | "NEAREST") => 
                          setBillSettings(prev => ({ ...prev, roundingRule: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEAREST">Round to Nearest</SelectItem>
                          <SelectItem value="UP">Round Up</SelectItem>
                          <SelectItem value="DOWN">Round Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Currency</label>
                      <Select 
                        value={billSettings.currency}
                        onValueChange={(value) => 
                          setBillSettings(prev => ({ ...prev, currency: value }))
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VND">Vietnamese Dong (VND)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Participant Rules - Basic */}
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Participant Rules</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Allow Partial Participation</label>
                      <Switch
                        checked={billSettings.allowPartialParticipation}
                        onCheckedChange={(checked) => 
                          setBillSettings(prev => ({ ...prev, allowPartialParticipation: checked }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Minimum Participants per Item</label>
                      <Input
                        type="number"
                        min="1"
                        value={billSettings.minParticipantsPerItem || 1}
                        onChange={(e) => 
                          setBillSettings(prev => ({ ...prev, minParticipantsPerItem: parseInt(e.target.value) || 1 }))
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Auto-validate Percentages</label>
                      <Switch
                        checked={billSettings.autoValidatePercentages || false}
                        onCheckedChange={(checked) => 
                          setBillSettings(prev => ({ ...prev, autoValidatePercentages: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings Toggle Button */}
              <div className="border-t border-gray-600 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  <Settings className="h-4 w-4" />
                  <span>{showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}</span>
                  <div className={`transition-transform duration-200 ${showAdvancedSettings ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </div>

              {/* Advanced Settings - Collapsible */}
              {showAdvancedSettings && (
                <div className="space-y-4 animate-in slide-in-from-top-1 duration-200">
                  {/* Payment & Export Settings */}
                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="font-medium text-white mb-4">Payment & Export</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">Require Payment Confirmation</label>
                        <Switch
                          checked={billSettings.requirePaymentConfirmation || false}
                          onCheckedChange={(checked) => 
                            setBillSettings(prev => ({ ...prev, requirePaymentConfirmation: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">Include QR in Export</label>
                        <Switch
                          checked={billSettings.includeQRInExport || true}
                          onCheckedChange={(checked) => 
                            setBillSettings(prev => ({ ...prev, includeQRInExport: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bill Status Management removed from advanced settings - moved to sidebar */}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - Interactive Items Table */}
          <div className="xl:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        📋 Expense Distribution Details
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>🛒 {items.filter(i => i.type === "NORMAL").length} items</span>
                        <span>👥 {participants.length} participants</span>
                        {lastSaved && !isSaving && (
                          <span className="text-green-400">
                            ✓ Last saved {lastSaved.toLocaleTimeString()}
                          </span>
                        )}
                        {isSaving && (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* PAID/UNPAID Tokens for Drag & Drop (Desktop Only) */}
                <div className="hidden sm:block mb-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-200">💰 Payment Tokens:</span>
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggedPayment("PAID");
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold cursor-move hover:bg-green-500 transition-colors"
                    >
                      PAID
                    </div>
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggedPayment("UNPAID");
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold cursor-move hover:bg-red-500 transition-colors"
                    >
                      UNPAID
                    </div>
                    <span className="text-xs text-gray-300">Drag tokens onto table cells to update payment status</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full bg-gray-800">
                      {/* Header */}
                      <thead className="bg-gradient-to-r from-purple-700 to-blue-700">
                        <tr>
                          <th className="text-left p-3 font-semibold min-w-[200px] border-r border-gray-500 text-white">
                            Item Name
                          </th>
                          <th className="text-right p-3 font-semibold min-w-[120px] border-r border-gray-500 text-white">
                            Fee (VND)
                          </th>
                          <th className="text-center p-3 font-semibold min-w-[100px] border-r border-gray-500 text-white">
                            Split Method
                          </th>
                          {participants.map((participant, index) => (
                            <th
                              key={participant.id}
                              className={`text-center p-3 font-semibold min-w-[100px] border-r border-gray-500 ${
                                getParticipantColor(index, participant.isPayer)
                              } transition-all duration-200`}
                              onDragOver={(e) => {
                                handleDragOver(e);
                                if (draggedPayment) {
                                  e.currentTarget.classList.add('ring-4', 'ring-yellow-400', 'bg-yellow-900/30', 'scale-105');
                                }
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('ring-4', 'ring-yellow-400', 'bg-yellow-900/30', 'scale-105');
                              }}
                              onDrop={(e) => {
                                handleParticipantDrop(e, participant.id);
                                e.currentTarget.classList.remove('ring-4', 'ring-yellow-400', 'bg-yellow-900/30', 'scale-105');
                              }}
                              title="Drag PAID/UNPAID tokens here to mark ALL items for this participant"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs">{participant.displayName}</span>
                                {participant.isPayer && (
                                  <Badge variant="secondary" className="text-xs bg-indigo-800 text-indigo-100">PAYER</Badge>
                                )}
                                {draggedPayment && (
                                  <div className="text-xs text-yellow-300 font-medium animate-pulse">
                                    Drop to mark ALL
                                  </div>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="text-center p-3 font-semibold min-w-[80px]">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Normal Items */}
                        {items.filter(item => item.type === "NORMAL").map((item) => (
                          <tr key={item.id} className="border-b border-gray-600 hover:bg-gray-700">
                            {/* Item Name */}
                            <td className="p-3 border-r border-gray-600">
                              <Input
                                value={item.name}
                                onChange={(e) => handleItemUpdate(item.id, { name: e.target.value })}
                                className="border-none p-0 h-auto text-sm font-medium focus:ring-0 bg-transparent text-white"
                              />
                            </td>

                            {/* Fee */}
                            <td className="p-3 text-right border-r border-gray-600">
                              <Input
                                type="number"
                                value={item.fee || ""}
                                onChange={(e) => handleItemUpdate(item.id, { fee: parseFloat(e.target.value) || 0 })}
                                className="text-right border-none p-0 h-auto text-sm focus:ring-0 bg-transparent text-white"
                                placeholder="0"
                              />
                            </td>

                            {/* Split Method */}
                            <td className="p-3 border-r border-gray-600">
                              <Select
                                value={item.splitMethod}
                                onValueChange={(value: "EQUAL" | "PERCENT") =>
                                  handleItemUpdate(item.id, { splitMethod: value })
                                }
                              >
                                <SelectTrigger className="h-6 text-xs border-none bg-transparent text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EQUAL">Equal</SelectItem>
                                  <SelectItem value="PERCENT">Percent</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>

                            {/* Participant Shares */}
                            {participants.map((participant, participantIndex) => {
                              const share = item.shares.find(s => s.participantId === participant.id);
                              if (!share) return <td key={participant.id} className="p-3"></td>;

                              const colorClass = getParticipantColor(participantIndex, participant.isPayer);

                              return (
                                <td 
                                  key={`${item.id}-${participant.id}`}
                                  className={`relative p-2 text-center min-w-[100px] border-r border-gray-600 ${
                                    colorClass.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-opacity-90 text-')
                                  } ${!share.include ? "opacity-50" : ""} ${share.paid ? "ring-2 ring-green-400" : ""} ${
                                    share.include ? "hover:bg-gray-600/50 transition-colors" : ""
                                  }`}
                                  onDragOver={(e) => {
                                    handleDragOver(e);
                                    if (share.include && draggedPayment) {
                                      e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'bg-blue-900/30');
                                    }
                                  }}
                                  onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-900/30');
                                  }}
                                  onDrop={(e) => {
                                    handleDrop(e, item.id, participant.id);
                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-900/30');
                                  }}
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    {/* Include Checkbox for Equal Split OR Percentage Input for Percent Split */}
                                    {item.splitMethod === "EQUAL" ? (
                                      <Checkbox
                                        checked={share.include}
                                        onCheckedChange={(checked) =>
                                          handleShareUpdate(item.id, participant.id, { include: !!checked })
                                        }
                                        className="h-3 w-3"
                                      />
                                    ) : (
                                      <Input
                                        type="number"
                                        value={share.rawInput || ""}
                                        onChange={(e) => {
                                          const inputValue = e.target.value;
                                          const percentage = parseFloat(inputValue) || 0;
                                          
                                          // Calculate current total percentage for this item (excluding this participant)
                                          const currentTotal = item.shares
                                            .filter(s => s.participantId !== participant.id && s.include && s.rawInput)
                                            .reduce((sum, s) => sum + (parseFloat(s.rawInput || '0') || 0), 0);
                                          
                                          // Check if adding this percentage would exceed 100%
                                          const newTotal = currentTotal + percentage;
                                          
                                          if (newTotal > 100) {
                                            // Auto-adjust to remaining percentage
                                            const remainingPercentage = Math.max(0, 100 - currentTotal);
                                            const adjustedValue = remainingPercentage.toString();
                                            
                                            handleShareUpdate(item.id, participant.id, { 
                                              rawInput: adjustedValue,
                                              include: remainingPercentage > 0,
                                              amount: (item.fee || 0) * (remainingPercentage / 100),
                                              isManualEntry: true
                                            });
                                            
                                            if (remainingPercentage < percentage) {
                                              toast.warning(`Auto-adjusted to ${remainingPercentage}% (max remaining for ${item.name})`);
                                            }
                                          } else {
                                            // Normal update - mark as manual entry
                                            handleShareUpdate(item.id, participant.id, { 
                                              rawInput: inputValue,
                                              include: percentage > 0,
                                              amount: (item.fee || 0) * (percentage / 100),
                                              isManualEntry: percentage > 0 // Only mark as manual if user entered a value
                                            });
                                            
                                            // Smart auto-distribution: only distribute to NON-MANUAL entries
                                            if (percentage > 0 && inputValue.length > 0 && !inputValue.endsWith('.')) {
                                              setTimeout(() => {
                                                // Calculate remaining percentage to distribute
                                                const totalAfterUpdate = item.shares
                                                  .filter(s => s.include && s.rawInput)
                                                  .reduce((sum, s) => {
                                                    if (s.participantId === participant.id) {
                                                      return sum + percentage;
                                                    }
                                                    return sum + (parseFloat(s.rawInput || '0') || 0);
                                                  }, 0);
                                                
                                                const remainingPercentage = 100 - totalAfterUpdate;
                                                
                                                if (remainingPercentage > 0) {
                                                  // Only auto-distribute to participants WITHOUT manual entries
                                                  const autoParticipants = item.shares.filter(s => 
                                                    s.participantId !== participant.id && 
                                                    s.include && 
                                                    !s.isManualEntry && // Key change: only auto participants
                                                    (!s.rawInput || parseFloat(s.rawInput) === 0)
                                                  );
                                                  
                                                  if (autoParticipants.length > 0) {
                                                    // Distribute remaining percentage equally
                                                    const percentagePerPerson = remainingPercentage / autoParticipants.length;
                                                    const roundedPercentage = Math.round(percentagePerPerson * 10) / 10;
                                                    
                                                    // Update ONLY auto participants
                                                    setItems(prevItems => prevItems.map(prevItem => {
                                                      if (prevItem.id === item.id) {
                                                        return {
                                                          ...prevItem,
                                                          shares: prevItem.shares.map(share => {
                                                            if (autoParticipants.some(op => op.participantId === share.participantId)) {
                                                              return {
                                                                ...share,
                                                                rawInput: roundedPercentage.toString(),
                                                                include: true,
                                                                amount: (item.fee || 0) * (roundedPercentage / 100),
                                                                isManualEntry: false // Keep as auto-entry
                                                              };
                                                            }
                                                            return share;
                                                          })
                                                        };
                                                      }
                                                      return prevItem;
                                                    }));
                                                    
                                                    toast.success(`Auto-distributed ${remainingPercentage}% among ${autoParticipants.length} auto participants (${roundedPercentage}% each)`);
                                                  }
                                                }
                                              }, 500);
                                            }
                                          }
                                        }}
                                        className={`w-12 h-6 text-xs text-center border rounded bg-gray-700 text-white p-1 ${
                                          (() => {
                                            const currentTotal = item.shares
                                              .filter(s => s.include && s.rawInput)
                                              .reduce((sum, s) => sum + (parseFloat(s.rawInput || '0') || 0), 0);
                                            if (currentTotal > 100) return 'border-red-500';
                                            if (currentTotal === 100) return 'border-green-500';
                                            return 'border-gray-500';
                                          })()
                                        }`}
                                        placeholder="%"
                                        min="0"
                                        max="100"
                                        title="Enter percentage - auto-distributes remaining to others in real-time"
                                      />
                                    )}

                                    {/* Amount Display */}
                                    {!share.include ? (
                                      <span className="text-gray-500 text-lg">–</span>
                                    ) : (
                                      <div className="text-xs">
                                        <span className={`font-medium ${share.paid ? "text-green-400" : "text-white"}`}>
                                          {formatCurrency(share.amount)}
                                        </span>
                                        {item.splitMethod === "PERCENT" && share.rawInput && (
                                          <div className="text-xs text-gray-400">({share.rawInput}%)</div>
                                        )}
                                      </div>
                                    )}

                                    {/* Payment Status */}
                                    {share.include && (
                                      <div className="flex items-center gap-1">
                                        {/* Mobile: Keep tick boxes for touch interaction */}
                                        <div className="block sm:hidden">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0"
                                            onClick={() =>
                                              handleShareUpdate(item.id, participant.id, { paid: !share.paid })
                                            }
                                          >
                                            {share.paid ? (
                                              <Check className="h-3 w-3 text-green-400" />
                                            ) : (
                                              <X className="h-3 w-3 text-gray-500" />
                                            )}
                                          </Button>
                                          {share.paid && (
                                            <span className="text-xs text-green-400 font-bold">✓</span>
                                          )}
                                        </div>

                                        {/* Desktop: Show payment status for drag-drop target */}
                                        <div className="hidden sm:block">
                                          {share.paid && (
                                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-semibold">PAID</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}

                            {/* Actions */}
                            <td className="p-3 text-center">
                              <div className="flex items-center gap-1 justify-center">
                                <Button
                                  onClick={() => handleDistributeItem(item.id)}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs"
                                >
                                  Calc
                                </Button>
                                <Button
                                  onClick={() => setDeleteItemId(item.id)}
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 text-xs"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Percentage Summary Rows */}
                        {items.filter(item => item.type === "NORMAL" && item.splitMethod === "PERCENT").map((item) => {
                          const totalPercentage = item.shares
                            .filter(s => s.include && s.rawInput)
                            .reduce((sum, s) => sum + (parseFloat(s.rawInput || '0') || 0), 0);
                          
                          return (
                            <tr key={`${item.id}-summary`} className="border-b border-gray-600 bg-gray-750">
                              <td className="p-2 text-xs text-gray-400 border-r border-gray-600">
                                <span className="italic">↳ {item.name} total:</span>
                              </td>
                              <td className="p-2 border-r border-gray-600"></td>
                              <td className="p-2 border-r border-gray-600 text-center">
                                <div className={`text-xs font-bold ${
                                  totalPercentage > 100 ? 'text-red-400' :
                                  totalPercentage === 100 ? 'text-green-400' :
                                  'text-yellow-400'
                                }`}>
                                  {totalPercentage.toFixed(1)}%
                                </div>
                              </td>
                              {participants.map((participant) => {
                                const share = item.shares.find(s => s.participantId === participant.id);
                                return (
                                  <td key={participant.id} className="p-2 border-r border-gray-600 text-center">
                                    {share?.include && share?.rawInput && (
                                      <span className="text-xs text-gray-400">
                                        {share.rawInput}%
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="p-2">
                                {totalPercentage > 100 && (
                                  <span className="text-xs text-red-400">Over 100%!</span>
                                )}
                                {totalPercentage === 100 && (
                                  <span className="text-xs text-green-400">✓ Perfect</span>
                                )}
                                {totalPercentage > 0 && totalPercentage < 100 && (
                                  <span className="text-xs text-yellow-400">
                                    {(100 - totalPercentage).toFixed(1)}% left
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Separator for Adjustments */}
                        <tr className="bg-gray-700">
                          <td colSpan={3 + participants.length + 1} className="p-2 text-center text-sm text-gray-300">
                            <div className="border-t border-dashed border-gray-500 w-full"></div>
                            <span className="bg-gray-700 px-2 text-xs text-yellow-400 font-semibold">⚡ ADJUSTMENTS</span>
                          </td>
                        </tr>

                        {/* Adjustment Items */}
                        {items.filter(item => item.type !== "NORMAL").map((item) => (
                          <tr key={item.id} className="border-b border-gray-600 bg-yellow-900/20 hover:bg-yellow-900/30">
                            <td className="p-3 border-r border-gray-600">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                                  {item.type === "CARRY_OVER" ? "💰 Previous" : "🎁 Discount"}
                                </Badge>
                                <Input
                                  value={item.name}
                                  onChange={(e) => handleItemUpdate(item.id, { name: e.target.value })}
                                  className="border-none p-0 h-auto text-sm font-medium focus:ring-0 bg-transparent text-yellow-100"
                                />
                              </div>
                            </td>
                            <td className="p-3 text-center border-r border-gray-600">
                              <span className="text-xs text-yellow-300 italic">Individual Amounts →</span>
                            </td>
                            <td className="p-3 border-r border-gray-600">
                              <span className="text-xs text-yellow-300">No Split</span>
                            </td>

                            {/* Individual amounts per participant */}
                            {participants.map((participant, participantIndex) => {
                              const share = item.shares.find(s => s.participantId === participant.id);
                              if (!share) return <td key={participant.id} className="p-3"></td>;

                              const colorClass = getParticipantColor(participantIndex, participant.isPayer);

                              return (
                                <td 
                                  key={`${item.id}-${participant.id}`} 
                                  className={`p-2 text-center border-r border-gray-600 ${
                                    colorClass.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-opacity-90 text-')
                                  }`}
                                >
                                  <Input
                                    type="number"
                                    value={share.amount || ""}
                                    onChange={(e) => 
                                      handleShareUpdate(item.id, participant.id, { 
                                        amount: parseFloat(e.target.value) || 0,
                                        include: (parseFloat(e.target.value) || 0) !== 0 
                                      })
                                    }
                                    className="w-full text-center border border-gray-600 rounded text-xs p-1 bg-gray-800 text-white"
                                    placeholder="0"
                                  />
                                </td>
                              );
                            })}

                            <td className="p-3 text-center">
                              <Button
                                onClick={() => {
                                  setItems(prev => prev.filter(i => i.id !== item.id));
                                }}
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs text-red-400 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}

                        {/* Totals Row */}
                        <tr className="bg-purple-800 font-semibold text-white">
                          <td className="p-3 border-r border-gray-500 font-bold">TOTAL</td>
                          <td className="p-3 text-right border-r border-gray-500 font-bold">
                            {formatCurrency(grandTotal)}
                          </td>
                          <td className="p-3 border-r border-gray-500"></td>
                          {participants.map((participant, participantIndex) => {
                            const total = participantTotals.find(t => t.participant.id === participant.id)?.total || 0;
                            const colorClass = getParticipantColor(participantIndex, participant.isPayer);
                            
                            return (
                              <td
                                key={participant.id}
                                className={`p-3 text-center border-r border-gray-500 font-bold ${
                                  colorClass
                                }`}
                              >
                                {formatCurrency(total)}
                              </td>
                            );
                          })}
                          <td className="p-3"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-300 bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox checked className="h-3 w-3" />
                    <span>Include in item</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-400" />
                    <span>Payment received</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-lg">–</span>
                    <span>Not participating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-green-600 text-white rounded text-xs">PAID</div>
                    <span>Drag to mark payment (desktop)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span>Color coded participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⚡</span>
                    <span>Adjustments: Enter individual amounts per person</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">⌨️</span>
                    <span>Percent mode: Auto-distributes remaining % to others in real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Compact Bill Status Card - moved here from advanced settings */}
            <Card className="bg-slate-800 text-white border border-slate-700 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-3">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-700 text-white text-xs font-medium">Status</div>
                  <span className="font-semibold">Bill Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-300">Current</div>
                    <div className="mt-2">
                      <Badge className={`px-2 py-0.5 text-xs ${bill?.status === 'SETTLED' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                        {bill?.status || 'DRAFT'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getNextStatus(bill?.status || 'DRAFT') && (
                      <Button
                        onClick={() => changeBillStatus(getNextStatus(bill?.status || 'DRAFT') as any)}
                        disabled={!canAdvanceStatus(bill?.status || 'DRAFT') || isChangingStatus}
                        variant={canAdvanceStatus(bill?.status || 'DRAFT') ? 'default' : 'secondary'}
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {isChangingStatus ? 'Updating...' : `Advance to ${getNextStatus(bill?.status || 'DRAFT')}`}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  {bill?.status === 'DRAFT' && <div>💡 Add items with prices and participants to activate.</div>}
                  {bill?.status === 'ACTIVE' && <div>💡 Ensure all items are fully allocated to proceed.</div>}
                  {bill?.status === 'COMPLETED' && <div>💡 Mark payments as received to settle.</div>}
                  {bill?.status === 'SETTLED' && <div>✅ This bill is fully settled.</div>}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Items Total:</span>
                  <span className="font-bold">{formatCurrency(totalNormalFee)}</span>
                </div>
                {totalAdjustments !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Adjustments:</span>
                    <span className={`font-bold ${totalAdjustments < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(totalAdjustments)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-600 pt-2 flex justify-between">
                  <span className="text-white font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                </div>
                
                <div className="border-t border-slate-600 pt-3 space-y-3">
                  {/* Payment Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Payment Progress:</span>
                      <span className="text-white font-medium">
                        {Math.round((participantTotals.reduce((acc, { total, outstanding }) => acc + (total - outstanding), 0) / participantTotals.reduce((acc, { total }) => acc + total, 0)) * 100) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.round((participantTotals.reduce((acc, { total, outstanding }) => acc + (total - outstanding), 0) / participantTotals.reduce((acc, { total }) => acc + total, 0)) * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Individual Payment Status */}
                  <div>
                    <div className="text-sm text-slate-300 mb-2">Individual Status:</div>
                    {participantTotals.map(({ participant, total, outstanding }) => (
                      <div key={participant.id} className="flex justify-between items-center text-xs mb-2">
                        <span className="text-slate-300 truncate max-w-[100px]">
                          {participant.displayName}:
                        </span>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <div className="text-white">{formatCurrency(total)}</div>
                            {outstanding > 0 && (
                              <div className="text-red-400">-{formatCurrency(outstanding)}</div>
                            )}
                          </div>
                          {outstanding === 0 && total > 0 && (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleDistributeAll} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isCalculating}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? 'Calculating...' : 'Calculate All'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setItems(prev => prev.map(item => ({
                    ...item,
                    shares: item.shares.map(share => ({ ...share, paid: false, amount: 0 }))
                  })));
                  toast.success("Reset complete!");
                }}
              >
                Reset All
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowPaymentInfoModal(true)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Show Payment Info
              </Button>
              <Button 
                variant="outline"
                onClick={handleSnapshotPreview}
              >
                <Camera className="h-4 w-4 mr-2" />
                Snapshot Preview
              </Button>
              <Button 
                variant="outline"
                onClick={handleCopyAsImage}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy as Image
              </Button>
              <Button 
                variant="outline"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Action Bar - Visible on small screens */}
        <div className="lg:hidden">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="flex items-center justify-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Bill
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshBankData}
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSnapshotPreview}
                  className="flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Snapshot
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyAsImage}
                  className="flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Snapshot Preview Modal */}
        <Dialog open={showSnapshot} onOpenChange={setShowSnapshot}>
          <DialogContent className="!max-w-[95vw] !w-[95vw] !h-[90vh] !max-h-[90vh] overflow-hidden flex flex-col p-4" style={{ width: '95vw', height: '90vh', maxWidth: '95vw', maxHeight: '90vh' }}>
            <DialogHeader className="pb-4 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5 text-purple-600" />
                Bill Snapshot Preview
              </DialogTitle>
            </DialogHeader>
            
            {/* Scrollable Bill Content Frame */}
            <div className="flex-1 overflow-y-auto border-2 border-purple-200 rounded-xl bg-white shadow-inner">
              <div id="snapshot-content" className="bg-gradient-to-br from-slate-50 to-purple-50 p-8 min-h-full">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Hero Header Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
                  <div className="text-center">
                    <div className="export-safe-title">
                      <h1 className="text-3xl font-bold mb-2 text-purple-600">{bill?.title || 'EXPENSE REPORT'}</h1>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        📅 {new Date(bill?.date || Date.now()).toLocaleDateString('vi-VN')}
                      </span>
                      <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                        {bill?.status || 'ACTIVE'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Items Overview Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      📊 Expense Breakdown
                    </h2>
                  </div>
                  
                  <div className="w-full">
                    <table className="w-full table-auto">
                      <thead className="bg-purple-50">
                        <tr>
                          <th className="p-3 text-left font-semibold text-gray-800" style={{ width: 'auto' }}>Item</th>
                          <th className="p-3 text-right font-semibold text-gray-800" style={{ width: '100px' }}>Price</th>
                          {participants.map((p, index) => {
                            const lightBackgroundColors = [
                              'bg-purple-50', 'bg-indigo-50', 'bg-pink-50', 'bg-blue-50', 
                              'bg-violet-50', 'bg-fuchsia-50', 'bg-cyan-50', 'bg-teal-50',
                              'bg-emerald-50', 'bg-green-50', 'bg-amber-50', 'bg-orange-50'
                            ];
                            const strongChipColors = [
                              'bg-purple-600', 'bg-indigo-600', 'bg-pink-600', 'bg-blue-600', 
                              'bg-violet-600', 'bg-fuchsia-600', 'bg-cyan-600', 'bg-teal-600',
                              'bg-emerald-600', 'bg-green-600', 'bg-amber-600', 'bg-orange-600'
                            ];
                            const lightBgClass = lightBackgroundColors[index % lightBackgroundColors.length];
                            const chipClass = strongChipColors[index % strongChipColors.length];
                            return (
                              <th key={p.id} className={`p-2 text-center ${lightBgClass}`} style={{ minWidth: '80px' }}>
                                <div className={`${chipClass} rounded-md px-2 py-1 mx-1`}>
                                  <span className="font-semibold text-white text-sm">
                                    {p.displayName}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {items.filter(i => i.type === "NORMAL").map((item, itemIndex) => (
                          <tr key={item.id} className={itemIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="p-3 font-medium text-gray-800 text-sm">{item.name}</td>
                            <td className="p-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(item.fee || 0)}</td>
                            {participants.map((p, pIndex) => {
                              const share = item.shares.find(s => s.participantId === p.id);
                              const lightBackgroundColors = [
                                'bg-purple-50', 'bg-indigo-50', 'bg-pink-50', 'bg-blue-50', 
                                'bg-violet-50', 'bg-fuchsia-50', 'bg-cyan-50', 'bg-teal-50',
                                'bg-emerald-50', 'bg-green-50', 'bg-amber-50', 'bg-orange-50'
                              ];
                              const lightBgClass = lightBackgroundColors[pIndex % lightBackgroundColors.length];
                              return (
                                <td key={p.id} className={`p-2 text-center ${lightBgClass}`}>
                                  {!share?.include ? (
                                    <span className="text-gray-400 text-2xl">–</span>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="font-semibold text-gray-800 text-sm">
                                        {formatCurrency(share.amount)}
                                      </span>
                                      {share.paid && (
                                        <div className="flex items-center gap-1">
                                          <Check className="h-3 w-3 text-green-600" />
                                          <span className="text-xs text-green-600 font-medium">PAID</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        
                        {/* Adjustments Section - Only show if there are non-normal items */}
                        {items.filter(i => i.type !== "NORMAL").length > 0 && (
                          <>
                            <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                              <td colSpan={participants.length + 2} className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2 text-yellow-700 font-semibold text-sm">
                                  <span>⚡</span>
                                  <span>ADJUSTMENTS</span>
                                </div>
                              </td>
                            </tr>
                            {items.filter(i => i.type !== "NORMAL").map((item, itemIndex) => (
                              <tr key={item.id} className="bg-yellow-25 border-l-4 border-yellow-300">
                                <td colSpan={2} className="p-3 font-medium text-gray-800 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-500">
                                      {item.name.includes('Previous') ? '🔄' : item.name.includes('Discount') ? '💸' : '⚡'}
                                    </span>
                                    <span>{item.name}</span>
                                  </div>
                                </td>
                                {participants.map((p, pIndex) => {
                                  const share = item.shares.find(s => s.participantId === p.id);
                                  const lightBackgroundColors = [
                                    'bg-purple-50', 'bg-indigo-50', 'bg-pink-50', 'bg-blue-50', 
                                    'bg-violet-50', 'bg-fuchsia-50', 'bg-cyan-50', 'bg-teal-50',
                                    'bg-emerald-50', 'bg-green-50', 'bg-amber-50', 'bg-orange-50'
                                  ];
                                  const lightBgClass = lightBackgroundColors[pIndex % lightBackgroundColors.length];
                                  return (
                                    <td key={p.id} className={`p-2 text-center ${lightBgClass}`}>
                                      {!share?.include || (share.amount === 0 && (item.type !== "NORMAL")) ? (
                                        <span className="text-gray-400 text-2xl">–</span>
                                      ) : (
                                        <div className="flex flex-col items-center gap-1">
                                          <span className={`font-semibold text-sm ${share.amount < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                            {formatCurrency(share.amount)}
                                          </span>
                                          {share.paid && (
                                            <div className="flex items-center gap-1">
                                              <Check className="h-3 w-3 text-green-600" />
                                              <span className="text-xs text-green-600 font-medium">PAID</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </>
                        )}
                        
                        <tr style={{ backgroundColor: '#f1e8fe' }} className="border-t-2 border-purple-200">
                          <td className="p-2 font-bold text-purple-800">TOTAL</td>
                          <td className="p-2 text-right font-bold text-purple-800">
                            {formatCurrency(grandTotal)}
                          </td>
                          {participants.map((p, pIndex) => {
                            const total = participantTotals.find(t => t.participant.id === p.id)?.total || 0;
                            return (
                              <td key={p.id} style={{ backgroundColor: '#f1e8fe' }} className="p-2 text-center">
                                <div className={`rounded-lg p-1 text-white font-bold ${getParticipantColor(pIndex)}`}>
                                  {formatCurrency(total)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Section: Summary (Left) + Payment Information (Right) */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Summary Statistics Card - LEFT SIDE */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
                    <div className="export-safe-title">
                      <h3 className="text-xl font-bold mb-4 text-left text-purple-600">
                        <span className="inline-flex items-center gap-2">
                          <span>📈</span>
                          <span>Summary</span>
                        </span>
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">{items.filter(i => i.type === "NORMAL").length}</div>
                        <div className="text-sm text-gray-600">Items</div>
                        {items.filter(i => i.type !== "NORMAL").length > 0 && (
                          <div className="text-xs text-yellow-600 mt-1">
                            +{items.filter(i => i.type !== "NORMAL").length} adjustments
                          </div>
                        )}
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <div className="text-2xl font-bold text-indigo-600">{participants.length}</div>
                        <div className="text-sm text-gray-600">Participants</div>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-xl">
                        <div className="text-2xl font-bold text-pink-600">{formatCurrency(grandTotal)}</div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                      </div>
                    </div>
                  </div>

                  {/* Payer Information Card - RIGHT SIDE */}
                  {payer && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-yellow-300 p-6 relative overflow-hidden">
                      {/* Header Row: Payment Information (Left) + PAYER Badge (Right) */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="export-safe-title">
                          <h3 className="text-xl font-bold text-yellow-700">
                            <span className="inline-flex items-center gap-2">
                              <span>💳</span>
                              <span>Payment Information</span>
                            </span>
                          </h3>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          👑 PAYER
                        </div>
                      </div>
                      
                      {/* 1-Column Content Layout */}
                      <div className="space-y-4">
                        {/* 1. Bank Name and Logo */}
                        {payer.bankName && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-3 text-gray-700 font-medium">
                              {payer.bankLogoUrl && (
                                <Image 
                                  src={payer.bankLogoUrl} 
                                  alt={`${payer.bankName} logo`}
                                  width={32} 
                                  height={32} 
                                  className="rounded"
                                />
                              )}
                              <span className="font-bold text-lg text-gray-800">{payer.bankName}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* 2. QR Code */}
                        {payer.qrUrl && (
                          <div className="flex justify-center">
                            <div className="bg-white p-3 rounded-xl shadow-md border-2 border-yellow-300">
                              <Image 
                                src={payer.qrUrl} 
                                alt="Payment QR Code" 
                                width={120} 
                                height={120} 
                                className="rounded-lg"
                              />
                              <p className="text-xs text-gray-600 mt-2 text-center font-medium">Scan to Pay</p>
                            </div>
                          </div>
                        )}
                        
                        {/* 3. Account Holder */}
                        <div className="text-center">
                          <div className="font-bold text-gray-900 text-lg bg-yellow-100 px-3 py-2 rounded-lg inline-block">
                            {payer.accountHolder || payer.displayName}
                          </div>
                        </div>
                        
                        {/* 4. Account Number */}
                        {payer.accountNumber && (
                          <div className="text-center">
                            <div className="text-gray-700 font-medium text-lg">
                              {payer.accountNumber}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm">
                  Generated by SplitBill Pro • {new Date().toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
            </div>

            {/* Action Buttons - Outside the scrollable frame */}
            <div className="flex justify-end gap-3 pt-4 flex-shrink-0 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowSnapshot(false)}>
                Close
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(`/bills/${bill?.id}/snapshot`, '_blank')}
                className="flex items-center gap-2"
              >
                📸 Open Snapshot View
              </Button>
              <Button onClick={handleCopyAsImage} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy as Image
              </Button>
              <Button onClick={handleDownloadPDF} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Item Confirmation Dialog */}
        <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Item</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete this item? This action cannot be undone and will remove all associated splits.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Bill Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Edit Bill Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <BillEditForm
                onSubmit={handleEditFormSubmit}
                isPending={isPending}
                currentBill={{
                  id: bill?.id || '',
                  title: bill?.title || '',
                  description: bill?.description || '',
                  date: bill?.date ? new Date(bill.date) : new Date(),
                  payerId: bill?.payerId || '',
                  status: bill?.status || 'DRAFT',
                  participants: participants.map(p => ({
                    id: p.id,
                    displayName: p.displayName,
                    isPayer: p.isPayer,
                  })),
                  hasItems: items.length > 0,
                  totalAmount: grandTotal,
                }}
                availablePayers={participants.map(p => ({
                  id: p.id,
                  displayName: p.displayName,
                }))}
                onCancel={() => setShowEditDialog(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Participants Management Modal */}
        <Dialog open={showParticipantsModal} onOpenChange={setShowParticipantsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Participants
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                {/* Current Participants */}
                <div>
                  <Label className="text-sm font-medium text-gray-300">Current Participants ({participants.length})</Label>
                  <div className="mt-2 space-y-2">
                    {participants.map((participant, index) => {
                      const colorClass = getParticipantColor(index, participant.isPayer);
                      const total = participantTotals.find(t => t.participant.id === participant.id)?.total || 0;
                      
                      return (
                        <div key={participant.id} className={`flex items-center justify-between p-2 rounded border border-gray-600 ${colorClass.replace('bg-', 'bg-opacity-20 bg-')}`}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={`text-xs ${colorClass}`}>
                                {participant.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-medium text-white">{participant.displayName}</span>
                              {participant.isPayer && (
                                <Badge variant="secondary" className="ml-2 text-xs bg-indigo-700 text-indigo-100">PAYER</Badge>
                              )}
                              <div className="text-xs text-gray-400">{formatCurrency(total)}</div>
                            </div>
                          </div>
                          {!participant.isPayer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const participantIdToRemove = participant.id;
                                
                                // Remove from participants list
                                setParticipants(prev => prev.filter(p => p.id !== participantIdToRemove));
                                
                                // Remove from all item shares with proper cleanup
                                setItems(prev => prev.map(item => ({
                                  ...item,
                                  shares: item.shares.filter(share => share.participantId !== participantIdToRemove)
                                })));
                                
                                toast.success(`Removed ${participant.displayName}`);
                              }}
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add New Participant */}
                <div>
                  <Label className="text-sm font-medium text-gray-300">Add Participant</Label>
                  <div className="mt-2 space-y-2">
                    {/* Search from existing people */}
                    <div>
                      <Label className="text-xs text-gray-400">Search from existing people</Label>
                      <Input
                        placeholder="Search people..."
                        value={participantSearchQuery}
                        onChange={(e) => setParticipantSearchQuery(e.target.value)}
                        className="flex-1 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                      {participantSearchQuery && (
                        <div className="mt-2 max-h-32 overflow-y-auto bg-gray-700 border border-gray-600 rounded">
                          {(Array.isArray(availablePeople) ? availablePeople : [])
                            .filter(person => {
                              const searchTerm = participantSearchQuery.toLowerCase().trim();
                              const personName = person.displayName.toLowerCase();
                              return searchTerm === '' || personName.includes(searchTerm);
                            })
                            .filter(person => !participants.some(p => p.id === person.id))
                            .slice(0, 5)
                            .map(person => (
                              <button
                                key={person.id}
                                onClick={() => {
                                  const newParticipant: Participant = {
                                    id: person.id,
                                    displayName: person.displayName,
                                    isPayer: false,
                                    order: participants.filter(p => !p.isPayer).length,
                                    completed: false,
                                    accountNumber: person.accountNumber,
                                    bankCode: person.bankCode,
                                    accountHolder: person.accountHolder,
                                    qrUrl: person.qrUrl,
                                    bankName: person.bank?.name,
                                    bankLogoUrl: person.bank?.logoUrl,
                                  };
                                  
                                  const nonPayers = participants.filter(p => !p.isPayer);
                                  const payer = participants.find(p => p.isPayer);
                                  const newParticipants = payer ? [...nonPayers, newParticipant, payer] : [...nonPayers, newParticipant];
                                  setParticipants(newParticipants);
                                  
                                  setItems(prev => prev.map(item => ({
                                    ...item,
                                    shares: [...item.shares, {
                                      participantId: newParticipant.id,
                                      include: true,
                                      locked: false,
                                      paid: false,
                                      amount: 0,
                                    }]
                                  })));
                                  
                                  setParticipantSearchQuery('');
                                  toast.success(`Added ${person.displayName}`);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm flex items-center gap-2"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {person.displayName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{person.displayName}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Info Modal */}
        <Dialog open={showPaymentInfoModal} onOpenChange={setShowPaymentInfoModal}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Payment Information
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {payer && (
                <div className="space-y-4">
                  {/* Payer Information */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">💳 Payer Information</h3>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {payer.displayName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{payer.displayName}</h4>
                        {payer.bankName && (
                          <div className="flex items-center gap-2 mt-1">
                            {payer.bankLogoUrl && (
                              <Image 
                                src={payer.bankLogoUrl} 
                                alt={payer.bankName}
                                width={20}
                                height={20}
                                className="rounded"
                              />
                            )}
                            <span className="text-sm text-gray-300">{payer.bankName}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-300">{payer.accountNumber}</span>
                          </div>
                        )}
                        {payer.accountHolder && (
                          <p className="text-sm text-gray-400 mt-1">{payer.accountHolder}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {payer.qrUrl && (
                    <div className="text-center bg-white rounded-lg p-4">
                      <Image
                        src={payer.qrUrl}
                        alt="Payment QR Code"
                        width={200}
                        height={200}
                        className="mx-auto"
                      />
                      <p className="text-xs text-slate-600 mt-2 font-medium">Scan to pay</p>
                    </div>
                  )}

                  {/* Payment Instructions */}
                  <div className="bg-green-900/20 border border-green-600 rounded p-4">
                    <h4 className="text-green-200 font-semibold text-sm mb-2">💡 Payment Instructions:</h4>
                    <div className="text-sm text-green-300 space-y-1">
                      <p>1. Scan QR code or transfer manually to the account above</p>
                      <p>2. Include your name in the transfer note</p>
                      <p>3. Mark your items as "PAID" when transfer is complete</p>
                      <p>4. Total amount to pay: <span className="font-bold">{formatCurrency(grandTotal)}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
