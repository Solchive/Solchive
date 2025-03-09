import React, { useEffect, useState } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DatabaseTable from "../Table/DatabaseTable/DatabaseTable";
import { useWhitelistStore } from "@/store/whitelistStore";
import { useDatabaseStore } from "@/store/databaseStore";
import RawDataTable from "../Table/RawDataTable/RawDataTable";

const Dashboard = () => {
  const [whitelistId, databaseId] = window.location.pathname
    .split("/")
    .filter(Boolean);
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const currentRawData = params.get("rawData");

  const [isShowWhitelist, setIsShowWhitelist] = useState<boolean>(false);

  const { whitelists, selectedWhitelist, selectWhitelist, fetchWhitelists } =
    useWhitelistStore();
  console.log("whitelist nav", whitelists);

  const { databases, fetchDatabases } = useDatabaseStore();
  console.log("database nav", databases);
  useEffect(() => {
    fetchWhitelists;
    fetchDatabases();
  }, [fetchWhitelists, fetchDatabases]);

  useEffect(() => {
    fetchWhitelists();
    fetchDatabases();
  }, [window.location.pathname]);

  return (
    <div className="h-[90vh]">
      <SidebarProvider>
        <AppSidebar
          data={{
            whitelist: whitelists,
            database: databases,
          }}
          isShowWhitelist={isShowWhitelist}
          setIsShowWhitelist={setIsShowWhitelist}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">{whitelistId}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{databaseId}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid border">
              <Routes>
                {/* <Route path="/whitelist/:id" element={<WhitelistTable />} /> */}
                <Route
                  path="/:whitelistId/:databaseId"
                  element={
                    currentRawData === "true" ? (
                      <RawDataTable />
                    ) : (
                      <DatabaseTable />
                    )
                  }
                />
              </Routes>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
