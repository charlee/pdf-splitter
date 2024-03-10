import {
  Box,
  Button,
  useTheme,
  IconButton,
  Slider,
  Stack,
  Typography,
  TextField,
  Link,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export type Options = {
  threshold: number;
  path: string;
  filename: string;
  paddingX: number;
  paddingY: number;
};

type Props = {
  options: Options;
  disabled?: boolean;
  onChange?: (options: Options) => void;
  onSplit?: () => void;
  downloadUrl?: string;
};

function OptionsBox({ options, disabled, onChange, onSplit, downloadUrl }: Props) {
  const theme = useTheme();

  const handleThresholdChange = (threshold: number) => {
    onChange?.({ ...options, threshold });
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, path: e.target.value });
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, filename: e.target.value });
  };

  const handlePaddingXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, paddingX: Number(e.target.value) });
  };

  const handlePaddingYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, paddingY: Number(e.target.value) });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: 48,
        top: "20vh",
        width: 200,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        p: 2,
      }}
    >
      <Stack direction="column" spacing={2}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Threshold
          </Typography>
          <Stack direction="row" sx={{ alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={() =>
                handleThresholdChange(
                  options.threshold > 0
                    ? options.threshold - 1
                    : options.threshold
                )
              }
            >
              <Remove />
            </IconButton>
            <Slider
              value={options.threshold}
              onChange={(e, v) => handleThresholdChange(v as number)}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="on"
              sx={{ flex: 1 }}
              disabled={disabled}
            />
            <IconButton
              size="small"
              onClick={() => handleThresholdChange(options.threshold + 1)}
            >
              <Add />
            </IconButton>
          </Stack>
        </Box>

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
          onChange={handlePaddingXChange}
          label="Padding X"
          size="small"
          fullWidth
          disabled={disabled}
        />
        <TextField
          value={String(options.paddingY)}
          onChange={handlePaddingYChange}
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

export default OptionsBox;
