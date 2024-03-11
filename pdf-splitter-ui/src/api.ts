import { API_BASE } from "./config";
import { Slice, OutputSlice } from "./types";

function post<T>(url: string, body: any): Promise<T> {
  return fetch(`${API_BASE}/api/${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json() as T);
}

export type PreviewPdfResponse = {
  width: number;
  height: number;
  pages: Array<{ image: string; slices: Slice[] }>;
};

export function previewPdf(url: string) {
  return post<PreviewPdfResponse>("preview", { url });
}

export type SplitPdfResponse = {
  download_url: string;
};

export function splitPdf(
  url: string,
  pdf_filename: string,
  outputs: OutputSlice[][],
  paddingX: number,
  paddingY: number
) {
  return post<SplitPdfResponse>("split", { url, outputs, paddingX, paddingY, pdf_filename });
}
