import { Box, Typography, useTheme } from "@mui/material";
import { red } from "@mui/material/colors";
import { Slice } from "../types";

type Props = {
  image: string;
  slices: Slice[];
  onSlicesChange?: (slices: Slice[]) => void;
  scale: number;
};

function PdfPageViewer({ image, slices, scale, onSlicesChange }: Props) {
  const handleToggleSliceEmpty = (i: number) => {
    return () => {
      const newSlices = [...slices];
      newSlices[i] = { ...newSlices[i], is_empty: !newSlices[i].is_empty };
      onSlicesChange?.(newSlices);
    };
  };

  return (
    <Box sx={{ position: "relative" }}>
      <img
        src={`data:image/png;base64,${image}`}
        alt={`Page the PDF`}
        width="100%"
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        {slices.map((slice, idx) => (
          <Box
            role="button"
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              left: 0,
              boxSizing: "border-box",
              height: slice.height * scale,
              backgroundColor: slice.is_empty
                ? "rgba(0, 0, 0, 0.25)"
                : "transparent",
            }}
            onClick={handleToggleSliceEmpty(idx)}
          >
            <Typography
              variant="body2"
              sx={{ ml: 1, color: red[600], fontSize: "0.75em" }}
            >
              {slice.height}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default PdfPageViewer;
