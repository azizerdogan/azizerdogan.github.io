import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { cropCanvasWhitespace } from '../../utils/cropCanvasWhitespace';
import styles from './ResumeWindow.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type PdfPageProps = {
  pdf: pdfjs.PDFDocumentProxy;
  pageNumber: number;
  width: number;
  onRendered?: () => void;
};

function PdfPage({ pdf, pageNumber, width, onRendered }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onRenderedRef = useRef(onRendered);
  onRenderedRef.current = onRendered;

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;

      const unscaled = page.getViewport({ scale: 1 });
      const scale = width / unscaled.width;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: canvas.getContext('2d')!,
        viewport,
        canvas,
      }).promise;

      if (cancelled) return;
      cropCanvasWhitespace(canvas);
      onRenderedRef.current?.();
    }

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, width]);

  return <canvas ref={canvasRef} className={styles.pdfPage} />;
}

type PdfViewerProps = {
  src: string;
  width: number;
  onLayoutChange?: () => void;
};

export function PdfViewer({ src, width, onLayoutChange }: PdfViewerProps) {
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const renderedPagesRef = useRef(0);
  const onLayoutChangeRef = useRef(onLayoutChange);
  onLayoutChangeRef.current = onLayoutChange;

  useEffect(() => {
    let cancelled = false;

    pdfjs.getDocument({ url: src }).promise.then((doc) => {
      if (!cancelled) {
        renderedPagesRef.current = 0;
        setPdf(doc);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    renderedPagesRef.current = 0;
  }, [width]);

  const handlePageRendered = useCallback(() => {
    if (!pdf) return;
    renderedPagesRef.current += 1;
    if (renderedPagesRef.current >= pdf.numPages) {
      onLayoutChangeRef.current?.();
    }
  }, [pdf]);

  if (!pdf) {
    return (
      <div className={styles.pdfViewer}>
        <div className={styles.pdfLoading} />
      </div>
    );
  }

  return (
    <div className={styles.pdfViewer}>
      {Array.from({ length: pdf.numPages }, (_, index) => (
        <PdfPage
          key={`${width}-${index + 1}`}
          pdf={pdf}
          pageNumber={index + 1}
          width={width}
          onRendered={handlePageRendered}
        />
      ))}
    </div>
  );
}
