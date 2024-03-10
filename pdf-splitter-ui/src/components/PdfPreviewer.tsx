import React from "react";
import { Slice } from "../types";
import { Stack, TextField, Button } from "@mui/material";
import { previewPdf } from "../api";

export type PdfResponse = {
  width: number;
  height: number;
  pages: Array<{ image: string; slices: Slice[] }>;
};

type Props = {
  onPreview?: (url: string) => void;
  isLoading?: boolean;
};

function PdfPreviewer({ onPreview, isLoading }: Props) {
  const [url, setUrl] = React.useState<string>("");
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handlePreview = () => {
    onPreview?.(url);
  };

  return (
    <Stack spacing={2} direction="row">
      <TextField
        value={url}
        onChange={handleUrlChange}
        label="PDF URL"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handlePreview} disabled={isLoading}>
        {isLoading ? "Loading..." : "Preview"}
      </Button>
    </Stack>
  );
}

export default PdfPreviewer;
