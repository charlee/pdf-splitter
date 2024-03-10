import React from "react";
import { Slice } from "../types";
import { Stack, TextField, Button } from "@mui/material";
import { downloadPdf } from "../api";

export type PdfResponse = {
  width: number;
  height: number;
  pages: Array<{ image: string; slices: Slice[] }>;
};

type Props = {
  onDownload?: (url: string) => void;
};

function PdfDownloader({ onDownload }: Props) {
  const [url, setUrl] = React.useState<string>("");
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleDownload = () => {
    onDownload?.(url);
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
