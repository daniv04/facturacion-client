import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ReceiptsTable from './components/ReceiptsTable';

const el = document.getElementById('app');
if (el) {
    createRoot(el).render(<ReceiptsTable />);
}
