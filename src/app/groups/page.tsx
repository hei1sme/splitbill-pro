"use client";

import { GroupsDataTable } from "@/components/groups/GroupsDataTable";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function GroupsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Roster orchestration"
        title="Groups, crews, and companion workflows"
        description="Segment your bill participants into reusable teams. Launch bills faster by auto-loading curated rosters and their payment preferences."
        accent="rose"
        actions={
          <Button
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
            onClick={() => {
              const trigger = document.querySelector<HTMLButtonElement>(
                '[data-group-action="open"]'
              );
              trigger?.click();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New group
          </Button>
        }
      />

      <div className="frosted-card p-6">
        <GroupsDataTable />
      </div>
    </div>
  );
}
