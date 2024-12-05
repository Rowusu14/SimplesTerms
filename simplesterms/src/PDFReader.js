import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

const PDFReader = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Set the worker path for react-pdf
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
  }, []);

  // Callback to set the number of pages when the document is loaded
  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Function to go to the previous page
  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  // Function to go to the next page
  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
  };

  return (
    <div>
      <div>
        <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
          Previous
        </button>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
          Next
        </button>
      </div>

      <div>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    </div>
  );
};

export default PDFReader;
