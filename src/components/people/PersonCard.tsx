"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Bank, Person } from "../../../node_modules/.prisma/client-dev";
import Image from "next/image";
import { Button } from "../ui/button";
import { Pencil, QrCode, Trash2 } from "lucide-react";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

type PersonWithBank = Person & { bank: Bank | null };

interface PersonCardProps {
  person: PersonWithBank;
  onEdit: (person: PersonWithBank) => void;
  onDelete: (person: PersonWithBank) => void;
  onToggleActive: (person: PersonWithBank, active: boolean) => void;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function PersonCard({ person, onEdit, onDelete, onToggleActive }: PersonCardProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <Card className="flex h-full flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 text-slate-100 shadow-[0_30px_80px_-60px_rgba(79,70,229,0.6)] backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-6 p-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={`https://avatar.vercel.sh/${person.displayName}.png`}
                alt={person.displayName}
              />
              <AvatarFallback className="bg-white/10 text-xs font-semibold text-white">
                {getInitials(person.displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-white">
                {person.displayName}
              </CardTitle>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                {person.active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Switch
              checked={person.active}
              onCheckedChange={(checked) => onToggleActive(person, checked)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-400 data-[state=checked]:to-cyan-400"
            />
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300/90">
          {person.bank && (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
              {person.bank.logoUrl && (
                <Image
                  src={person.bank.logoUrl}
                  alt={person.bank.name}
                  width={20}
                  height={20}
                  className="rounded"
                />
              )}
              <span className="font-medium text-white">{person.bank.name}</span>
            </div>
          )}
          {person.accountNumber && (
            <p className="text-xs text-slate-300/80">
              Account:{" "}
              <span className="font-mono text-slate-200">
                {person.accountNumber}
              </span>
            </p>
          )}
          {person.accountHolder && (
            <p className="text-xs text-slate-300/80">
              Holder: {person.accountHolder}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-6 flex items-center justify-between gap-4 p-0">
        <div className="text-[0.7rem] uppercase tracking-[0.35em] text-slate-500">
          Payment ready
        </div>
        <div className="flex items-center gap-2">
          {person.qrUrl && (
            <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs text-white transition hover:border-white/35 hover:bg-white/15">
                  <QrCode className="mr-2 h-3 w-3" />
                  QR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm border-white/10 bg-slate-950/90 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle>Payment QR Code</DialogTitle>
                </DialogHeader>
                <img
                  src={person.qrUrl}
                  alt="QR Code"
                  className="mx-auto max-h-[360px] w-full max-w-xs rounded-2xl border border-white/10 bg-white p-4"
                />
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(person)}
            className="rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(person)}
            className="rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white hover:brightness-110"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
