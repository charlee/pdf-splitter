import React from "react";
import {
  Box,
  Button,
  useTheme,
  Stack,
  TextField,
  Link,
} from "@mui/material";

export type ExportOptions = {
  path: string;
  filename: string;
  paddingX: number;
  paddingY: number;
};

type Props = {
  options: ExportOptions;
  disabled?: boolean;
  onChange?: (options: ExportOptions) => void;
  onSplit?: () => void;
  downloadUrl?: string;
};

function ExportBox({
  options,
  disabled,
  onChange,
  onSplit,
  downloadUrl,
}: Props) {
  const theme = useTheme();

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, path: e.target.value });
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, filename: e.target.value });
  };

  const handleNumberChange =
    (name: keyof ExportOptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...options, [name]: Number(e.target.value) });
    };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        p: 2,
        mt: 2,
      }}
    >
      <Stack direction="column" spacing={2}>
        <TextField
          value={options.path}
          onChange={handlePathChange}
          label="Path"
          fullWidth
          size="small"
          disabled={disabled}
        />
        <TextField
          value={options.filename}
          onChange={handleFilenameChange}
          label="Filename"
          size="small"
          fullWidth
          disabled={disabled}
        />
        <TextField
          value={String(options.paddingX)}
          onChange={handleNumberChange("paddingX")}
          label="Padding X"
          size="small"
          fullWidth
          disabled={disabled}
        />
        <TextField
          value={String(options.paddingY)}
          onChange={handleNumberChange("paddingY")}
          label="Padding X"
          size="small"
          fullWidth
          disabled={disabled}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={onSplit}
          disabled={disabled}
        >
          Split
        </Button>
        {downloadUrl && <Link href={downloadUrl}>Download</Link>}
      </Stack>
    </Box>
  );
}

export default ExportBox;
