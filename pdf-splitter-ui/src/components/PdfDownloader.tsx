import React from "react";
import { Slice } from "../types";
import { Stack, TextField, Button } from "@mui/material";
import { API_BASE } from "../config";

export type PdfResponse = {
  width: number;
  height: number;
  pages: Array<{ image: string; slices: Slice[] }>;
};

type Props = {
  onDownload?: (data: PdfResponse) => void;
};

function PdfDownloader({ onDownload }: Props) {
  const [url, setUrl] = React.useState<string>("");
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleDownload = () => {
    fetch(`${API_BASE}/download`, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json() as Promise<PdfResponse>)
      .then((data) => onDownload?.(data));
  };

  return (
    <Stack spacing={2} direction="row">
      <TextField
        value={url}
        onChange={handleUrlChange}
        label="PDF URL"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleDownload}>
        Download
      </Button>
    </Stack>
  );
}

export default PdfDownloader;
