import React from "react";
import { Link } from "react-router-dom";

export default function AdminPage(){
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard (placeholder)</h1>
      <p>Admin reviews pending vouchers here.</p>
      <Link to="/"><button>Back</button></Link>
    </div>
  );
}
