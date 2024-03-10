import { Box } from "@mui/material";
import { red } from "@mui/material/colors";
import { OutputSlice } from "../types";

type Props = {
  scale: number;
  filenames: Array<OutputSlice>;
};

function FilenameView({ scale, filenames }: Props) {
  return (
    <Box sx={{ position: "relative" }}>
      {filenames.map((filename, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: "1rem",
            boxSizing: "border-box",
            pr: 1,
            position: "absolute",
            top: filename.top * scale,
            height: filename.height * scale,
            left: 0,
            width: "100%",
            color: red[600],
            fontWeight: 600,
          }}
        >
          {filename.filename}
        </Box>
      ))}
    </Box>
  );
}

export default FilenameView;
