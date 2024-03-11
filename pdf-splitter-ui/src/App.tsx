import React from "react";
import { Box, AppBar, Container, Toolbar, Typography } from "@mui/material";
import useResizeObserver from "use-resize-observer";
import OptionsBox, { Options } from "./components/OptionsBox";
import PdfPageViewer from "./components/PdfPageViewer";
import PdfPreviewer from "./components/PdfPreviewer";
import { OutputSlice, Slice } from "./types";
import { previewPdf, splitPdf } from "./api";

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

function calculateOutputSlices(slices: Slice[][]): OutputSlice[][] {
  const outputSlices = [] as OutputSlice[][];
  for (let i = 0; i < slices.length; i++) {
    const pageOutputSlices = [] as OutputSlice[];
    for (let j = 0; j < slices[i].length; j++) {
      if (!slices[i][j].is_empty) {
        // if previous slice is non-empty, merge the filename with the previous slice
        if (j > 0 && !slices[i][j - 1].is_empty) {
          pageOutputSlices[pageOutputSlices.length - 1].height +=
            slices[i][j].height;
          continue;
        }

        pageOutputSlices.push({
          top: slices[i].slice(0, j).reduce((acc, s) => acc + s.height, 0),
          height: slices[i][j].height,
        });
      }
    }
    outputSlices.push(pageOutputSlices);
  }

  return outputSlices;
}

function calculateFilenames(
  outputSlices: OutputSlice[][],
  path: string,
  filename: string
): OutputSlice[][] {
  let n = 0;
  const newOutputSlices = [] as OutputSlice[][];

  for (let i = 0; i < outputSlices.length; i++) {
    newOutputSlices.push([]);
    for (let j = 0; j < outputSlices[i].length; j++) {
      if (!outputSlices[i][j].link) {
        n += 1;
      }
      newOutputSlices[i].push({
        ...outputSlices[i][j],
        filename: `${path}/${filename.replace("{{n}}", n.toString())}`,
      });
    }
  }

  return newOutputSlices;
}

function App() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = React.useState<string>("");
  const [pages, setPages] = React.useState<string[]>([]);
  const [slices, setSlices] = React.useState<Slice[][]>([]);
  const [downloadUrl, setDownloadUrl] = React.useState<string>("");
  const [mergedSlices, setMergedSlices] = React.useState<Slice[][]>([]);
  const [outputSlices, setOutputSlices] = React.useState<OutputSlice[][]>([]);
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

  const handlePreviewPdf = (url: string) => {
    setIsLoading(true);
    setPdfUrl(url);
    setDownloadUrl("");
    setSlices([]);
    setMergedSlices([]);
    setOutputSlices([]);
    setDimension({ width: 0, height: 0 });
    previewPdf(url).then((data) => {
      setPages(data.pages.map((d) => d.image));
      setSlices(data.pages.map((d) => d.slices));
      setMergedSlices(
        data.pages.map((d) => mergeSmallSlices(d.slices, options.threshold))
      );
      setDimension({ width: data.width, height: data.height });
      setIsLoading(false);
    });
  };

  const handleSplit = () => {
    setDownloadUrl("");
    const pdfFilename = options.path.replace(/\/\\:\./, "_") || "splitted";
    splitPdf(
      pdfUrl,
      pdfFilename,
      outputSlices,
      options.paddingX,
      options.paddingY
    ).then((data) => {
      setDownloadUrl(data.download_url);
    });
  };

  const handleLinkOutputSlice = (page: number) => (idx: number) => {
    setOutputSlices((prev) => {
      const newSlices = [...prev];
      newSlices[page] = [...prev[page]];
      newSlices[page][idx] = {
        ...newSlices[page][idx],
        link: !newSlices[page][idx].link,
      };
      return calculateFilenames(newSlices, options.path, options.filename);
    });
  };

  React.useEffect(() => {
    let outputSlices = calculateOutputSlices(mergedSlices);
    outputSlices = calculateFilenames(
      outputSlices,
      options.path,
      options.filename
    );

    setOutputSlices(outputSlices);
  }, [options.path, options.filename, mergedSlices]);

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
          <PdfPreviewer onPreview={handlePreviewPdf} isLoading={isLoading} />

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
                    slices={mergedSlices[i] ?? []}
                    scale={width / dimension.width}
                    onSlicesChange={handleMergedSlicesChange(i)}
                    filenames={outputSlices[i] ?? []}
                    onLink={handleLinkOutputSlice(i)}
                  />
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Container>
        <OptionsBox
          options={options}
          onChange={setOptions}
          disabled={pages.length === 0 || isLoading}
          onSplit={handleSplit}
          downloadUrl={downloadUrl}
        />
      </main>
    </Box>
  );
}

export default App;
