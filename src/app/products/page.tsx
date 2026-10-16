import React from 'react';
import catalog from '../../data/final-catalog.json';

export default function ProductsPage() {
  return (
    <main>
      <h1>Decoupled Digital Catalog ({catalog.length} Active SKUs)</h1>
    </main>
  );
}
