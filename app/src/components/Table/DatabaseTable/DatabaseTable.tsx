import React from "react";
import { DataTable } from "./data-table";
import { ArrowUpDown, CircleDot } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { dummy1, dummy2, dummy3 } from "./dummy";
import { useDatabaseStore } from "@/store/databaseStore";

const generateColumns = (data: any[]) => {
  if (data.length === 0) return [];

  const firstItem = data[0];
  return [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...Object.keys(firstItem).map((key) => ({
      accessorKey: key,
      header: ({ column }: { column: any }) => {
        return (
          <div
            className="cursor-pointer hover:text-gray-700 flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const value = row.getValue(key);

        if (key === "status") {
          const statusStyles = {
            Success: "bg-green-100 text-green-800",
            Declined: "bg-red-100 text-red-800",
            Processing: "bg-[#F5F5F5] text-[#414651]",
          };
          return (
            <div
              className={`inline-flex gap-1 items-center px-2 py-1 rounded-full text-xs font-medium ${
                statusStyles[value as keyof typeof statusStyles] || ""
              }`}
            >
              <span>
                <CircleDot size={12} />
              </span>
              {value}
            </div>
          );
        }

        if (key === "order amount") {
          return <div>${value.toLocaleString()}</div>;
        }

        return <div>{value}</div>;
      },
    })),
  ];
};

const DatabaseTable = () => {
  const [whitelistId, databaseId] = window.location.pathname
    .split("/")
    .filter(Boolean);

  const data =
    databaseId === "9qQVcJyg3Sm1VXz6X2RQv3Lwgz9KvmN8KbgLBzQPcPU1"
      ? dummy1
      : dummy3;
  const dynamicColumns = generateColumns(data);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={dynamicColumns} data={data} />
    </div>
  );
};

export default DatabaseTable;
