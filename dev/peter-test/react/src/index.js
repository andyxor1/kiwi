import React from "react";
import ReactDOM from "react-dom";
import PeterTest from "./PeterTest.jsx";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<PeterTest color="seagreen" times="5"/>, document.getElementById("root"));
registerServiceWorker()
