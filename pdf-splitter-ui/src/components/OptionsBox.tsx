import {
  Box,
  useTheme,
  IconButton,
  Slider,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export type Options = {
  threshold: number;
  skipFirstNPages: number;
  skipFirstNSlices: number;
  skipLastNSlices: number;
};

type Props = {
  options: Options;
  disabled?: boolean;
  onChange?: (options: Options) => void;
};

function OptionsBox({ options, disabled, onChange}: Props) {
  const theme = useTheme();

  const handleThresholdChange = (threshold: number) => {
    onChange?.({ ...options, threshold });
  };
  
  const handleNumberChange = (name: keyof Options) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({ ...options, [name]: Number(e.target.value) });
  }

  return (
    <Box
      sx={{
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
          value={String(options.skipFirstNPages)}
          onChange={handleNumberChange("skipFirstNPages")}
          label="Skip first N pages"
          fullWidth
          size="small"
          disabled={disabled}
        />

        <TextField
          value={String(options.skipFirstNSlices)}
          onChange={handleNumberChange("skipFirstNSlices")}
          label="Skip first N slices"
          fullWidth
          size="small"
          disabled={disabled}
        />

        <TextField
          value={String(options.skipLastNSlices)}
          onChange={handleNumberChange("skipLastNSlices")}
          label="Skip last N slices"
          fullWidth
          size="small"
          disabled={disabled}
        />
      </Stack>
    </Box>
  );
}

export default OptionsBox;
