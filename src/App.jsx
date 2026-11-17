import { useMemo, useState } from 'react';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0));

const toWords = (value) => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const convert = (number) => {
    if (number < 20) return ones[number];
    if (number < 100) return `${tens[Math.floor(number / 10)]} ${ones[number % 10]}`.trim();
    if (number < 1000) return `${ones[Math.floor(number / 100)]} hundred ${convert(number % 100)}`.trim();
    if (number < 100000) return `${convert(Math.floor(number / 1000))} thousand ${convert(number % 1000)}`.trim();
    if (number < 10000000) return `${convert(Math.floor(number / 100000))} lakh ${convert(number % 100000)}`.trim();
    return `${convert(Math.floor(number / 10000000))} crore ${convert(number % 10000000)}`.trim();
  };
  const clean = convert(Math.floor(value)).trim();
  return clean ? `${clean} rupees only` : 'Zero rupees only';
};

export default function App() {
  const [mode, setMode] = useState('Invoice');
  const [business, setBusiness] = useState({ name: 'Northwind Studio', gstin: '27ABCDE1234F1Z5', address: 'Bandra West, Mumbai', email: 'hello@northwind.in' });
  const [client, setClient] = useState({ name: 'Apex Digital', gstin: '27LMNOP5678A1Z9', address: 'Powai, Mumbai', email: 'accounts@apexdigital.in' });
  const [items, setItems] = useState([
    { id: 1, name: 'Website redesign', qty: 1, rate: 42000, discount: 5 },
    { id: 2, name: 'SEO sprint', qty: 2, rate: 6500, discount: 0 },
  ]);
  const [form, setForm] = useState({ name: '', qty: 1, rate: '', discount: 0 });
  const [taxRate, setTaxRate] = useState(18);

  const summary = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      const base = Number(item.qty || 0) * Number(item.rate || 0);
      const discounted = base * (1 - Number(item.discount || 0) / 100);
      return total + discounted;
    }, 0);
    const gst = subtotal * (taxRate / 100);
    return { subtotal, gst, total: subtotal + gst };
  }, [items, taxRate]);

  const addItem = () => {
    if (!form.name || !form.rate) return;
    setItems((current) => [...current, { id: Date.now(), name: form.name, qty: Number(form.qty || 1), rate: Number(form.rate), discount: Number(form.discount || 0) }]);
    setForm({ name: '', qty: 1, rate: '', discount: 0 });
  };

  return (
    <div className="app-shell">
      <div className="panel hero-panel">
        <div>
          <p className="eyebrow">Billing for freelancers & small businesses</p>
          <h1>GST Invoice Builder</h1>
        </div>
        <div className="segment-row">
          {['Invoice', 'Quotation', 'Payment Receipt'].map((item) => (
            <button key={item} className={mode === item ? 'primary' : 'ghost'} onClick={() => setMode(item)}>{item}</button>
          ))}
        </div>
      </div>

      <div className="panel full-span">
        <h2>Business & client details</h2>
        <div className="form-grid two-columns">
          <input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} placeholder="Business name" />
          <input value={business.gstin} onChange={(e) => setBusiness({ ...business, gstin: e.target.value })} placeholder="GSTIN" />
          <textarea value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} placeholder="Business address" />
          <input value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} placeholder="Email" />
        </div>
        <div className="form-grid two-columns">
          <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Client name" />
          <input value={client.gstin} onChange={(e) => setClient({ ...client, gstin: e.target.value })} placeholder="Client GSTIN" />
          <textarea value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} placeholder="Client address" />
          <input value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="Client email" />
        </div>
      </div>

      <div className="panel full-span">
        <h2>Add line item</h2>
        <div className="form-grid four-columns">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item" />
          <input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="Qty" />
          <input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="Rate" />
          <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="Discount %" />
        </div>
        <button className="primary" onClick={addItem}>Add Item</button>
      </div>

      <div className="panel invoice-panel full-span">
        <div className="invoice-header">
          <div>
            <h2>{mode}</h2>
            <p>{business.name}</p>
            <small>{business.address}</small>
          </div>
          <div>
            <p>GSTIN: {business.gstin}</p>
            <p>Bill to: {client.name}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const rowValue = Number(item.qty || 0) * Number(item.rate || 0);
              const discounted = rowValue * (1 - Number(item.discount || 0) / 100);
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{money(item.rate)}</td>
                  <td>{item.discount}%</td>
                  <td>{money(discounted)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="summary-box">
          <div><span>Subtotal</span><strong>{money(summary.subtotal)}</strong></div>
          <div><span>GST ({taxRate}%)</span><strong>{money(summary.gst)}</strong></div>
          <div><span>Total</span><strong>{money(summary.total)}</strong></div>
          <div className="full-width"><small>{toWords(summary.total)}</small></div>
        </div>

        <div className="bottom-actions">
          <label className="tax-control">
            GST Rate
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value || 0))} />
          </label>
          <button className="secondary" onClick={() => window.print()}>Print / PDF</button>
        </div>
      </div>
    </div>
  );
}
