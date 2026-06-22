import { Printer, Download, Image as ImageIcon, Save, FileText, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { ReceiptData } from '../types';

interface Props {
  editReceiptId?: string | null;
  onSaved?: () => void;
}

export function CreateReceipt({ editReceiptId, onSaved }: Props) {
  const [isGenerateMenuOpen, setIsGenerateMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptNo, setReceiptNo] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('ur-PK') || new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState(Array.from({ length: 10 }, () => ({ date: '', qty: '', rate: '', amount: '' })));
  
  const [previousBalance, setPreviousBalance] = useState('');
  const [received, setReceived] = useState('');
  const [signatureName, setSignatureName] = useState<'Murtaza' | 'Qurban Ali'>('Murtaza');
  const [isSignatureMenuOpen, setIsSignatureMenuOpen] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editReceiptId) {
      const saved = localStorage.getItem('receiptsHistory');
      if (saved) {
        try {
          const history = JSON.parse(saved) as ReceiptData[];
          const target = history.find(r => r.id === editReceiptId);
          if (target) {
            setReceiptNo(target.receiptNo);
            setDate(target.date);
            setCustomerName(target.customerName);
            setItems(target.items);
            setPreviousBalance(target.previousBalance);
            setReceived(target.received);
            if (target.signatureName) setSignatureName(target.signatureName as 'Murtaza' | 'Qurban Ali');
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const saved = localStorage.getItem('receiptsHistory');
      let nextNo = 1;
      if (saved) {
        try {
          const history = JSON.parse(saved) as ReceiptData[];
          if (history.length > 0) {
            const maxNo = Math.max(...history.map(r => {
              const num = parseInt(r.receiptNo, 10);
              return isNaN(num) ? 0 : num;
            }));
            nextNo = maxNo > 0 ? maxNo + 1 : history.length + 1;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setReceiptNo(nextNo.toString().padStart(4, '0'));
    }
  }, [editReceiptId]);

  const saveReceipt = () => {
    const saved = localStorage.getItem('receiptsHistory');
    let history: ReceiptData[] = saved ? JSON.parse(saved) : [];
    
    const newReceipt: ReceiptData = {
      id: editReceiptId || Date.now().toString(),
      createdAt: editReceiptId ? Date.now() : Date.now(), // keep simple
      receiptNo,
      date,
      customerName,
      items,
      previousBalance,
      received,
      signatureName
    };
    
    if (editReceiptId) {
       history = history.map(r => r.id === editReceiptId ? newReceipt : r);
    } else {
       history.push(newReceipt);
    }
    
    localStorage.setItem('receiptsHistory', JSON.stringify(history));
    if (onSaved) onSaved();
  };

  const generateAndSave = async (type: 'pdf' | 'image' | 'print') => {
    setIsGenerating(true);
    // Wait for React to re-render without the empty rows
    await new Promise(resolve => setTimeout(resolve, 50));

    const targetElement = (receiptRef.current?.firstElementChild as HTMLElement) || receiptRef.current;
    if (!targetElement && type !== 'print') {
      setIsGenerating(false);
      return;
    }

    try {
      await document.fonts.ready;
      if (type === 'pdf') {
        const fontLink = `@import url('https://fonts.googleapis.com/css2?family=Gulzar&family=Lateef:wght@200;300;400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Space+Grotesk:wght@500;600;700&display=swap');`;
        const imgData = await domToPng(targetElement, {
          scale: 3,
          backgroundColor: '#fffcf0',
          font: { cssText: fontLink }
        });
        
        const tempPdf = new jsPDF();
        const imgProps = tempPdf.getImageProperties(imgData);
        
        const orientation = imgProps.width > imgProps.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${receiptNo || 'new'}.pdf`);
      } else if (type === 'image') {
        const fontLink = `@import url('https://fonts.googleapis.com/css2?family=Gulzar&family=Lateef:wght@200;300;400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Space+Grotesk:wght@500;600;700&display=swap');`;
        const imgData = await domToPng(targetElement, {
          scale: 3,
          backgroundColor: '#fffcf0',
          font: { cssText: fontLink }
        });
        
        const a = document.createElement('a');
        a.href = imgData;
        a.download = `receipt-${receiptNo || 'new'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (type === 'print') {
        window.print();
        // Wait a bit for print dialog
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert(`${type.toUpperCase()} generation failed. Please try again.`);
    } finally {
      setIsGenerating(false);
      saveReceipt();
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(item.qty);
      const r = parseFloat(item.rate);
      if (!isNaN(q) && !isNaN(r)) {
        item.amount = (q * r).toString();
      } else if (item.qty === '' || item.rate === '') {
         item.amount = '';
      }
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalBalance = totalAmount + (parseFloat(previousBalance) || 0) - (parseFloat(received) || 0);

  const clearForm = () => {
    if (window.confirm("کیا آپ واقعی رسید صاف کرنا چاہتے ہیں؟ (Are you sure you want to clear?)")) {
      let nextNoStr = '';
      if (!editReceiptId) {
        const saved = localStorage.getItem('receiptsHistory');
        let nextNo = 1;
        if (saved) {
          try {
            const history = JSON.parse(saved) as ReceiptData[];
            if (history.length > 0) {
              const maxNo = Math.max(...history.map(r => {
                const num = parseInt(r.receiptNo, 10);
                return isNaN(num) ? 0 : num;
              }));
              nextNo = maxNo > 0 ? maxNo + 1 : history.length + 1;
            }
          } catch (e) {
            console.error(e);
          }
        }
        nextNoStr = nextNo.toString().padStart(4, '0');
      }
      setReceiptNo(nextNoStr);
      setCustomerName('');
      setItems(Array.from({ length: 10 }, () => ({ date: '', qty: '', rate: '', amount: '' })));
      setPreviousBalance('');
      setReceived('');
    }
  };

  const inputClass = "bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-inherit placeholder-gray-300 font-inherit print:placeholder-transparent";

  return (
    <div className="flex flex-col items-center px-1 sm:px-4 py-2 sm:py-4 w-full">
      {/* Action Bar (Hidden on Print) */}
      <div className="mb-4 sm:mb-6 print:hidden w-full max-w-[800px] flex flex-col sm:flex-row gap-3 justify-between mx-auto">
        <button onClick={clearForm} className="text-red-600 hover:bg-red-50 py-3 sm:py-2 px-4 rounded-xl font-medium transition-colors w-full sm:w-auto text-center border border-red-200 sm:border-transparent">
          صاف کریں (Clear)
        </button>
        <div className="flex flex-col sm:flex-row h-full sm:h-auto gap-3 w-full sm:w-auto relative">
          <div className="relative w-full sm:w-auto text-left" dir="ltr">
            <button 
              onClick={() => setIsGenerateMenuOpen(!isGenerateMenuOpen)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm transition-colors print:hidden w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              Generate
              <ChevronDown className={`w-4 h-4 transition-transform ${isGenerateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isGenerateMenuOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                <button 
                  onClick={() => {
                    setIsGenerateMenuOpen(false);
                    generateAndSave('pdf');
                  }} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 disabled:opacity-50"
                  disabled={isGenerating}
                >
                  <FileText className="w-5 h-5 text-sky-600" />
                  <span className="font-medium">PDF Document</span>
                </button>
                <button 
                  onClick={() => {
                    setIsGenerateMenuOpen(false);
                    generateAndSave('image');
                  }} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 disabled:opacity-50"
                  disabled={isGenerating}
                >
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">Image (PNG)</span>
                </button>
                <button 
                  onClick={() => {
                    setIsGenerateMenuOpen(false);
                    generateAndSave('print');
                  }} 
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 disabled:opacity-50"
                  disabled={isGenerating}
                >
                  <Printer className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Print Receipt</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* Preview Column (The Bill Book format) */}
      <div className="w-full shrink-0 flex justify-center print:block print:w-full mx-auto" ref={receiptRef}>
         <div 
          className="bg-[#fffcf0] border border-gray-200 p-3 sm:p-10 pb-6 sm:pb-10 w-full max-w-[800px] text-emerald-950 print:p-12 print:pb-12 print:bg-white print:border-none print:shadow-none mx-auto shadow-lg shadow-gray-200/50 relative overflow-hidden"
          dir="rtl"
          style={{ fontFamily: "'Lateef', 'Noto Sans Arabic', 'MB Sindhi', serif" }}
         >
            {/* Pad Binding (Visual only) */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-red-700 border-b border-red-800 shadow-sm"></div>

            {/* Header */}
            <div className="text-center pb-2 mb-4 mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight text-emerald-800 whitespace-nowrap" style={{ fontWeight: 800 }}>بسم اللّه آئيس فيڪٽري</h1>
              <p className="text-lg sm:text-xl font-medium text-emerald-900">رستم ضلع شڪارپور</p>
              <p className="text-base sm:text-lg mt-1 font-bold text-emerald-700" dir="ltr">📞 0302-3934191</p>
            </div>

            {/* Meta */}
            <div className="flex justify-between items-end mb-4 sm:mb-6 border-b-2 border-emerald-800 pb-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap font-bold text-base sm:text-lg text-emerald-900">تاريخ:</span>
                <input type="text" value={date} onChange={e => setDate(e.target.value)} className={`${inputClass} w-24 sm:w-32 text-indigo-700 font-mono font-bold text-base sm:text-lg text-right tracking-widest`} dir="ltr" />
              </div>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap font-bold text-base sm:text-lg text-emerald-900">رسيد نمبر:</span>
                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className={`${inputClass} w-20 sm:w-28 text-red-600 font-mono font-bold text-base sm:text-lg text-right tracking-widest`} dir="ltr" />
              </div>
            </div>
            
            <div className="flex items-end mb-6 sm:mb-8 border-b-2 border-emerald-800 pb-2">
              <span className="whitespace-nowrap font-bold text-lg sm:text-xl text-emerald-900 ml-2">نــالو:</span> 
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)}
                className={`${inputClass} flex-1 text-indigo-900 font-bold text-lg sm:text-xl px-2 min-h-[36px] bg-transparent outline-none`} 
              />
            </div>

            {/* Table */}
            <table className="w-full mb-6 border-collapse border-2 border-emerald-800 text-sm sm:text-base">
              <thead>
                <tr className="bg-emerald-50/80 border-b-2 border-emerald-800 text-emerald-900">
                  <th className="border-l border-emerald-800 p-2 sm:p-3 text-center w-1/3 sm:w-1/4 print:w-1/3 whitespace-nowrap">تاريخ</th>
                  <th className="border-l border-emerald-800 p-2 sm:p-3 text-center w-1/3 sm:w-1/4 print:w-1/3 whitespace-nowrap">تعداد گولا</th>
                  <th className="border-l border-emerald-800 p-2 sm:p-3 text-center hidden sm:table-cell w-1/4 print:hidden bg-emerald-100/50 text-xs sm:text-sm" title="Only visible to you">ريٽ (صرف سسٽم)</th>
                  <th className="p-2 sm:p-3 text-center w-1/3 sm:w-1/4 print:w-1/3">رقم</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const isEmptyRow = !item.date && !item.qty && !item.rate && !item.amount;
                  if (isEmptyRow && i >= 1 && items.slice(0, i).some(prev => !prev.date && !prev.qty && !prev.rate && !prev.amount)) {
                     // Hide extra empty rows: only show one empty row below filled ones
                     return null;
                  }
                  if (isGenerating && isEmptyRow) return null;
                  
                  return (
                  <tr key={i} className={`border-b border-emerald-800/60 h-8 sm:h-10 hover:bg-emerald-50 transition-colors ${isEmptyRow ? 'empty-row' : ''}`}>
                    <td className="border-l border-emerald-800/60 p-0">
                      <input 
                        type="text" 
                        value={item.date} 
                        onChange={e => updateItem(i, 'date', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono hover:bg-emerald-100/30 text-indigo-900 text-xs sm:text-base`} 
                        dir="ltr"
                      />
                    </td>
                    <td className="border-l border-emerald-800/60 p-0">
                      <input 
                        type="text" 
                        value={item.qty} 
                        onChange={e => updateItem(i, 'qty', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono font-bold hover:bg-emerald-100/30 text-indigo-900 text-sm sm:text-base`} 
                        dir="ltr"
                      />
                    </td>
                    <td className="border-l border-emerald-800/60 p-0 hidden sm:table-cell print:hidden bg-emerald-50/50">
                      <input 
                        type="text" 
                        value={item.rate} 
                        onChange={e => updateItem(i, 'rate', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono hover:bg-emerald-100/50 text-indigo-900 text-sm sm:text-base`} 
                        title="هي ريٽ پرنٽ نه ٿيندو"
                        dir="ltr"
                      />
                    </td>
                    <td className="p-0">
                      <input 
                        type="text" 
                        value={item.amount} 
                        onChange={e => updateItem(i, 'amount', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono font-bold hover:bg-emerald-100/30 text-indigo-900 text-sm sm:text-base`} 
                        dir="ltr"
                      />
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8 sm:mb-12">
              <table className="w-full sm:w-64 border-collapse border-2 border-emerald-800 text-sm sm:text-base" dir="rtl">
                 <tbody>
                    {(!isGenerating || previousBalance) && (
                      <tr className={`border-b border-emerald-800 h-10 ${!previousBalance ? 'print:hidden' : ''}`}>
                        <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right w-1/2">اڳ جي بقايہ</td>
                        <td className="p-0">
                          <input 
                            type="text" 
                            value={previousBalance} 
                            onChange={e => setPreviousBalance(e.target.value)}
                            className={`${inputClass} w-full h-10 text-center font-mono bg-transparent hover:bg-emerald-50 text-indigo-900`}
                            dir="ltr"
                          />
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-emerald-800 h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right">ٽوٽل بقايہ</td>
                      <td className="p-2 text-center font-mono font-bold text-indigo-900 bg-white/40" dir="ltr">
                        {(totalAmount + (parseFloat(previousBalance) || 0)) || ''}
                      </td>
                    </tr>
                    <tr className="border-b border-emerald-800 h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right">مليل رقم</td>
                      <td className="p-0 bg-white/20">
                        <input 
                          type="text" 
                          value={isGenerating && !received ? '-----' : received} 
                          onChange={e => setReceived(e.target.value)}
                          className={`${inputClass} w-full h-10 text-center font-mono hover:bg-emerald-50 text-indigo-900`}
                          dir="ltr"
                        />
                      </td>
                    </tr>
                    <tr className="h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right">بقايہ رقم</td>
                      <td className="p-2 text-center font-mono font-bold text-red-700 bg-white/40" dir="ltr">
                        {totalBalance || ''}
                      </td>
                    </tr>
                 </tbody>
               </table>
            </div>

            {/* Signature */}
            <div className="flex justify-start mt-12 pt-8">
               <div className="relative border-t-2 border-emerald-800 w-48 text-center pt-2 font-bold text-lg text-emerald-900 mt-6">
                <div className="absolute bottom-full left-0 w-full text-center">
                  <div className="relative inline-block">
                    <button 
                      onClick={() => !isGenerating && setIsSignatureMenuOpen(!isSignatureMenuOpen)}
                      className={`cursor-pointer transition-colors ${!isGenerating ? 'hover:text-emerald-600' : ''}`}
                      style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: '#047857', fontWeight: 'normal', lineHeight: '1' }}
                      dir="ltr"
                      disabled={isGenerating}
                    >
                      {signatureName}
                    </button>
                    {!isGenerating && isSignatureMenuOpen && (
                      <div className="absolute -top-2 left-full ml-4 bg-white border border-emerald-200 shadow-xl rounded-lg overflow-hidden z-10 min-w-32 animate-in fade-in zoom-in duration-200">
                        <button 
                          onClick={() => { setSignatureName('Qurban Ali'); setIsSignatureMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-emerald-900 font-bold font-sans text-sm border-b border-emerald-100 transition-colors"
                          dir="ltr"
                        >
                          1. Qurban Ali
                        </button>
                        <button 
                          onClick={() => { setSignatureName('Murtaza'); setIsSignatureMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-emerald-900 font-bold font-sans text-sm transition-colors"
                          dir="ltr"
                        >
                          2. Murtaza
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                دستخط
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
