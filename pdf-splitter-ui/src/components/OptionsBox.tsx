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
  path: string;
  filename: string;
};

type Props = {
  options: Options;
  onChange?: (options: Options) => void;
};

function OptionsBox({ options, onChange }: Props) {
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

  return (
    <Box
      sx={{
        position: "fixed",
        right: 48,
        top: "33vh",
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
        />
        <TextField
          value={options.filename}
          onChange={handleFilenameChange}
          label="Filename"
          size="small"
          fullWidth
        />
      </Stack>
    </Box>
  );
}

export default OptionsBox;
