
export type LetterType = 'masuk' | 'keluar';

export interface BaseLetter {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  perihal: string;
  kategori: string;
  keterangan?: string;
  attachmentName?: string;
}

export interface SuratMasuk extends BaseLetter {
  pengirim: string;
  tanggalTerima: string;
}

export interface SuratKeluar extends BaseLetter {
  tujuan: string;
  lampiran?: string;
}

export interface LetterTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface GeneratedLetter {
  nomor: string;
  perihal: string;
  tujuan: string;
  content: string;
  tanggal: string;
}
