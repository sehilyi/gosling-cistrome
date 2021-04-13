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

  function zoomToGene(gene) {
    if(!gosRef?.current) return;

    gosRef.current.api.zoomToGene('detail-view', gene, 3000);
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
        <div className="gene-button" onClick={() => zoomToGene('TP53')}>TP53</div>
        <div className="gene-button" onClick={() => zoomToGene('TNF')}>TNF</div>
        <div className="gene-button" onClick={() => zoomToGene('MYC')}>MYC</div>
      </div>
    </>
  );
}

export default App;
