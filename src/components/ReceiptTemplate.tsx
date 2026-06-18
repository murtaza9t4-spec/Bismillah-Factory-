import React, { forwardRef } from 'react';
import { ReceiptData } from '../types';

export const ReceiptTemplate = forwardRef<HTMLDivElement, { data: ReceiptData }>(({ data }, ref) => {
  const { receiptNo, date, customerName, items, previousBalance, received } = data;
  
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalBalance = totalAmount + (parseFloat(previousBalance) || 0) - (parseFloat(received) || 0);

  return (
    <div 
      ref={ref}
      className="bg-[#fffcf0] p-12 pb-12 text-emerald-950 w-[800px] relative overflow-hidden font-sans"
      dir="rtl"
    >
      <div className="absolute top-0 left-0 right-0 h-4 bg-red-700 border-b border-red-800"></div>

      {/* Header */}
      <div className="text-center border-b-2 border-emerald-800 pb-4 mb-6 mt-2">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-emerald-800 whitespace-nowrap" style={{ fontWeight: 800 }}>بسم اللّه آئيس فيڪٽري</h1>
        <p className="text-xl font-medium text-emerald-900">رستم ضلع شڪارپور</p>
        <p className="text-lg mt-1 font-bold text-emerald-700" dir="ltr">📞 0302-3934191</p>
      </div>

      {/* Meta */}
      <div className="flex justify-between items-end gap-3 mb-6 text-base font-bold text-emerald-900">
        <div className="flex items-center justify-start gap-2">
          <span>رسيد نمبر:</span>
          <div className="border-b border-emerald-800/50 min-w-[80px] text-center text-red-600 pb-1">{receiptNo}</div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <span>تاريخ:</span>
          <div className="border-b border-emerald-800/50 min-w-[100px] text-center text-indigo-700 pb-1" dir="ltr">{date}</div>
        </div>
      </div>

      <div className="flex items-end mb-8 text-xl text-emerald-900 border-b-2 border-emerald-800 pb-2">
        <span className="font-bold whitespace-nowrap ml-3">نالو:</span> 
        <div className="flex-1 font-medium text-indigo-900 px-2 min-h-[28px]">{customerName}</div>
      </div>

      {/* Table */}
      <table className="w-full mb-6 border-collapse border-2 border-emerald-800 text-base">
        <thead>
          <tr className="bg-emerald-50/80 border-b-2 border-emerald-800 text-emerald-900">
            <th className="border-l border-emerald-800 p-3 text-center w-1/3">تاريخ</th>
            <th className="border-l border-emerald-800 p-3 text-center w-1/3">تعداد گولا</th>
            <th className="p-3 text-center w-1/3">رقم</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const isEmptyRow = !item.date && !item.qty && !item.amount && !item.rate;
            if (isEmptyRow) return null;
            return (
              <tr key={i} className="border-b border-emerald-800/60 h-10">
                <td className="border-l border-emerald-800/60 text-center font-mono text-indigo-900" dir="ltr">{item.date}</td>
                <td className="border-l border-emerald-800/60 text-center font-mono font-bold text-indigo-900" dir="ltr">{item.qty}</td>
                <td className="text-center font-mono font-bold text-indigo-900" dir="ltr">{item.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <table className="w-64 border-collapse border-2 border-emerald-800 text-base" dir="rtl">
           <tbody>
              {previousBalance ? (
                <tr className="border-b border-emerald-800 h-10">
                  <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right w-1/2">اڳ جي بقايہ</td>
                  <td className="text-center font-mono bg-transparent text-indigo-900" dir="ltr">{previousBalance}</td>
                </tr>
              ) : null}
              <tr className="border-b border-emerald-800 h-10">
                <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right">ٽوٽل بقايہ</td>
                <td className="p-2 text-center font-mono font-bold text-indigo-900 bg-emerald-50/30" dir="ltr">
                  {(totalAmount + (parseFloat(previousBalance) || 0)) || ''}
                </td>
              </tr>
              <tr className="border-b border-emerald-800 h-10">
                <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right">مليل رقم</td>
                <td className="text-center font-mono text-indigo-900" dir="ltr">{received || '-----'}</td>
              </tr>
              <tr className="h-10">
                <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-50/80 text-emerald-900 text-right">بقايہ رقم</td>
                <td className="p-2 text-center font-mono font-bold text-red-700 bg-emerald-50/30" dir="ltr">
                  {totalBalance || ''}
                </td>
              </tr>
           </tbody>
         </table>
      </div>

      {/* Signature */}
      <div className="flex justify-start mt-12 pt-8">
         <div className="relative border-t-2 border-emerald-800 w-48 text-center pt-2 font-bold text-lg text-emerald-900 mt-6">
          <div 
            className="absolute bottom-full left-0 w-full text-center" 
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: '#047857', fontWeight: 'normal', lineHeight: '1' }}
            dir="ltr"
          >
            Murtaza
          </div>
          دستخط
        </div>
      </div>
    </div>
  );
});
