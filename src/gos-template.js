export const getSpec = ({ 
  cids,
  width = 2000,
  height = 500
}) => {
  // "#0072B2", "#D45E00"
  const sampleColor = [
    '#0072B2',
    '#D45E00',
    '#029F73',
    '#E79F00',
    '#CB7AA7'
  ];
  const plusColor = "#878787"; //"#D34B6C";
  const minusColor = "#878787"; //"#5688B9";

  const getSampleColor = (index) => {
    return sampleColor[index % sampleColor.length];
  }

  const getBwLink = (cid) => `http://dc2.cistrome.org/genome_browser/bw/${cid}_treat.bw`;

  const getSampleBar = (cid, index, isBrush = false) => {
    return {
      alignment: 'overlay',
      data: {
        url: getBwLink(cid),
        type: "bigwig",
        column: "position",
        value: "peak",
        binSize: 8,
      },
      title: "Cistrome ID: " + cid,
      tracks: isBrush ? [
        {},
        {
          mark: "brush",
          x: { linkingId: "detail" },
          color: { value: "#D34B6C" },
          stroke: {value: 'red'},
          strokeWidth: {value: 2},
          opacity: {value: 0.6}
        },
      ] : [{}],
      mark: "bar",
      x: { field: "start", type: "genomic" },
      xe: { field: "end", type: "genomic" },
      y: { field: "peak", type: "quantitative" },
      color: { value: getSampleColor(index) },
      stroke: { value: 'lightgray'},
      strokeWidth: { value: 0.5},
      style: { outline: "gray" },
      // opacity: { value: 0.6 },
      width,
      height: 40,
    }
  }

  console.log(cids, cids.filter(cid => +cid).map(cid => getSampleBar(cid)));

  return {
    title: "Explore Cistrome Data Using Gosling.js",
    subtitle: `Cistrome IDs: ${cids.join(', ')}`,
    spacing: 50,
    views: [
      {
        xDomain: { chromosome: "3" },
        linkingId: "overview",
        tracks: [
          // ...cids.filter(cid => +cid).map((cid, i) => getSampleBar(cid, i, true)),
          {
            id: 'overview',
            linkingId: "overview",
            title: "Ideogram",
            xDomain: { chromosome: "3" },
            layout: "linear",
            alignment: "overlay",
            data: {
              url:
                "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv",
              type: "csv",
              chromosomeField: "Chromosome",
              genomicFields: ["chromStart", "chromEnd"],
            },
            tracks: [
              {
                mark: "text",
                dataTransform: [{ type: 'filter', field: "Stain", oneOf: ["acen"], not: true }],
                text: { field: "Name", type: "nominal" },
                color: {
                  field: "Stain",
                  type: "nominal",
                  domain: ["gneg", "gpos25", "gpos50", "gpos75", "gpos100", "gvar"],
                  range: ["black", "black", "black", "black", "white", "black"],
                },
                visibility: [
                  {
                    operation: "less-than",
                    measure: "width",
                    threshold: "|xe-x|",
                    transitionPadding: 10,
                    target: "mark",
                  },
                ],
                style: { textStrokeWidth: 0 },
              },
              {
                mark: "rect",
                dataTransform: [{ type: 'filter', field: "Stain", oneOf: ["acen"], not: true }],
                color: {
                  field: "Stain",
                  type: "nominal",
                  domain: ["gneg", "gpos25", "gpos50", "gpos75", "gpos100", "gvar"],
                  range: [
                    "white",
                    "#D9D9D9",
                    "#979797",
                    "#636363",
                    "black",
                    '#82A3D0',
                  ],
                },
              },
              {
                mark: "triangleRight",
                dataTransform: [
                    { type: 'filter', field: "Stain", oneOf: ["acen"] },
                    { type: 'filter', field: "Name", include: "q" },
                  ],
                color: { value: "#E9413B" },
              },
              {
                mark: "triangleLeft",
                dataTransform: [
                    { type: 'filter', field: "Stain", oneOf: ["acen"] },
                    { type: 'filter', field: "Name", include: "p" },
                ],
                color: { value: "#E9413B" }, // #B40101
              },
              {
                mark: "brush",
                x: { linkingId: "detail" },
                color: { value: "#D34B6C" },
                stroke: {value: 'red'},
                strokeWidth: {value: 2},
                opacity: {value: 0.6}
              },
            ],
            x: { field: "chromStart", type: "genomic" },
            xe: { field: "chromEnd", type: "genomic" },
            stroke: { value: "gray" },
            strokeWidth: { value: 0.5 },
            style: { outline: "black", outlineWidth: 1 },
            width,
            height: 25,
          },
        ],
      },
      {
        xDomain: { chromosome: "3", interval: [142500000, 143000000] },
        linkingId: "detail",
        tracks: [
          ...cids.filter(cid => +cid).map((cid, i) => getSampleBar(cid, i)),
          {
            id: 'detail-view',
            alignment: "overlay",
            title: "hg38 | Genes",
            data: {
              url:
                "https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation",
              type: "beddb",
              genomicFields: [
                { index: 1, name: "start" },
                { index: 2, name: "end" },
              ],
              valueFields: [
                { index: 5, name: "strand", type: "nominal" },
                { index: 3, name: "name", type: "nominal" },
              ],
              exonIntervalFields: [
                { index: 12, name: "start" },
                { index: 13, name: "end" },
              ],
            },
            tracks: [
              {
                dataTransform: [
                    {type: 'filter', field: "type", oneOf: ["gene"] },
                    {type: 'filter', field: "strand", oneOf: ["+"] },
                  ],
                mark: "triangleRight",
                x: { field: "end", type: "genomic" },
                size: { value: 15 },
              },
              {
                dataTransform: [{type: 'filter', field: "type", oneOf: ["gene"] }],
                mark: "text",
                text: { field: "name", type: "nominal" },
                x: { field: "start", type: "genomic" },
                xe: { field: "end", type: "genomic" },
                style: { dy: -15, outline: "black", outlineWidth: 0 },
              },
              {
                dataTransform: [
                    { type: 'filter', field: "type", oneOf: ["gene"] },
                    { type: 'filter', field: "strand", oneOf: ["-"] },
                  ],
                mark: "triangleLeft",
                x: { field: "start", type: "genomic" },
                size: { value: 15 },
                style: { align: "right", outline: "black", outlineWidth: 0 },
              },
              {
                dataTransform: [{ type: 'filter',field: "type", oneOf: ["exon"] }],
                mark: "rect",
                x: { field: "start", type: "genomic" },
                size: { value: 15 },
                xe: { field: "end", type: "genomic" },
              },
              {
                dataTransform: [
                    { type: 'filter',field: "type", oneOf: ["gene"] },
                    { type: 'filter',field: "strand", oneOf: ["+"] },
                  ],
                mark: "rule",
                x: { field: "start", type: "genomic" },
                strokeWidth: { value: 2 },
                xe: { field: "end", type: "genomic" },
                style: {
                  linePattern: { type: "triangleRight", size: 3.5 },
                  outline: "black",outlineWidth: 0
                },
              },
              {
                dataTransform: [
                    { type: 'filter',field: "type", oneOf: ["gene"] },
                    { type: 'filter',field: "strand", oneOf: ["-"] },
                ],
                mark: "rule",
                x: { field: "start", type: "genomic" },
                strokeWidth: { value: 2 },
                xe: { field: "end", type: "genomic" },
                style: {
                  linePattern: { type: "triangleLeft", size: 3.5 },
                  outline: "black",outlineWidth: 0
                },
              },
            ],
            row: { field: "strand", type: "nominal", domain: ["+", "-"] },
            color: {
              field: "strand",
              type: "nominal",
              domain: ["+", "-"],
              range: [plusColor, minusColor],
            },
            visibility: [
              {
                operation: "less-than",
                measure: "width",
                threshold: "|xe-x|",
                transitionPadding: 10,
                target: "mark",
              },
            ],
            opacity: { value: 0.8 },
            style: { background: "#F5F5F5", outlineWidth: 0 },
            width: 350,
            height: 100,
          },

          {
            title: "hg38 | GENECODE Transcript (Max. 15 Rows)",
            alignment: "overlay",
            data: {
              url:
                "https://server.gosling-lang.org/api/v1/tileset_info/?d=transcript-hg38-beddb",
              type: "beddb",
              genomicFields: [
                { index: 1, name: "start" },
                { index: 2, name: "end" },
              ],
              valueFields: [
                { index: 5, name: "strand", type: "nominal" },
                { index: 3, name: "name", type: "nominal" },
              ],
            },
            dataTransform: [
                {
                  type: 'displace',
                  method: "pile",
                  boundingBox: { startField: "start", endField: "end" },
                  newField: "row",
                  maxRows: 15,
                },{type: 'filter', field: "type", oneOf: ["gene"] }],
            tracks: [
              {
                dataTransform: [
                    {
                      type: 'displace',
                      method: "pile",
                      boundingBox: { startField: "start", endField: "end" },
                      newField: "row",
                      maxRows: 15,
                    },
                  
                    {type: 'filter', field: "type", oneOf: ["gene"] },
                    {type: 'filter', field: "strand", oneOf: ["+"] },
                  ],
                mark: "triangleRight",
                x: { field: "end", type: "genomic" },
                size: { value: 15 },
              },
              {
                dataTransform: [
                    {
                      type: 'displace',
                      method: "pile",
                      boundingBox: { startField: "start", endField: "end" },
                      newField: "row",
                      maxRows: 15,
                    },{ type: 'filter', field: "type", oneOf: ["gene"] }],
                mark: "text",
                text: { field: "name", type: "nominal" },
                x: { field: "start", type: "genomic" },
                xe: { field: "end", type: "genomic" },
                style: { dy: -10, outline: "black" },
              },
              {
                dataTransform: [
                    {
                      type: 'displace',
                      method: "pile",
                      boundingBox: { startField: "start", endField: "end" },
                      newField: "row",
                      maxRows: 15,
                    },
                  
                    { type: 'filter', field: "type", oneOf: ["gene"] },
                    { type: 'filter', field: "strand", oneOf: ["-"] },
                  ],
                mark: "triangleLeft",
                x: { field: "start", type: "genomic" },
                size: { value: 15 },
                style: { align: "right", outline: "black" },
              },
              {
                dataTransform: [
                    {
                      type: 'displace',
                      method: "pile",
                      boundingBox: { startField: "start", endField: "end" },
                      newField: "row",
                      maxRows: 15,
                    },
                    { type: 'filter', field: "type", oneOf: ["exon"] }],
                mark: "rect",
                x: { field: "start", type: "genomic" },
                xe: { field: "end", type: "genomic" },
              },
              {
                dataTransform: [
                    {
                      type: 'displace',
                      method: "pile",
                      boundingBox: { startField: "start", endField: "end" },
                      newField: "row",
                      maxRows: 15,
                    },
                    { type: 'filter', field: "type", oneOf: ["gene"] },
                    { type: 'filter', field: "strand", oneOf: ["+"] },
                  ],
                mark: "rule",
                x: { field: "start", type: "genomic" },
                strokeWidth: { value: 2 },
                xe: { field: "end", type: "genomic" },
                style: {
                  linePattern: { type: "triangleRight", size: 3.5 },
                  outline: "black",outlineWidth: 0,
                },
              },
              {
                dataTransform: [
                    {
                      type: 'displace',
                      method: "pile",
                      boundingBox: { startField: "start", endField: "end" },
                      newField: "row",
                      maxRows: 15,
                    },
                    { type: 'filter', field: "type", oneOf: ["gene"] },
                    { type: 'filter', field: "strand", oneOf: ["-"] }
                  ],
                mark: "rule",
                x: { field: "start", type: "genomic" },
                strokeWidth: { value: 2 },
                xe: { field: "end", type: "genomic" },
                style: {
                  linePattern: { type: "triangleRight", size: 3.5 },
                  outline: "black", outlineWidth: 0,
                },
              },
            ],
            row: { field: "row", type: "nominal" },
            color: {
              field: "strand",
              type: "nominal",
              domain: ["+", "-"],
              range: [plusColor, minusColor],
            },
            visibility: [
              {
                operation: "less-than",
                measure: "width",
                threshold: "|xe-x|",
                transitionPadding: 10,
                target: "mark",
              },
            ],
            opacity: { value: 0.8 },
            style: { outline: "black", outlineWidth: 0, background: "white" },
            width,
            height,
          },
        ],
      },
    ],
  };
};
