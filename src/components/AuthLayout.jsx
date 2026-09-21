import React from "react";
import Logo from "@/components/Logo";
import Background from "@/components/Background";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <Background />
      <div className="w-full max-w-md relative z-10">
        {/* Logo — centered, prominent */}
        <div className="flex flex-col items-center mb-9">
          <Logo size="lg" withText />
        </div>
        {/* Title + subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
        </div>
        {/* Premium glass card */}
        <div className="relative rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 shadow-float p-8">
          {/* Subtle top luminous edge */}
          <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}