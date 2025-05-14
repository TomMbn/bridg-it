import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    previousAutoTable: {
      finalY: number;
    };
  }
} 