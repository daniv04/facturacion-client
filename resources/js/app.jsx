import './bootstrap';
import { createRoot } from 'react-dom/client';
import ReceiptsTable from './components/ReceiptsTable';
import InvoiceForm from './components/invoice/InvoiceForm';
import JsonInvoiceForm from './components/JsonInvoiceForm';

const el = document.getElementById('app');
if (el) createRoot(el).render(<ReceiptsTable />);

const invoiceEl = document.getElementById('invoice-form');
if (invoiceEl) createRoot(invoiceEl).render(<InvoiceForm />);

const jsonInvoiceEl = document.getElementById('json-invoice-form');
if (jsonInvoiceEl) createRoot(jsonInvoiceEl).render(<JsonInvoiceForm />);
