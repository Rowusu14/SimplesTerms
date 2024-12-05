import React, { useState } from 'react';
import PDFReader from './PDFReader';

const PDFUpload = () => {
  const [file, setFile] = useState(null);

  // Handle file input changes
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div>
      <h2>Upload PDF</h2>
      <input type="file" accept="application/pdf" onChange={onFileChange} />
      {file && <PDFReader file={file} />} {/* Pass the file prop to PDFReader */}
    </div>
  );
};

export default PDFUpload;
