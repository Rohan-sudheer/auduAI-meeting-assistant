import { Outlet } from "react-router-dom";

import { Background } from "./Background";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen">
      <Background />
      <Header />
      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
