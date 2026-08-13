export interface SourceMetadata {
  page?: number;
  page_label?: string;
  total_pages?: number;
  source?: string;
  creator?: string;
  creationdate?: string;
  moddate?: string;
  producer?: string;
  [key: string]: unknown;
}

export interface QuerySource {
  content: string;
  metadata: SourceMetadata;
}

export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  question: string;
  answer: string;
  sources: QuerySource[];
}

export interface IngestResponse {
  [key: string]: unknown;
}
