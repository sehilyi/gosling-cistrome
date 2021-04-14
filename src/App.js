import * as qs from 'qs';
import { debounce } from 'lodash';
import { validateGoslingSpec, GoslingComponent } from "gosling.js";
import { getSpec } from "./gos-template";
import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';

function App(props) {
  // url parameters
  // const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
  // const cid = urlParams?.id; // Cistrome ID

  const defaultKeyword = '1,2,4,6';
  const [searchKeyword, setSearchKeyword] = useState(defaultKeyword);

  // visual parameters
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  // API of gosling.js
  const gosRef = useRef();

  function onZoom(gene, pos) {
    if(!gosRef?.current) return;

    gosRef.current.api.zoomToGene('detail-view', gene, 1000);
    gosRef.current.api.zoomTo('overview', pos, 1000);
  }

  function onZoomChr(chr) {
    if(!gosRef?.current) return;

    gosRef.current.api.zoomTo('detail-view', chr, 1000);
    gosRef.current.api.zoomTo('overview', chr, 1000);
  }

  useEffect(() => {
    window.addEventListener("resize", onResize);
  }, []);
  
  function onResize() {
    setInnerWidth(window.innerWidth);
  }

  // validate the spec
  // const validity = validateGoslingSpec(getSpec({cid}));
  // if(validity.state === 'error') {
  //     console.warn('Gosling spec is invalid!', validity.message);
  //     return;
  // }

  const newSpec = useMemo(() => {
    const cids = searchKeyword.split(',');
    return getSpec({
      cids, width: innerWidth - 120 /* padding */ - 400 /* gene panel on the right */
    })
  }, [searchKeyword, innerWidth]);

  return (
    <>
      <div className='vis'>
        <GoslingComponent
          ref={gosRef}
          spec={newSpec}
          compiled={(spec, vConf) => { /* Callback function when compiled */ }}
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
        onChange={debounce(e => {
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
        {
          [...Array.from(Array(22).keys()).map(d => d+1), 'X', 'Y'].map(k => <span key={k} className="chr-button" onClick={() => onZoomChr(`chr${k}`)}>{`chr${k}`}</span>)
        }
        <h5>Genes</h5>
        <div className="gene-button" onClick={() => onZoom('TP53', 'chr17')}>TP53</div>
        <div className="gene-button" onClick={() => onZoom('TNF', 'chr6')}>TNF</div>
        <div className="gene-button" onClick={() => onZoom('MYC', 'chr8')}>MYC</div>
        <div className="gene-button">...</div>
      </div>
    </>
  );
}

export default App;
