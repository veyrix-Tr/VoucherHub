import React from "react";
import { Link } from "react-router-dom";

export default function Marketplace(){
  return (
    <div style={{ padding: 24 }}>
      <h1>Marketplace (placeholder)</h1>
      <p>Users will browse & mint approved vouchers here.</p>
      <Link to="/"><button>Back</button></Link>
    </div>
  );
}
