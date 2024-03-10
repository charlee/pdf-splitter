import { API_BASE } from "./config";
import { Slice, OutputSlice } from "./types";

function post<T>(url: string, body: any): Promise<T> {
  return fetch(`${API_BASE}/${url}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json() as T);
}

export type DownloadPdfResponse = {
  width: number;
  height: number;
  pages: Array<{ image: string; slices: Slice[] }>;
};

export function downloadPdf(url: string) {
  return post<DownloadPdfResponse>("download", { url });
}

export type SplitPdfResponse = {
  output_url: string;
};

export function splitPdf(
  url: string,
  outputs: OutputSlice[][],
  paddingX: number,
  paddingY: number
) {
  return post<SplitPdfResponse>("split", { url, outputs, paddingX, paddingY });
}
