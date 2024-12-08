import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist"; // Import pdf.js to read PDF files

// Set PDF.js worker source (this might fix the issues you're facing)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// List of common stop words to exclude
const stopWords = [
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", 
  "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "couldnt", "did", "didn't", 
  "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "hadnt", "has", 
  "hasn't", "hasnt", "have", "haven't", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "here's", "hers", 
  "herself", "he's", "how", "how's", "how'd", "how'd", "however", "i", "i'd", "i'll", "i'm", "i've", "i'm", "if", "i'll", "i'm", "i've", 
  "in", "into", "is", "isn't", "it", "it'd", "it'll", "it’s", "it's", "it’s", "it's", "its", "it's", "it'll", "it's", "i've", "i'm", "let's", 
  "let's", "more", "more", "most", "mustn't", "my", "myself", "myself", "my", "next", "no", "nor", "not", "of", "off", "on", "once", "only", 
  "or", "other", "ought", "ought", "our", "ours", "ourselves", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "should", 
  "shouldn't", "shouldnt", "so", "so", "some", "such", "than", "that", "that’s", "that's", "that’s", "that's", "their", "theirs", "them", 
  "themselves", "then", "there", "there's", "there's", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", 
  "this", "those", "through", "to", "too", "the", "under", "until", "up", "very", "was", "wasn't", "wasnt", "we", "we'd", "we'll", "we're", "we've",
  "we", "we're", "we've", "what", "what’s", "what's", "what", "which", "who", "who's", "who's", "whoever", "whom", "whose", "why", "why's", 
  "why", "why's", "why", "with", "won't", "would", "wouldn't", "wouldnt", "you", "you'd", "you'll", "you're", "you've", "you", "your", 
  "yourself", "yours", "yourselves", "you're", "you've", "you're", "your", "yourself"
];

const FileReaderComponent = () => {
  const [fileText, setFileText] = useState("");  // State to hold the text extracted from the file
  const [loading, setLoading] = useState(false);  // State to show loading spinner
  const [error, setError] = useState("");  // State to hold error messages
  const [wordCounts, setWordCounts] = useState([]); // State to store the top 20 word counts

  // Handle file upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];  // Get the uploaded file

    if (file) {
      setLoading(true);  // Start loading
      setError("");  // Clear previous errors
      setWordCounts([]);  // Reset previous word counts

      // If the file is a PDF
      if (file.type === "application/pdf") {
        const reader = new FileReader(); // Use the built-in FileReader API

        reader.onload = async (e) => {
          const typedArray = new Uint8Array(e.target.result);

          try {
            const pdf = await pdfjsLib.getDocument(typedArray).promise; // Load the PDF
            let text = "";

            // Extract text from each page of the PDF
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);  // Get each page of the PDF
              const textContent = await page.getTextContent();  // Extract text
              const pageText = textContent.items.map((item) => item.str).join(" ");
              text += pageText + "\n";  // Append the text from each page
            }

            setFileText(text);  // Set the extracted text to state
            calculateWordFrequency(text);  // Calculate word frequencies

          } catch (err) {
            console.error("Error reading PDF:", err);
            setError("Error reading PDF. Please try another file.");
          }

          setLoading(false);  // Stop loading
        };

        reader.readAsArrayBuffer(file);  // Read the PDF file as an ArrayBuffer
      }
      // If the file is a TXT file
      else if (file.type === "text/plain") {
        const reader = new FileReader(); // Use the built-in FileReader API

        reader.onload = (e) => {
          const text = e.target.result;
          setFileText(text);  // Set the text content directly from the file
          calculateWordFrequency(text);  // Calculate word frequencies
          setLoading(false);  // Stop loading
        };

        reader.readAsText(file);  // Read the TXT file as text
      } else {
        setError("Please upload a valid PDF or TXT file.");
        setLoading(false);  // Stop loading
      }
    }
  };

  // Function to calculate the word frequency, excluding stop words and words with less than 2 characters
  const calculateWordFrequency = (text) => {
    const words = text
      .toLowerCase() // Convert to lowercase
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .split(/\s+/); // Split text into words by whitespace

    const wordMap = {};

    // Count frequency of each word, excluding stop words and words with less than 2 characters
    words.forEach((word) => {
      if (word && !stopWords.includes(word) && word.length > 1) {
        wordMap[word] = (wordMap[word] || 0) + 1;
      }
    });

    // Sort words by frequency and get the top 20
    const sortedWords = Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency (high to low)
      .slice(0, 20); // Take the top 20

    setWordCounts(sortedWords); // Update the word count state
  };

  return (
    <div className="container mt-5">
      <h2>Upload Here!</h2>
      <input
        type="file"
        accept=".pdf, .txt"
        onChange={handleFileChange}
        className="form-control mb-3"
      />

      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>} {/* Show error message */}

      {/* Display word frequency count */}
      {wordCounts.length > 0 && (
        <div className="mt-4">
          <h4>Top 20 Most Frequent "Buzz Words":</h4>
          <ul>
            {wordCounts.map(([word, count], index) => (
              <li key={index}>
                {word}: {count} times
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && fileText && (
        <div>
          <h4>Extracted Text:</h4>
          <textarea
            className="form-control"
            rows="15"
            value={fileText}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

export default FileReaderComponent;
