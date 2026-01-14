
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Filter, Mail, Send, 
  BarChart3, FileText, Download, Printer, 
  ChevronRight, AlertCircle, Loader2, Trash2,
  Paperclip, Calendar, X, Upload, FolderOpen,
  Edit3, Eye, CheckCircle2, Copy, FileStack,
  Image as ImageIcon, MapPin, Phone, Globe, Building2,
  Settings, School, UserPlus, Handshake, Briefcase,
  Save, RefreshCw
} from 'lucide-react';
import Sidebar from './components/Sidebar.tsx';
import LetterPreview from './components/LetterPreview.tsx';
import { generateLetterDraft } from './services/geminiService.ts';
import { SuratMasuk, SuratKeluar, GeneratedLetter, LetterTemplate } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>([]);
  
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'SD NEGERI HARAPAN BANGSA 01',
    address: 'Jl. Pendidikan No. 45, Kebon Jeruk, Jakarta Barat, 11530',
    logoSekolah: '', 
    logoDaerah: '',  
    pemerintahDaerah: 'PEMERINTAH PROVINSI DKI JAKARTA',
    dinasPendidikan: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    email: 'sdn.hb01@jakarta.go.id',
    telp: '(021) 1234567'
  });

  const [isLoading, setIsLoading] = useState(true);

  // Persistence Logic: Load from Local Storage
  useEffect(() => {
    try {
      const savedMasuk = localStorage.getItem('suratMasuk');
      const savedKeluar = localStorage.getItem('suratKeluar');
      const savedSettings = localStorage.getItem('schoolSettings');

      if (savedMasuk) setSuratMasuk(JSON.parse(savedMasuk));
      if (savedKeluar) setSuratKeluar(JSON.parse(savedKeluar));
      if (savedSettings) setSchoolSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.error("Gagal memuat data dari LocalStorage", e);
    }

    setIsLoading(false);
  }, []);

  // Filter & UI State
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'masuk' | 'keluar'>('masuk');

  // New Letter Form State
  const [newLetter, setNewLetter] = useState<any>({
    nomorSurat: '',
    perihal: '',
    pengirim: '',
    tujuan: '',
    tanggalSurat: new Date().toISOString().split('T')[0],
    kategori: 'Biasa',
    attachmentName: '',
    attachmentUrl: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Generator & Editor State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [letterPrompt, setLetterPrompt] = useState('');

  const templates: LetterTemplate[] = [
    { id: '1', title: 'Undangan Rapat', icon: 'Mail', description: 'Rapat wali murid, komite, atau dinas.' },
    { id: '2', title: 'Surat Tugas', icon: 'FileStack', description: 'Penugasan guru atau staf sekolah.' },
    { id: '3', title: 'SPPD', icon: 'Briefcase', description: 'Surat Perintah Perjalanan Dinas resmi.' },
    { id: '4', title: 'Mutasi Masuk', icon: 'UserPlus', description: 'Keterangan penerimaan siswa pindahan.' },
    { id: '5', title: 'Surat Keterangan', icon: 'FileText', description: 'Surat keterangan umum siswa atau guru.' },
    { id: '6', title: 'MOU Ekskul', icon: 'Handshake', description: 'Perjanjian kerjasama ekstrakurikuler.' },
    { id: '7', title: 'Panggilan Siswa', icon: 'AlertCircle', description: 'Panggilan untuk orang tua/wali.' },
    { id: '8', title: 'Izin Kegiatan', icon: 'Send', description: 'Permohonan izin lokasi atau acara.' },
    { id: '9', title: 'Keterangan Lulus', icon: 'CheckCircle2', description: 'Surat resmi kelulusan siswa.' },
  ];

  const months = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  const filteredSuratMasuk = useMemo(() => {
    return suratMasuk.filter(s => {
      const matchMonth = filterMonth === 'all' || s.tanggalSurat.split('-')[1] === filterMonth;
      const matchSearch = (s.perihal || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.nomorSurat || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchMonth && matchSearch;
    });
  }, [suratMasuk, filterMonth, searchTerm]);

  const filteredSuratKeluar = useMemo(() => {
    return suratKeluar.filter(s => {
      const matchMonth = filterMonth === 'all' || s.tanggalSurat.split('-')[1] === filterMonth;
      const matchSearch = (s.perihal || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.nomorSurat || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchMonth && matchSearch;
    });
  }, [suratKeluar, filterMonth, searchTerm]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const result = await generateLetterDraft(selectedTemplate.title, letterPrompt, schoolSettings.name);
      setGeneratedLetter(result);
      setIsEditing(true);
    } catch (err) {
      alert('Gagal membuat surat. Pastikan koneksi internet aktif dan API Key valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewLetter({ ...newLetter, attachmentName: file.name, attachmentUrl: reader.result as string });
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleManualSave = () => {
    const letterWithId = { ...newLetter, id: Date.now().toString() };
    
    if (modalType === 'masuk') {
      const updated = [{ ...letterWithId, tanggalTerima: new Date().toISOString().split('T')[0] }, ...suratMasuk];
      setSuratMasuk(updated);
      localStorage.setItem('suratMasuk', JSON.stringify(updated));
    } else {
      const updated = [letterWithId, ...suratKeluar];
      setSuratKeluar(updated);
      localStorage.setItem('suratKeluar', JSON.stringify(updated));
    }

    setShowAddModal(false);
    setNewLetter({
      nomorSurat: '', perihal: '', pengirim: '', tujuan: '',
      tanggalSurat: new Date().toISOString().split('T')[0],
      kategori: 'Biasa', attachmentName: '', attachmentUrl: ''
    });
    alert('Arsip berhasil disimpan secara lokal!');
  };

  const handleSaveToArchive = () => {
    if (!generatedLetter) return;
    const newArchivedLetter = {
      id: Date.now().toString(),
      nomorSurat: generatedLetter.nomor,
      tanggalSurat: new Date().toISOString().split('T')[0],
      perihal: generatedLetter.perihal,
      kategori: 'Otomatis',
      tujuan: generatedLetter.tujuan
    };
    
    const updated = [newArchivedLetter, ...suratKeluar];
    setSuratKeluar(updated);
    localStorage.setItem('suratKeluar', JSON.stringify(updated));

    alert('Surat otomatis berhasil diarsipkan!');
    setGeneratedLetter(null);
    setIsEditing(false);
    setSelectedTemplate(null);
    setActiveTab('surat-keluar');
  };

  const handleUpdateSettings = () => {
    localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));
    alert('Pengaturan sekolah berhasil diperbarui!');
  };

  const handleDeleteLetter = (id: string, type: 'masuk' | 'keluar') => {
    if (!confirm('Hapus arsip ini?')) return;
    
    if (type === 'masuk') {
      const updated = suratMasuk.filter(s => s.id !== id);
      setSuratMasuk(updated);
      localStorage.setItem('suratMasuk', JSON.stringify(updated));
    } else {
      const updated = suratKeluar.filter(s => s.id !== id);
      setSuratKeluar(updated);
      localStorage.setItem('suratKeluar', JSON.stringify(updated));
    }
  };

  // --- FEATURE: BACKUP & RESTORE ---
  const handleExportData = () => {
    const data = {
      suratMasuk,
      suratKeluar,
      schoolSettings,
      backupDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-arsip-surat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Import data akan menimpa/menggabungkan dengan data saat ini. Lanjutkan?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.suratMasuk) {
          setSuratMasuk(json.suratMasuk);
          localStorage.setItem('suratMasuk', JSON.stringify(json.suratMasuk));
        }
        if (json.suratKeluar) {
          setSuratKeluar(json.suratKeluar);
          localStorage.setItem('suratKeluar', JSON.stringify(json.suratKeluar));
        }
        if (json.schoolSettings) {
          setSchoolSettings(json.schoolSettings);
          localStorage.setItem('schoolSettings', JSON.stringify(json.schoolSettings));
        }

        alert('Data berhasil dipulihkan (Restore)!');
      } catch (err) {
        alert('File backup tidak valid atau rusak.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };
  // ---------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="font-medium text-slate-400">Memuat Aplikasi...</p>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Mail size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Surat Masuk</p>
              <h3 className="text-2xl font-bold">{suratMasuk.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Send size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Surat Keluar</p>
              <h3 className="text-2xl font-bold">{suratKeluar.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><FolderOpen size={24} /></div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Arsip</p>
              <h3 className="text-2xl font-bold">{suratMasuk.length + suratKeluar.length}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h4 className="font-bold mb-4 text-slate-800">Aktivitas Terakhir</h4>
        <div className="space-y-3">
          {[...suratMasuk, ...suratKeluar].slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{s.perihal}</p>
                <p className="text-xs text-slate-400">{s.tanggalSurat} • {s.nomorSurat}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
          {suratMasuk.length + suratKeluar.length === 0 && <p className="text-slate-400 text-sm text-center py-10">Belum ada arsip surat.</p>}
        </div>
      </div>
    </div>
  );

  const renderAddModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Arsip {modalType === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}</h3>
            <p className="text-xs text-slate-400 font-medium">Data disimpan di browser Anda.</p>
          </div>
          <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Nomor Surat</label>
              <input 
                type="text" 
                value={newLetter.nomorSurat}
                onChange={(e) => setNewLetter({...newLetter, nomorSurat: e.target.value})}
                placeholder="421/001/..." 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Tanggal Surat</label>
              <input 
                type="date" 
                value={newLetter.tanggalSurat}
                onChange={(e) => setNewLetter({...newLetter, tanggalSurat: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Perihal Surat</label>
            <input 
              type="text" 
              value={newLetter.perihal}
              onChange={(e) => setNewLetter({...newLetter, perihal: e.target.value})}
              placeholder="Contoh: Undangan Rapat Komite" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              {modalType === 'masuk' ? 'Pengirim' : 'Pihak Tujuan'}
            </label>
            <input 
              type="text" 
              value={modalType === 'masuk' ? newLetter.pengirim : newLetter.tujuan}
              onChange={(e) => setNewLetter({...newLetter, [modalType === 'masuk' ? 'pengirim' : 'tujuan']: e.target.value})}
              placeholder={modalType === 'masuk' ? 'Dinas Pendidikan...' : 'Wali Murid Siswa...'}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Lampiran Digital</label>
            <div className="relative group">
              <div className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${uploadingFile ? 'bg-slate-100 border-slate-300' : 'border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:bg-blue-50'}`}>
                {uploadingFile ? (
                  <Loader2 className="animate-spin text-blue-500 mb-2" />
                ) : (
                  <Upload size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                )}
                <p className="text-xs font-bold text-center px-4">
                  {newLetter.attachmentName ? `Berhasil dipilih: ${newLetter.attachmentName}` : (uploadingFile ? 'Sedang memproses...' : 'Klik untuk Pilih Berkas')}
                </p>
              </div>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => setShowAddModal(false)}
            className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-200 rounded-2xl transition-all"
          >
            Batal
          </button>
          <button 
            disabled={!newLetter.nomorSurat || !newLetter.perihal || uploadingFile}
            onClick={handleManualSave}
            className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            Simpan Arsip
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
          <Settings size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Pengaturan & Manajemen Data</h3>
          <p className="text-sm text-slate-400 font-medium">Atur identitas sekolah dan cadangkan data Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-500" /> Logo Sekolah
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Logo Daerah</label>
                <div className="relative group w-32 h-32 mx-auto">
                  <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                    {schoolSettings.logoDaerah ? <img src={schoolSettings.logoDaerah} className="w-full h-full object-contain p-2" alt="Logo Daerah" /> : <Upload size={24} className="text-slate-300" />}
                  </div>
                  <input type="file" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSchoolSettings({...schoolSettings, logoDaerah: reader.result as string});
                      reader.readAsDataURL(file);
                    }
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Logo Sekolah</label>
                <div className="relative group w-32 h-32 mx-auto">
                  <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                    {schoolSettings.logoSekolah ? <img src={schoolSettings.logoSekolah} className="w-full h-full object-contain p-2" alt="Logo Sekolah" /> : <Upload size={24} className="text-slate-300" />}
                  </div>
                  <input type="file" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSchoolSettings({...schoolSettings, logoSekolah: reader.result as string});
                      reader.readAsDataURL(file);
                    }
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
          
          {/* BAGIAN BARU: MANAJEMEN DATA BACKUP/RESTORE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw size={18} className="text-purple-500" /> Cadangan Data
            </h4>
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download size={16} /> Backup Data (JSON)
              </button>
              
              <div className="relative">
                <button 
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Upload size={16} /> Restore Data (JSON)
                </button>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Unduh backup secara berkala untuk menghindari kehilangan data saat membersihkan browser.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" /> Detail Informasi
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Pemerintah Daerah</label><input type="text" value={schoolSettings.pemerintahDaerah} onChange={(e) => setSchoolSettings({...schoolSettings, pemerintahDaerah: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Dinas Pendidikan</label><input type="text" value={schoolSettings.dinasPendidikan} onChange={(e) => setSchoolSettings({...schoolSettings, dinasPendidikan: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm" /></div>
              <div className="space-y-2 md:col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Nama Sekolah</label><input type="text" value={schoolSettings.name} onChange={(e) => setSchoolSettings({...schoolSettings, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-bold" /></div>
              <div className="space-y-2 md:col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Alamat</label><textarea rows={2} value={schoolSettings.address} onChange={(e) => setSchoolSettings({...schoolSettings, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm"></textarea></div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button onClick={handleUpdateSettings} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Simpan Perubahan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplateSelector = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">Pembuat Surat AI</h3>
        <p className="text-slate-500">Gunakan kecerdasan buatan untuk menyusun draft surat resmi.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => setSelectedTemplate(tmpl)}
            className={`group p-6 rounded-3xl border-2 text-left transition-all duration-300 ${
              selectedTemplate?.id === tmpl.id ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-50' : 'border-white bg-white hover:border-slate-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedTemplate?.id === tmpl.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {tmpl.id === '1' && <Mail size={24} />}
              {tmpl.id === '2' && <FileStack size={24} />}
              {tmpl.id === '3' && <Briefcase size={24} />}
              {tmpl.id === '4' && <UserPlus size={24} />}
              {tmpl.id === '5' && <FileText size={24} />}
              {tmpl.id === '6' && <Handshake size={24} />}
              {tmpl.id === '7' && <AlertCircle size={24} />}
              {tmpl.id === '8' && <Send size={24} />}
              {tmpl.id === '9' && <CheckCircle2 size={24} />}
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{tmpl.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>
          </button>
        ))}
      </div>

      {selectedTemplate && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-blue-100 shadow-2xl space-y-6">
          <textarea 
            value={letterPrompt}
            onChange={(e) => setLetterPrompt(e.target.value)}
            placeholder={`Jelaskan detail untuk ${selectedTemplate.title}... (Contoh: Rapat kelulusan siswa hari Senin jam 08.00)`}
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all min-h-[120px] text-sm"
          ></textarea>
          <div className="flex gap-3">
            <button onClick={() => setSelectedTemplate(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl">Batal</button>
            <button disabled={isGenerating} onClick={handleGenerate} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />} Buat Draft AI
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderLetterEditor = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="space-y-6 no-print">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-3"><div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Edit3 size={20} /></div> Editor Draft</h4>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 p-2"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={generatedLetter?.nomor} onChange={(e) => setGeneratedLetter(prev => prev ? {...prev, nomor: e.target.value} : null)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Nomor Surat" />
            <input type="text" value={generatedLetter?.tanggal} onChange={(e) => setGeneratedLetter(prev => prev ? {...prev, tanggal: e.target.value} : null)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Tanggal" />
          </div>
          <input type="text" value={generatedLetter?.tujuan} onChange={(e) => setGeneratedLetter(prev => prev ? {...prev, tujuan: e.target.value} : null)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" placeholder="Tujuan" />
          <input type="text" value={generatedLetter?.perihal} onChange={(e) => setGeneratedLetter(prev => prev ? {...prev, perihal: e.target.value} : null)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Perihal" />
          <textarea value={generatedLetter?.content} onChange={(e) => setGeneratedLetter(prev => prev ? {...prev, content: e.target.value} : null)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[300px] font-mono"></textarea>
          <div className="pt-4 flex gap-3">
            <button onClick={handleSaveToArchive} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2"><Download size={20} /> Simpan ke Arsip</button>
            <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2"><Printer size={20} /> Cetak Sekarang</button>
          </div>
        </div>
      </div>
      <div className="sticky top-24">
        <div className="printable-wrapper bg-slate-200 p-8 rounded-3xl shadow-inner">
          {generatedLetter && (
            <LetterPreview 
              data={generatedLetter} schoolName={schoolSettings.name} address={schoolSettings.address}
              logoSekolah={schoolSettings.logoSekolah} logoDaerah={schoolSettings.logoDaerah}
              pemerintahDaerah={schoolSettings.pemerintahDaerah} dinasPendidikan={schoolSettings.dinasPendidikan}
              email={schoolSettings.email} telp={schoolSettings.telp}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-4 flex items-center justify-between no-print">
          <div><h2 className="text-xl font-bold text-slate-800">{activeTab === 'dashboard' ? 'Beranda' : activeTab === 'settings' ? 'Pengaturan' : 'Arsip Digital'}</h2><p className="text-xs text-slate-400">{schoolSettings.name}</p></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block"><p className="text-xs font-bold text-slate-800">Admin Tata Usaha</p><p className="text-[10px] text-blue-500 font-bold uppercase">Mode Penyimpanan Lokal</p></div>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">SD</div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'buat-surat' && (isEditing ? renderLetterEditor() : renderTemplateSelector())}
          {(activeTab === 'surat-masuk' || activeTab === 'surat-keluar') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Cari nomor atau perihal..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <select className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <button onClick={() => { setModalType(activeTab === 'surat-masuk' ? 'masuk' : 'keluar'); setShowAddModal(true); }} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2"><Plus size={18} /> Tambah Data</button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor & Tanggal</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perihal & Pihak Terkait</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Berkas</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeTab === 'surat-masuk' ? filteredSuratMasuk : filteredSuratKeluar).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 group">
                        <td className="px-6 py-4"><p className="text-sm font-bold text-slate-800">{s.nomorSurat}</p><p className="text-[11px] text-slate-400">{s.tanggalSurat}</p></td>
                        <td className="px-6 py-4"><p className="text-sm font-bold text-slate-800">{s.perihal}</p><p className="text-[11px] text-slate-400 uppercase font-bold">{(s as any).pengirim || (s as any).tujuan}</p></td>
                        <td className="px-6 py-4 text-center">
                          {s.attachmentName ? (
                            <a href={(s as any).attachmentUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold border border-blue-100 inline-flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                              <Eye size={12} /> Lihat Berkas
                            </a>
                          ) : <span className="text-slate-300 text-[10px]">TIDAK ADA LAMPIRAN</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDeleteLetter(s.id, activeTab === 'surat-masuk' ? 'masuk' : 'keluar')} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                    {(activeTab === 'surat-masuk' ? filteredSuratMasuk : filteredSuratKeluar).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">Data arsip tidak ditemukan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
      {showAddModal && renderAddModal()}
    </div>
  );
};

export default App;
