import React from "react";
import Logo from "@/components/Logo";
import Background from "@/components/Background";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative">
      <Background />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Logo size="lg" withText />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
        </div>
        <div className="glass rounded-2xl shadow-card p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}