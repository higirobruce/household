"use client";

import { Toaster as Sonner, toast } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="system"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        },
      }}
    />
  );
}

export { toast };
