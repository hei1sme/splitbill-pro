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
    <Card className="glass-card w-[320px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://avatar.vercel.sh/${person.displayName}.png`} alt={person.displayName} />
              <AvatarFallback>{getInitials(person.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{person.displayName}</CardTitle>
            </div>
          </div>
          <Switch
            checked={person.active}
            onCheckedChange={(checked) => onToggleActive(person, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          {person.bank && (
            <div className="flex items-center gap-2">
              {person.bank.logoUrl && <Image src={person.bank.logoUrl} alt={person.bank.name} width={24} height={24} />}
              <span>{person.bank.name}</span>
            </div>
          )}
          {person.accountNumber && <p className="text-sm text-muted-foreground">{person.accountNumber}</p>}
          {person.accountHolder && <p className="text-sm text-muted-foreground">{person.accountHolder}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {person.qrUrl && (
            <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <QrCode className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Payment QR Code</DialogTitle>
                </DialogHeader>
                <Image src={person.qrUrl} alt="QR Code" width={400} height={400} className="mx-auto" />
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" size="icon" onClick={() => onEdit(person)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(person)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
