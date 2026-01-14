
import React from 'react';
import { GeneratedLetter } from '../types';

interface LetterPreviewProps {
  data: GeneratedLetter;
  schoolName: string;
  address: string;
  logoSekolah?: string;
  logoDaerah?: string;
  pemerintahDaerah?: string;
  dinasPendidikan?: string;
  email?: string;
  telp?: string;
}

const LetterPreview: React.FC<LetterPreviewProps> = ({ 
  data, 
  schoolName, 
  address,
  logoSekolah,
  logoDaerah,
  pemerintahDaerah,
  dinasPendidikan,
  email,
  telp
}) => {
  return (
    <div className="bg-white p-12 md:p-16 shadow-2xl min-h-[1100px] border border-slate-200 text-slate-900 max-w-[210mm] mx-auto print:shadow-none print:border-none print:p-0 print:m-0 overflow-hidden">
      {/* Kop Surat */}
      <div className="text-center border-b-4 border-double border-black pb-4 mb-8 relative flex items-center justify-between">
        {/* Logo Daerah (Kiri) */}
        <div className="w-24 h-24 flex items-center justify-center">
          {logoDaerah ? (
            <img src={logoDaerah} alt="Logo Daerah" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-[8px] text-slate-400 uppercase font-bold text-center p-1">
              LOGO DAERAH
            </div>
          )}
        </div>

        {/* Teks Identitas */}
        <div className="flex-1 px-4">
          <h2 className="text-[14pt] font-bold uppercase tracking-tight leading-tight">
            {pemerintahDaerah || 'PEMERINTAH KABUPATEN / KOTA'}
          </h2>
          <h2 className="text-[12pt] font-bold uppercase leading-tight">
            {dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
          </h2>
          <h1 className="text-[16pt] font-bold uppercase tracking-wider mt-1 mb-1">
            {schoolName}
          </h1>
          <p className="text-[10pt] font-medium leading-tight">
            {address}
          </p>
          <div className="text-[9pt] italic mt-1">
            {email && <span className="mr-3">Email: {email}</span>}
            {telp && <span>Telp: {telp}</span>}
          </div>
        </div>

        {/* Logo Sekolah (Kanan) */}
        <div className="w-24 h-24 flex items-center justify-center">
          {logoSekolah ? (
            <img src={logoSekolah} alt="Logo Sekolah" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-[8px] text-slate-400 uppercase font-bold text-center p-1">
              LOGO SEKOLAH
            </div>
          )}
        </div>
      </div>

      {/* Konten Surat */}
      <div className="space-y-6 text-[11pt] leading-relaxed font-serif">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-0.5">
            <p><span className="inline-block w-20">Nomor</span> : {data.nomor}</p>
            <p><span className="inline-block w-20">Lampiran</span> : -</p>
            <p><span className="inline-block w-20">Perihal</span> : <strong>{data.perihal}</strong></p>
          </div>
          <div className="text-right">
            <p>{data.tanggal}</p>
          </div>
        </div>

        <div className="mt-8 space-y-0.5">
          <p>Kepada Yth.</p>
          <p className="font-bold">{data.tujuan}</p>
          <p>Di Tempat</p>
        </div>

        <div className="mt-10 text-justify space-y-4" dangerouslySetInnerHTML={{ __html: data.content }} />

        <div className="mt-24 flex justify-end">
          <div className="text-center w-72">
            <p>Mengetahui,</p>
            <p className="font-medium">Kepala {schoolName}</p>
            <div className="h-24"></div>
            <p className="font-bold underline uppercase">NAMA KEPALA SEKOLAH, S.Pd.</p>
            <p className="text-[10pt]">NIP. 19800101 200501 1 001</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterPreview;
