"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PageHero } from "@/components/layout/PageHero";
import { Plus, RefreshCw } from "lucide-react";

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

async function updatePerson(
  id: string,
  values: Partial<z.infer<typeof PersonCreateSchema>>
) {
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
  const [selectedPerson, setSelectedPerson] =
    useState<PersonWithBank | null>(null);
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

  const handleFormSubmit = async (
    values: z.infer<typeof PersonCreateSchema>
  ) => {
    setIsSubmitting(true);
    try {
      if (selectedPerson) {
        await updatePerson(selectedPerson.id, values);
        toast.success("Person updated successfully!");
      } else {
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

  const handleToggleActive = async (
    person: PersonWithBank,
    active: boolean
  ) => {
    try {
      await updatePerson(person.id, { active });
      toast.success(`Person ${active ? "activated" : "deactivated"}.`);
      fetchPeople();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const stats = useMemo(() => {
    const active = people.filter((person) => person.active).length;
    const withQr = people.filter((person) => !!person.qrUrl).length;
    return [
      {
        label: "Active profiles",
        value: `${active}`,
        helper: `${people.length} total contacts`,
      },
      {
        label: "QR ready",
        value: `${withQr}`,
        helper: "Instant payment enabled",
      },
    ];
  }, [people]);

  return (
    <ClientOnly
      fallback={
        <div className="h-64 rounded-3xl border border-white/10 bg-white/10 shadow-inner shadow-slate-950/50" />
      }
    >
      <HydrationSafe className="space-y-8">
        <PageHero
          eyebrow="People directory"
          title="Keep every payer and participant aligned"
          description="Curate payment-ready profiles with bank routing, QR tokens, and activation statuses. One directory powers every bill, every time."
          accent="amber"
          stats={stats}
          actions={
            <div className="flex items-center gap-3">
              <Button
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
                onClick={() => fetchPeople()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync
              </Button>
              <Button
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
                onClick={() => {
                  const trigger = document.querySelector<HTMLButtonElement>(
                    '[data-person-action="open"]'
                  );
                  trigger?.click();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add person
              </Button>
            </div>
          }
        />

        <div className="frosted-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Input
              placeholder="Search people by name, bank, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400 focus:border-white/40 focus-visible:ring-0"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-64 w-full rounded-3xl border border-white/10 bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          </div>
        )}

        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <p>
              This action cannot be undone. This will permanently delete the
              person "{selectedPerson?.displayName}".
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setSelectedPerson(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="hidden"
              data-person-action="open"
              aria-hidden="true"
            >
              Manage person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPerson ? "Edit Person" : "Add New Person"}
              </DialogTitle>
            </DialogHeader>
            <PersonForm
              onSubmit={handleFormSubmit}
              isPending={isSubmitting}
              banks={banks}
              defaultValues={
                selectedPerson
                  ? {
                      displayName: selectedPerson.displayName,
                      bankCode: selectedPerson.bankCode || undefined,
                      accountNumber: selectedPerson.accountNumber || undefined,
                      accountHolder: selectedPerson.accountHolder || undefined,
                      qrUrl: selectedPerson.qrUrl || undefined,
                      active: selectedPerson.active,
                    }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>

        <Toaster />
      </HydrationSafe>
    </ClientOnly>
  );
}
