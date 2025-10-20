"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SideNavbar from "@/components/SideNavbar";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useState } from "react";
import { GlobalContextProvider } from "./GlobalContex";
import AlertNotification from "@/components/AlertNotification";
import LoadingBar from "@/components/LoadingBar";
import { usePathname } from "next/navigation";
const Plalyer = dynamic(() => import("@/components/Player"), { ssr: false });

const ClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const currentPath = usePathname();
  const hideSideNavbarPaths = ["/login", "/signup"];
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!window.navigator.onLine);
    window.addEventListener("offline", () => {
      setIsOffline(true);
    });
    window.addEventListener("online", () => {
      setIsOffline(false);
    });
  }, []);

  return (
    <GlobalContextProvider>
      <main className="container relative">
        <Suspense>
          <LoadingBar />
        </Suspense>
        <div className="absolute top-0 w-full h-48 -z-10 flex items-center justify-end rounded-full">
          <span className="bg-custom_gradient block w-3/4 h-full blur-3xl" />
        </div>
        {isOffline ? (
          <div
            className={`${
              !hideSideNavbarPaths.includes(currentPath)
                ? "inner-container"
                : ""
            } !my-0 bg-[#b22222] text-center`}
          >
            <p className="text-white text-sm py-0.5">
              ⚠️No Internet Connection !
            </p>
          </div>
        ) : null}
        {!hideSideNavbarPaths.includes(currentPath) ? <Navbar /> : null}
        {!hideSideNavbarPaths.includes(currentPath) ? <SideNavbar /> : null}
        {children}
        {!hideSideNavbarPaths.includes(currentPath) ? (
          <AlertNotification />
        ) : null}
        {!hideSideNavbarPaths.includes(currentPath) ? <Plalyer /> : null}
        {!hideSideNavbarPaths.includes(currentPath) ? <Footer /> : null}
      </main>
    </GlobalContextProvider>
  );
};

export default ClientLayout;
