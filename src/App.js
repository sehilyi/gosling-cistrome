import * as qs from 'qs';
import { validateGoslingSpec, GoslingComponent } from "gosling.js";
import { getSpec } from "./gos-template";
import './App.css';
import { useEffect, useMemo, useState } from 'react';

function App(props) {
  // url parameters
  const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
  const cid = urlParams?.id; // Cistrome ID

  // visual parameters
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

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
        spec={newSpec}
        compiled={(spec, vConf) => { /* Callback function when compiled */ }}
      />
      <div className="gene-list">
        
      </div>
    </>
  );
}

export default App;
