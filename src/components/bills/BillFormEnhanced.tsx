"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Users, User, UserPlus, Settings } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillFormEnhancedSchema } from "@/lib/validations";
import { Group, Person } from "@prisma/client/dev";
import * as React from "react";

export type BillFormValues = z.infer<typeof BillFormEnhancedSchema>;

interface BillFormProps {
  onSubmit: (values: BillFormValues) => void;
  isPending: boolean;
  groups: (Group & { people: Person[] })[];
  people: Person[];
  defaultValues?: Partial<BillFormValues>;
}

type ParticipantMode = "GROUP" | "MANUAL" | "MIXED";

export function BillFormEnhanced({ onSubmit, isPending, groups, people, defaultValues }: BillFormProps) {
  const [participantMode, setParticipantMode] = React.useState<ParticipantMode>("GROUP");
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>([]);
  const [quickAddNames, setQuickAddNames] = React.useState<string[]>([]);
  const [newPersonName, setNewPersonName] = React.useState("");

  // Debug logging
  React.useEffect(() => {
    console.log("[BILL_FORM] People prop:", people);
    console.log("[BILL_FORM] Is people array?", Array.isArray(people));
    console.log("[BILL_FORM] Groups prop:", groups);
  }, [people, groups]);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(BillFormEnhancedSchema) as any,
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      groupId: defaultValues?.groupId || "",
      payerId: defaultValues?.payerId || "",
      status: defaultValues?.status || "DRAFT",
      participantMode: "GROUP" as const,
      selectedPeople: [],
      quickAddNames: [],
    },
  });

  // Sync participantMode with form state
  React.useEffect(() => {
    form.setValue("participantMode", participantMode);
    form.setValue("selectedPeople", selectedPeople);
    form.setValue("quickAddNames", quickAddNames);
    
    // Clear groupId validation error when switching to MANUAL mode
    if (participantMode === "MANUAL") {
      form.clearErrors("groupId");
      form.setValue("groupId", "");
    }
  }, [participantMode, selectedPeople, quickAddNames, form]);

  const selectedGroupId = form.watch("groupId");
  
  const membersOfSelectedGroup = React.useMemo(() => {
    if (!selectedGroupId) return [];
    const group = groups.find(g => g.id === selectedGroupId);
    return group?.people || [];
  }, [selectedGroupId, groups]);

  // Get available participants based on mode
  const availableParticipants = React.useMemo(() => {
    switch (participantMode) {
      case "GROUP":
        return membersOfSelectedGroup;
      case "MANUAL":
        return Array.isArray(people) ? people.filter(p => selectedPeople.includes(p.id)) : [];
      case "MIXED":
        const groupMembers = membersOfSelectedGroup;
        const manualPeople = Array.isArray(people) ? people.filter(p => selectedPeople.includes(p.id)) : [];
        // Combine and deduplicate
        const combined = [...groupMembers];
        manualPeople.forEach(person => {
          if (!combined.find(p => p.id === person.id)) {
            combined.push(person);
          }
        });
        return combined;
      default:
        return [];
    }
  }, [participantMode, membersOfSelectedGroup, people, selectedPeople]);

  // Effect to reset payerId if participants change
  React.useEffect(() => {
    const currentPayerId = form.getValues("payerId");
    if (currentPayerId) {
      const isPayerAvailable = availableParticipants.some(p => p.id === currentPayerId);
      if (!isPayerAvailable) {
        form.setValue("payerId", "");
      }
    }
  }, [availableParticipants, form]);

  const handleAddQuickName = () => {
    if (newPersonName.trim()) {
      setQuickAddNames(prev => [...prev, newPersonName.trim()]);
      setNewPersonName("");
    }
  };

  const handleRemoveQuickName = (index: number) => {
    setQuickAddNames(prev => prev.filter((_, i) => i !== index));
  };

  const togglePersonSelection = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSubmit = (values: BillFormValues) => {
    const enhancedValues = {
      ...values,
      participantMode,
      selectedPeople,
      quickAddNames,
    };
    
    console.log("[BILL_FORM] Submitting enhanced values:", enhancedValues);
    console.log("[BILL_FORM] Participant mode:", participantMode);
    console.log("[BILL_FORM] Selected people:", selectedPeople);
    console.log("[BILL_FORM] Quick add names:", quickAddNames);
    onSubmit(enhancedValues);
  };

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Dinner at a fancy restaurant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short description of the bill"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="SETTLED">Settled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Participant Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participant Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <div>
                <Label className="text-base font-semibold">Selection Mode</Label>
                <RadioGroup
                  value={participantMode}
                  onValueChange={(value: ParticipantMode) => setParticipantMode(value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GROUP" id="group" />
                    <Label htmlFor="group" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Use Existing Group
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MANUAL" id="manual" />
                    <Label htmlFor="manual" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Manual Selection
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MIXED" id="mixed" />
                    <Label htmlFor="mixed" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Group + Additional People
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Group Selection */}
              {(participantMode === "GROUP" || participantMode === "MIXED") && (
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Group</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.people.length} members)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Manual People Selection */}
              {(participantMode === "MANUAL" || participantMode === "MIXED") && (
                <div>
                  <Label className="text-sm font-medium">Select Additional People</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {Array.isArray(people) ? people.map((person) => (
                      <div key={person.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedPeople.includes(person.id)}
                          onCheckedChange={() => togglePersonSelection(person.id)}
                        />
                        <Label className="text-sm cursor-pointer" onClick={() => togglePersonSelection(person.id)}>
                          {person.displayName}
                        </Label>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">Loading people...</div>
                    )}
                  </div>
                  {/* Show validation error for selectedPeople */}
                  {form.formState.errors.selectedPeople && (
                    <p className="text-sm font-medium text-destructive mt-1">
                      {form.formState.errors.selectedPeople.message}
                    </p>
                  )}
                </div>
              )}

              {/* Quick Add Names */}
              <div>
                <Label className="text-sm font-medium">Quick Add Names (Draft Mode)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter name..."
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQuickName()}
                    />
                    <Button type="button" onClick={handleAddQuickName} variant="outline">
                      Add
                    </Button>
                  </div>
                  
                  {quickAddNames.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {quickAddNames.map((name, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {name}
                          <button
                            type="button"
                            onClick={() => handleRemoveQuickName(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {quickAddNames.length > 0 && (
                    <p className="text-xs text-yellow-600">
                      ⚠️ These are temporary names. Add proper people details later.
                    </p>
                  )}
                </div>
              </div>

              {/* Current Participants Preview */}
              {availableParticipants.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Current Participants ({availableParticipants.length})</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableParticipants.map((participant) => (
                      <Badge key={participant.id} variant="outline">
                        {participant.displayName}
                      </Badge>
                    ))}
                    {quickAddNames.map((name, index) => (
                      <Badge key={`quick-${index}`} variant="secondary">
                        {name} (temp)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payer Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Payer Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="payerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who paid for this bill?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who paid" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableParticipants.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.displayName}
                            {person.accountNumber && (
                              <span className="text-sm text-gray-500 ml-2">
                                ({person.accountNumber})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending ? "Creating Bill..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
