import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

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
import { Database, Wallet } from "lucide-react";

const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: GalleryVerticalEnd,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: AudioWaveform,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: Command,
  //     plan: "Free",
  //   },
  // ],
  whitelist: [
    {
      title: "Whitelist1",
      url: "/whitelistPdaAccount1",
      icon: Wallet,
      isActive: true,
      items: [
        {
          title: "Member1",
          subTitle: "0xasjfl;sdjfklasj;ljl",
          url: "/whitelistPdaAccount1",
        },
        {
          title: "Member2",
          subTitle: "0xasjfl;sdjfklasj;ljl",
          url: "/whitelistPdaAccount1",
        },
        {
          title: "Member3",
          subTitle: "0xasjfl;sdjfklasj;ljl",
          url: "/whitelistPdaAccount1",
        },
      ],
    },
    {
      title: "Whitelist2",
      url: "/whitelistPdaAccount2",
      icon: Wallet,
      isActive: true,
      items: [
        {
          title: "Member1",
          subTitle: "0xasjfl;sdjfklasj;ljl",
          url: "/whitelistPdaAccount2",
        },
        {
          title: "Member2",
          subTitle: "0xasjfl;sdjfklasj;ljl",
          url: "/whitelistPdaAccount2",
        },
        {
          title: "Member3",
          subTitle: "0xasjfl;sdjfklasj;ljl",
          url: "/whitelistPdaAccount2",
        },
      ],
    },
  ],
  database: [
    {
      title: "Whitelist1",
      url: "",
      icon: Database,
      isActive: true,
      items: [
        {
          title: "Data1",
          url: "/whitelistPdaAccount1/1",
        },
        {
          title: "Data2",
          url: "/whitelistPdaAccount1/2",
        },
        {
          title: "Data3",
          url: "/whitelistPdaAccount1/3",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
};

const Dashboard = () => {
  const [category, id] = window.location.pathname.split("/").filter(Boolean);

  const [isShowWhitelist, setIsShowWhitelist] = useState<boolean>(
    category == "whitelist"
  );

  // data fetch

  return (
    <div className="h-[90vh]">
      <SidebarProvider>
        <AppSidebar
          data={data}
          isShowWhitelist={isShowWhitelist}
          setIsShowWhitelist={setIsShowWhitelist}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">{category}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{id}</BreadcrumbPage>
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
                  element={<DatabaseTable />}
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
