import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./routes/routes.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />

      <Toaster
        position="top-right"
        gutter={16}
        containerStyle={{
          top: 80,
          right: 24,
        }}
        toastOptions={{
          // Base style - Sky Blue
          style: {
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)", // sky-500 to sky-600
            color: "#ffffff",
            borderRadius: "16px",
            padding: "16px 20px",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "1.5",
            boxShadow: `
        0 20px 40px -8px rgba(14, 165, 233, 0.3),
        0 8px 16px -4px rgba(14, 165, 233, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1)
      `,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            maxWidth: "420px",
            minWidth: "320px",
          },

          duration: 4000,

          // Success - Cyan
          success: {
            duration: 5000,
            iconTheme: {
              primary: "#22d3ee", // cyan-400
              secondary: "#ffffff",
            },
            style: {
              background: "linear-gradient(135deg, #06b6d4, #0891b2)", // cyan-500 to cyan-600
              boxShadow: `
          0 20px 40px -8px rgba(6, 182, 212, 0.3),
          0 8px 16px -4px rgba(6, 182, 212, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
          },

          // Error - Red
          error: {
            duration: 6000,
            iconTheme: {
              primary: "#f87171", // red-400
              secondary: "#ffffff",
            },
            style: {
              background: "linear-gradient(135deg, #ef4444, #dc2626)", // red-500 to red-600
              boxShadow: `
          0 20px 40px -8px rgba(239, 68, 68, 0.3),
          0 8px 16px -4px rgba(239, 68, 68, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
          },

          // Loading - Deep Blue
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: "#ffffff",
              secondary: "#0ea5e9", // sky-500
            },
            style: {
              background: "linear-gradient(135deg, #0ea5e9, #0369a1)", // sky-500 to sky-700
              boxShadow: `
          0 20px 40px -8px rgba(14, 165, 233, 0.3),
          0 8px 16px -4px rgba(14, 165, 233, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
              border: "1px solid rgba(255, 255, 255, 0.15)",
            },
          },

          // Custom/Info - Light Blue
          custom: {
            duration: 4000,
            iconTheme: {
              primary: "#7dd3fc", // sky-300
              secondary: "#0c4a6e", // sky-900
            },
            style: {
              background: "linear-gradient(135deg, #7dd3fc, #38bdf8)", // sky-300 to sky-400
              color: "#0c4a6e", // sky-900 for contrast
              boxShadow: `
          0 20px 40px -8px rgba(125, 211, 252, 0.3),
          0 8px 16px -4px rgba(125, 211, 252, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
              border: "1px solid rgba(255, 255, 255, 0.25)",
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>
);
