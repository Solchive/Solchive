import React from "react";

import { dummy1 } from "../DatabaseTable/dummy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Download, Filter } from "lucide-react";

const RawDataTable = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="h-[70vh] overflow-auto py-10 px-8">
      <div className="flex justify-between items-center py-4">
        {/* header-left */}
        <div className="flex gap-2">
          <Input placeholder="Search on table" className="max-w-sm" />
          <Button variant="defaultWhite" className="ml-auto">
            View
          </Button>
        </div>
        {/* header-right */}
        <div className="flex gap-2">
          <Button
            variant="defaultWhite"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              const currentRawData = params.get("rawData");
              if (currentRawData === "true") {
                params.set("rawData", "false");
              } else {
                params.set("rawData", "true");
              }
              nav(`?${params.toString()}`);
            }}
          >
            <Calendar />
            RAW data
          </Button>
          <Button variant="defaultWhite">
            <Calendar />
            Mar 9, 2025 - Apr 30, 2025
          </Button>
          <Button variant="defaultWhite">
            <Filter />
            Filters
          </Button>
          <Button variant="defaultWhite">
            <Download />
            Download Data
          </Button>
          {/* <Button variant="defaultWhite">
            <img src={solanaLogo} className="h-full" />
            Pool : 0.85 Sol
          </Button> */}
        </div>
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        <code>{JSON.stringify(dummy1, null, 2)}</code>
      </pre>
    </div>
  );
};

export default RawDataTable;
