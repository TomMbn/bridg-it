import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    theme?: string;
    headStyles?: any;
    alternateRowStyles?: any;
  }
  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  export default autoTable;
} 