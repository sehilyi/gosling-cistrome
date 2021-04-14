import * as qs from 'qs';
import { validateGoslingSpec, GoslingComponent } from "gosling.js";
import { getSpec } from "./gos-template";
import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';

function App(props) {
  // url parameters
  const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
  const cid = urlParams?.id; // Cistrome ID

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
    return getSpec({
      cid, width: innerWidth - 120 /* padding */ - 400 /* gene panel on the right */
    })
  }, [cid, innerWidth]);

  return (
    <>
      <GoslingComponent
        ref={gosRef}
        spec={newSpec}
        compiled={(spec, vConf) => { /* Callback function when compiled */ }}
      />
      <div className="gene-list">
        <h4>Navigation</h4>
        <h5>Chromosome</h5>
        {
          [...Array.from(Array(22).keys()).map(d => d+1), 'X', 'Y'].map(k => <span className="chr-button" onClick={() => onZoomChr(`chr${k}`)}>{`chr${k}`}</span>)
        }
        <h5>Gene</h5>
        <div className="gene-button" onClick={() => onZoom('TP53', 'chr17')}>TP53</div>
        <div className="gene-button" onClick={() => onZoom('TNF', 'chr6')}>TNF</div>
        <div className="gene-button" onClick={() => onZoom('MYC', 'chr8')}>MYC</div>
      </div>
    </>
  );
}

export default App;
