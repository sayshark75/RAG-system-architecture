import { apiClient } from "./client";
import type { QueryRequest, QueryResponse } from "@/types/rag";

export async function askQuestion(question: string): Promise<QueryResponse> {
  const body: QueryRequest = { question };
  const data = await apiClient.postJson<QueryResponse>("/query", body);
  return {
    question: data?.question ?? question,
    answer: data?.answer ?? "",
    sources: Array.isArray(data?.sources) ? data.sources : [],
  };
}
