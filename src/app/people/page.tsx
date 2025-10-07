"use client";

import { useEffect, useState } from "react";
import { PersonCard } from "@/components/people/PersonCard";
import { PersonForm } from "@/components/people/PersonForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { PersonCreateSchema } from "@/lib/validations";
import { Bank, Person } from "../../../node_modules/.prisma/client-dev";
import { z } from "zod";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { ClientOnly } from "@/components/ui/client-only";
import { HydrationSafe } from "@/components/ui/hydration-safe";

type PersonWithBank = Person & { bank: Bank | null };

async function createPerson(values: z.infer<typeof PersonCreateSchema>) {
  const res = await fetch("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  return res.json();
}

async function updatePerson(id: string, values: Partial<z.infer<typeof PersonCreateSchema>>) {
  const res = await fetch(`/api/people/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  return res.json();
}

async function deletePerson(id: string) {
  const res = await fetch(`/api/people/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  return res.json();
}

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonWithBank[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithBank | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/people?search=${debouncedSearchTerm}`);
      const result = await res.json();
      if (result.success) {
        setPeople(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch people", error);
      toast.error("Failed to fetch people.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch("/api/banks");
      const result = await res.json();
      if (result.success) {
        setBanks(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch banks", error);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleFormSubmit = async (values: z.infer<typeof PersonCreateSchema>) => {
    console.log('Form submitted with values:', values);
    setIsSubmitting(true);
    try {
      if (selectedPerson) {
        console.log('Updating person:', selectedPerson.id, 'with data:', values);
        await updatePerson(selectedPerson.id, values);
        toast.success("Person updated successfully!");
      } else {
        console.log('Creating new person with data:', values);
        await createPerson(values);
        toast.success("Person created successfully!");
      }
      fetchPeople();
      setIsFormOpen(false);
      setSelectedPerson(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPerson) return;
    setIsSubmitting(true);
    try {
      await deletePerson(selectedPerson.id);
      toast.success("Person deleted successfully!");
      fetchPeople();
      setIsDeleteConfirmOpen(false);
      setSelectedPerson(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (person: PersonWithBank, active: boolean) => {
    try {
      await updatePerson(person.id, { active });
      toast.success(`Person ${active ? 'activated' : 'deactivated'}.`);
      fetchPeople();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <ClientOnly fallback={<div className="container mx-auto py-10" suppressHydrationWarning><div className="h-64 bg-muted animate-pulse rounded-md"></div></div>}>
      <HydrationSafe className="container mx-auto py-10">
        <HydrationSafe className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">People Directory</h1>
            <p className="text-muted-foreground mt-2">
              Manage your contacts for bill splitting. Bank details are optional but enable QR payments.
            </p>
          </div>
          <HydrationSafe className="flex gap-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setSelectedPerson(null);
          }}>
            <DialogTrigger asChild>
              <Button>Add Person</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedPerson ? "Edit Person" : "Add New Person"}</DialogTitle>
              </DialogHeader>
              <PersonForm 
                onSubmit={handleFormSubmit} 
                isPending={isSubmitting} 
                banks={banks} 
                defaultValues={selectedPerson ? {
                  displayName: selectedPerson.displayName,
                  bankCode: selectedPerson.bankCode || undefined,
                  accountNumber: selectedPerson.accountNumber || undefined, 
                  accountHolder: selectedPerson.accountHolder || undefined,
                  qrUrl: selectedPerson.qrUrl || undefined,
                  active: selectedPerson.active,
                } : undefined} 
              />
            </DialogContent>
          </Dialog>
        </HydrationSafe>
      </HydrationSafe>

      {loading ? (
        <HydrationSafe className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </HydrationSafe>
      ) : (
        <HydrationSafe className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onEdit={(p) => {
                setSelectedPerson(p);
                setIsFormOpen(true);
              }}
              onDelete={(p) => {
                setSelectedPerson(p);
                setIsDeleteConfirmOpen(true);
              }}
              onToggleActive={handleToggleActive}
            />
          ))}
        </HydrationSafe>
      )}

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>
            This action cannot be undone. This will permanently delete the person
            "{selectedPerson?.displayName}".
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </HydrationSafe>
    </ClientOnly>
  );
}
