import React, { useState } from "react";

const FileReader = () => {
  const [fileContent, setFileContent] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result); // Set the file content to state
      };
      reader.readAsText(file); // Adjust to `readAsArrayBuffer`, `readAsDataURL`, etc., based on file type
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <textarea 
        rows="10" 
        cols="50" 
        value={fileContent} 
        readOnly
      />
    </div>
  );
};

export default FileReader;
