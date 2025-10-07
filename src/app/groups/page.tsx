import { GroupsDataTable } from "@/components/groups/GroupsDataTable";

export default function GroupsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Groups Management</h1>
      <GroupsDataTable />
    </div>
  );
}
