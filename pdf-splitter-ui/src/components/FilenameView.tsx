import { Box } from "@mui/material";
import { red, grey } from "@mui/material/colors";
import { OutputSlice } from "../types";
import { IconButton } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import React from "react";

type Props = {
  scale: number;
  outputSlices: Array<OutputSlice>;
  filenames: Array<string>;
  onLink?: (idx: number) => void;
};

function FilenameView({ scale, outputSlices, filenames, onLink }: Props) {

  // link a slice with previous
  const handleLinkClick = (idx: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    onLink?.(idx);
  }

  return (
    <Box sx={{ position: "relative" }}>
      {outputSlices.map((s, idx) => (
      <Box
          key={idx}
          sx={{
            boxSizing: "border-box",
            pr: 1,
            position: "absolute",
            top: s.top * scale,
            height: s.height * scale,
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
      >
        <Box
          sx={{
            fontSize: "1rem",
            color: red[600],
            fontWeight: 600,
          }}
        >
          {filenames[idx]}
        </Box>
        <IconButton size="small" onClick={handleLinkClick(idx)} >
          {s.link ? <LinkIcon sx={{ color: red[600] }} /> : <LinkOffIcon sx={{ color: grey[400] }}/>}
        </IconButton>
        </Box>
      ))}
    </Box>
  );
}

export default FilenameView;
