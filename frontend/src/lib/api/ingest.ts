import { apiClient } from "./client";
import type { IngestResponse } from "@/types/rag";

export function validatePdf(file: File): string | null {
  const isPdfName = file.name.toLowerCase().endsWith(".pdf");
  const isPdfMime = !file.type || file.type === "application/pdf";
  if (!isPdfName || !isPdfMime) return "Only PDF documents are supported.";
  if (file.size === 0) return "This file appears to be empty.";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export async function ingestDocument(file: File): Promise<IngestResponse> {
  const form = new FormData();
  form.append("file", file, file.name);
  return apiClient.postForm<IngestResponse>("/ingest", form);
}
