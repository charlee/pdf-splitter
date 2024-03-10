import React from "react";
import {
  Box,
  useTheme,
  Stack,
  AppBar,
  Container,
  Toolbar,
  Typography,
  TextField,
  Button,
  Slider,
  IconButton,
} from "@mui/material";
import { API_BASE } from "./config";
import useResizeObserver from "use-resize-observer";
import { Add, Remove } from "@mui/icons-material";
import { red } from "@mui/material/colors";
import OptionsBox, { Options } from "./components/OptionsBox";

type Slice = {
  height: number;
  is_empty: boolean;
};

function mergeSmallSlices(slices: Array<Slice>, threshold: number) {
  const newSlices = [];
  for (let i = 0; i < slices.length; i++) {
    if (i === 0) {
      newSlices.push({ ...slices[i] });
      continue;
    }

    if (slices[i].is_empty && slices[i].height < threshold) {
      newSlices[newSlices.length - 1].height +=
        slices[i].height + slices[i + 1].height;
      i = i + 1;
      continue;
    }

    newSlices.push({ ...slices[i] });
  }
  return newSlices;
}

function App() {
  const theme = useTheme();
  const [url, setUrl] = React.useState<string>("");
  const [pages, setPages] = React.useState<string[]>([]);
  const [slices, setSlices] = React.useState<Slice[][]>([]);
  const [mergedSlices, setMergedSlices] = React.useState<Slice[][]>([]);
  const [dimension, setDimension] = React.useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [options, setOptions] = React.useState<Options>({ threshold: 50 });

  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();

  React.useEffect(() => {
    setMergedSlices(slices.map((s) => mergeSmallSlices(s, options.threshold)));
  }, [options.threshold]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleToggleSliceEmpty = (i: number, j: number) => () => {
    setMergedSlices((prev) => {
      const newSlices = [...prev];
      newSlices[i] = [...newSlices[i]];
      newSlices[i][j] = {
        ...newSlices[i][j],
        is_empty: !newSlices[i][j].is_empty,
      };
      return newSlices;
    });
  };

  const handleDownload = () => {
    fetch(`${API_BASE}/download`, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json() as Promise<{
          width: number;
          height: number;
          pages: Array<{ image: string; slices: Slice[] }>;
        }>;
      })
      .then((data) => {
        setPages(data.pages.map((d) => d.image));
        setSlices(data.pages.map((d) => d.slices));
        setMergedSlices(
          data.pages.map((d) => mergeSmallSlices(d.slices, options.threshold))
        );
        setDimension({ width: data.width, height: data.height });
      });
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">PDF Splitter</Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Container maxWidth="lg">
          <Toolbar />
          <Stack spacing={2} direction="row">
            <TextField
              value={url}
              onChange={handleUrlChange}
              label="PDF URL"
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
            >
              Download
            </Button>
          </Stack>

          <Box
            mt={4}
            sx={{ backgroundColor: "#888", p: 4, border: "1px solid #444" }}
          >
            <Box ref={ref}>
              {pages.map((p, i) => (
                <React.Fragment key={p}>
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", mb: 2 }}
                  >
                    Page {i + 1}
                  </Typography>
                  <Box key={i} sx={{ position: "relative" }}>
                    <img
                      src={`data:image/png;base64,${p}`}
                      alt={`Page ${i + 1} of the PDF`}
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
                      {mergedSlices[i].map((s, j) => (
                        <Box
                          role="button"
                          key={j}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            left: 0,
                            height: s.height * (width / dimension.width),
                            backgroundColor: s.is_empty
                              ? "rgba(0, 0, 0, 0.25)"
                              : "transparent",
                          }}
                          onClick={handleToggleSliceEmpty(i, j)}
                        >
                          <Typography
                            variant="body2"
                            sx={{ ml: 1, color: red[600] }}
                          >
                            {s.height}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Container>
        <OptionsBox options={options} onChange={setOptions} />
      </main>
    </Box>
  );
}

export default App;
