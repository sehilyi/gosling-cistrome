import * as qs from "qs";
import { debounce } from "lodash";
import { validateGoslingSpec, GoslingComponent } from "gosling.js";
import { getSpec } from "./gos-template";
import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";

const padding = 20;
const duration = 1000;
const initWidth = window.innerWidth;

function App(props) {
  // url parameters
  // const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
  // const cid = urlParams?.id; // Cistrome ID

  const defaultKeyword = "1";
  const [searchKeyword, setSearchKeyword] = useState(defaultKeyword);

  // visual parameters
  const [innerWidth, setInnerWidth] = useState(initWidth);

  // Metadata
  const [metadata, setMetadata] = useState(undefined);

  // API of gosling.js
  const gosRef = useRef();

  function onZoom(gene, pos) {
    if (!gosRef?.current) return;

    gosRef.current.api.zoomToGene("detail-view", gene, duration);
    gosRef.current.api.zoomTo("overview", pos, duration);
  }

  function onZoomChr(chr) {
    if (!gosRef?.current) return;

    gosRef.current.api.zoomTo("detail-view", chr, duration);
    gosRef.current.api.zoomTo("overview", chr, duration);
  }

  useEffect(() => {
    window.addEventListener(
      "resize",
      debounce((e) => {
        setInnerWidth(window.innerWidth);
      }, 1000)
    );

    inspector(defaultKeyword);
  }, []);

  // validate the spec
  // const validity = validateGoslingSpec(getSpec({cid}));
  // if(validity.state === 'error') {
  //     console.warn('Gosling spec is invalid!', validity.message);
  //     return;
  // }

  // refer to https://github.com/hms-dbmi/cistrome-explorer/blob/b12238aeadbaf4a41f5445c32dbe3d6518d6fd1d/src/demo/CistromeToolkit.js#L128
  const inspector = (cid) => {
    fetch(`http://dc2.cistrome.org/api/inspector?id=${cid}`)
      .then((response) => {
        if (!response.ok) {
          console.log(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setMetadata(data);
      })
      .catch((error) => {
        console.warn(error);
      })
  };

  useEffect(() => {
    // const cids = searchKeyword.split(",");
    if (+searchKeyword) {
      inspector(searchKeyword);
    }
  }, [searchKeyword]);

  const getTitle = (meta) => {
    return [meta?.id, meta?.treats[0]?.name, meta?.treats[0]?.cell_line__name, meta?.treats[0]?.cell_type__name].join(' | ');
  };

  const newSpec = useMemo(() => {
    console.log(metadata);
    return getSpec({
      cids: [metadata?.id],
      title: [getTitle(metadata)],
      width:
        innerWidth -
        padding * 2 /* padding */ -
        400 /* gene panel on the left */ -
        400 /* metadata panel on the right*/,
    });
  }, [metadata, innerWidth]);

  return (
    <>
      <div className="vis">
        <GoslingComponent
          ref={gosRef}
          spec={newSpec}
          padding={padding}
          compiled={(spec, vConf) => {
            /* Callback function when compiled */
          }}
        />
      </div>
      <div className="gene-list">
        <h5>Cistrome ID</h5>
        <input
          // ref={searchBoxRef}
          className={"search-box"}
          type="text"
          defaultValue={defaultKeyword}
          name="default name"
          placeholder={`Cistrome ID (e.g., ${defaultKeyword})`}
          // value={searchKeyword}
          onChange={debounce((e) => {
            setSearchKeyword(e.target.value);
          }, 1000)}
          // onKeyDown={(e) => {
          //     switch(e.key){
          //         case 'ArrowUp':
          //             break;
          //         case 'ArrowDown':
          //             break;
          //         case 'Enter':
          //             setGeneSuggestions([]);
          //             if(searchKeyword.includes('chr')) {
          //                 hmRef.current.api.zoomTo(searchKeyword);
          //             } else {
          //                 hmRef.current.api.zoomToGene(searchKeyword);
          //             }
          //             break;
          //         case 'Esc':
          //         case 'Escape':
          //             break;
          //     }
          // }}
        />
        <h5>Chromosomes</h5>
        {[...Array.from(Array(22).keys()).map((d) => d + 1), "X", "Y"].map(
          (k) => (
            <span
              key={k}
              className="chr-button"
              onClick={() => onZoomChr(`chr${k}`)}
            >{`chr${k}`}</span>
          )
        )}
        <h5>Genes</h5>
        <div className="gene-button" onClick={() => onZoom("TP53", "chr17")}>
          TP53
        </div>
        <div className="gene-button" onClick={() => onZoom("TNF", "chr6")}>
          TNF
        </div>
        <div className="gene-button" onClick={() => onZoom("MYC", "chr8")}>
          MYC
        </div>
        <div className="gene-button">...</div>
        <h5>Expernal Links</h5>
        <div
          className="gene-button"
          onClick={() =>
            window.open(
              `http://dc2.cistrome.org/api/batchview/h/${searchKeyword
                .split(",")
                .join("_")}/w/`,
              "_blank"
            )
          }
        >
          Wash U Browser
        </div>
        <div
          className="gene-button"
          onClick={() =>
            window.open(
              `http://dc2.cistrome.org/api/batchview/h/${searchKeyword
                .split(",")
                .join("_")}/u/`,
              "_blank"
            )
          }
        >
          UCSC Browser
        </div>
      </div>
      <div className="metadata-table">
        <h5>Inspector</h5>
        <table>
          <tr>
            <td>GEO or ENCODE</td>
            <td>{metadata?.treats?.[0]?.unique_id}</td>
          </tr>
          <tr>
            <td>Cistrome ID</td>
            <td>{metadata?.id}</td>
          </tr>
          <tr>
            <td>Species</td>
            <td>{metadata?.treats?.[0]?.species__name}</td>
          </tr>
          <tr>
            <td>Cell Line</td>
            <td>{metadata?.treats?.[0]?.cell_line__name}</td>
          </tr>
          <tr>
            <td>Cell Type</td>
            <td>{metadata?.treats?.[0]?.cell_type__name}</td>
          </tr>
          <tr>
            <td>Tissue</td>
            <td>{metadata?.treats?.[0]?.tissue_type__name}</td>
          </tr>
          <tr>
            <td>Disease</td>
            <td>{metadata?.treats?.[0]?.disease_state__name}</td>
          </tr>
          <tr>
            <td>Factor</td>
            <td>{metadata?.treats?.[0]?.factor__name}</td>
          </tr>
          <tr>
            <td>Paper</td>
            <td><a href={metadata?.treats?.[0]?.link} target="_blank" rel="noopener noreferrer">{metadata?.treats?.[0]?.paper__reference}</a></td>
          </tr>
          <tr>
            <td>Raw Data</td>
            <td><a href={`http://dc2.cistrome.org/api/inspector?id=${metadata?.id}`} target="_blank" rel="noopener noreferrer">{'JSON'}</a></td>
          </tr>
        </table>
      </div>
    </>
  );
}

export default App;
