import React from "react";
import { Box, AppBar, Container, Toolbar, Typography } from "@mui/material";
import useResizeObserver from "use-resize-observer";
import OptionsBox, { Options } from "./components/OptionsBox";
import PdfPageViewer from "./components/PdfPageViewer";
import PdfDownloader, { PdfResponse } from "./components/PdfDownloader";
import { Slice } from "./types";
import { downloadPdf, splitPdf } from "./api";

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

function calculateFilenamePositions(
  slices: Slice[][],
  path: string,
  filename: string
) {
  const positions = [];
  let n = 0;
  for (let i = 0; i < slices.length; i++) {
    const pagePositions = [];
    for (let j = 0; j < slices[i].length; j++) {
      if (!slices[i][j].is_empty) {
        // if previous slice is non-empty, merge the filename with the previous slice
        if (j > 0 && !slices[i][j - 1].is_empty) {
          pagePositions[pagePositions.length - 1].height += slices[i][j].height;
          continue;
        }

        n += 1;
        pagePositions.push({
          top: slices[i].slice(0, j).reduce((acc, s) => acc + s.height, 0),
          height: slices[i][j].height,
          filename: `${path}/${filename.replace("{{n}}", n.toString())}`,
        });
      }
    }
    positions.push(pagePositions);
  }

  return positions;
}

function App() {
  const [pdfUrl, setPdfUrl] = React.useState<string>("");
  const [pages, setPages] = React.useState<string[]>([]);
  const [slices, setSlices] = React.useState<Slice[][]>([]);
  const [outputDownloadUrl, setOutputDownloadLink] = React.useState<string>("");
  const [mergedSlices, setMergedSlices] = React.useState<Slice[][]>([]);
  const [dimension, setDimension] = React.useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [options, setOptions] = React.useState<Options>({
    threshold: 50,
    path: "splitted",
    filename: "{{n}}.png",
    paddingX: 16,
    paddingY: 16,
  });

  const { ref, width = 1 } = useResizeObserver<HTMLDivElement>();

  React.useEffect(() => {
    setMergedSlices(slices.map((s) => mergeSmallSlices(s, options.threshold)));
  }, [options.threshold]);

  const handleMergedSlicesChange = (i: number) => (newSlices: Slice[]) => {
    setMergedSlices((prev) => [
      ...prev.slice(0, i),
      newSlices,
      ...prev.slice(i + 1),
    ]);
  };

  const handleDownload = (url: string) => {
    setPdfUrl(url);
    downloadPdf(url).then((data) => {
      setPages(data.pages.map((d) => d.image));
      setSlices(data.pages.map((d) => d.slices));
      setMergedSlices(
        data.pages.map((d) => mergeSmallSlices(d.slices, options.threshold))
      );
      setDimension({ width: data.width, height: data.height });
    });
  };

  const handleSplit = () => {
    const outputs = calculateFilenamePositions(
      mergedSlices,
      options.path,
      options.filename
    );

    splitPdf(pdfUrl, outputs, options.paddingX, options.paddingY).then(
      (data) => {
        setOutputDownloadLink(data.output_url);
      }
    );
  };

  const filenamePositions = calculateFilenamePositions(
    mergedSlices,
    options.path,
    options.filename
  );

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
          <PdfDownloader onDownload={handleDownload} />

          <Box
            mt={4}
            sx={{ backgroundColor: "#888", p: 4, border: "1px solid #444" }}
          >
            <Box ref={ref}>
              {pages.map((p, i) => (
                <React.Fragment key={p}>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", mb: 2 }}
                  >
                    Page {i + 1}
                  </Typography>
                  <PdfPageViewer
                    image={p}
                    slices={mergedSlices[i]}
                    scale={width / dimension.width}
                    onSlicesChange={handleMergedSlicesChange(i)}
                    filenames={filenamePositions[i]}
                  />
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Container>
        <OptionsBox
          options={options}
          onChange={setOptions}
          disabled={pages.length === 0}
          onSplit={handleSplit}
        />
      </main>
    </Box>
  );
}

export default App;
