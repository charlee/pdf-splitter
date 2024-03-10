import {
  Box,
  useTheme,
  IconButton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export type Options = {
  threshold: number;
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
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        Threshold
      </Typography>
      <Stack direction="row" sx={{ alignItems: "center" }}>
        <IconButton
          size="small"
          onClick={() =>
            handleThresholdChange(
              options.threshold > 0 ? options.threshold - 1 : options.threshold
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
  );
}

export default OptionsBox;
