declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    theme?: string;
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    didDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
} 