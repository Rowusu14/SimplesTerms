import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist"; // Needed to read PDF files

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>

// Set PDF.js up (online tutorial used for this)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
// List of common words to exclude
// List of common words to exclude
const stopWords = [
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", 
  "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "couldnt", "did", "didn't", 
  "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "hadnt", "has", 
  "hasn't", "hasnt", "have", "haven't", "haven't", "having", "he", "his", "he'd", "he'll", "he's", "her", "here", "here's", "here's", "hers", 
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
  const [wordCounts, setWordCounts] = useState([]); // State to store the top 10 words
  const [summary, setSummary] = useState(""); // State for API-generated summary
  const [mode, setMode] = useState("file"); // State to track current mode {NEW}

  // Handle file upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];  // Get the uploaded file

    if (file) {
      setLoading(true);  // Start loading
      setError("");  // Clear previous errors, if needed
      setWordCounts([]);  // Reset previous word counts from previous files, if needed

      // If the file is a PDF
      if (file.type === "application/pdf") {
        const reader = new FileReader();

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

            setFileText(text);
            calculateWordFrequency(text);

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
        const reader = new FileReader();

        reader.onload = (e) => {
          const text = e.target.result;
          setFileText(text);  // Set the text content directly from the file
          calculateWordFrequency(text);  // Calculate word frequencies
          setLoading(false);  // Stops loading display
        };

        reader.readAsText(file);
      } else {
        setError("Please upload a valid PDF or TXT file.");
        setLoading(false); 
      }
    }
  };

  const calculateWordFrequency = (text) => {
    const words = text
      .toLowerCase() // So count isn't case sensitive
      .replace(/[^\w\s]/g, "") // Removes punctuation
      .split(/\s+/); // Split text into words by spaces

    const wordMap = {};

    // Counting frequencies
    words.forEach((word) => {
      if (word && !stopWords.includes(word) && word.length > 1) {
        wordMap[word] = (wordMap[word] || 0) + 1;
      }
    });

    // Sorting
    const sortedWords = Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1]) // Sorting by frequency
      .slice(0, 10); // Taking the top 10
    setWordCounts(sortedWords); // Update the word count state
  };

  // This is where it calls the API, happens on button press
  const summarizeText = async () => {
    setLoading(true);
    setSummary("");
    setError("");
  
    try {
      const response = await fetch("https://backend2-etep.onrender.com/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: fileText }),
      });
  
      if (!response.ok) {
        throw new Error(`Backend Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
  
      setSummary(data.summary);
    } catch (err) {
      console.error("Error calling backend:", err);
      setError("Failed to Summarize Text. This is likely due to your document being too long.");
    } finally {
      setLoading(false);
    }
  };
  
  //THIS IS WHAT THE USER SEES
  return (
    <div className="container mt-5">
      <h4 align="center">Select Your Input Type</h4>
      <div className="mb-3" align="center">
      <button 
          className={`btn ${mode === "file" ? "btn-primary" : "btn-outline-primary"}`} 
          onClick={() => setMode("file")}
        >
        	<i class="far fa-file"/> &nbsp; File (.TXT or .PDF)
        </button> &nbsp; &nbsp;
        <button 
          className={`btn ${mode === "text" ? "btn-primary" : "btn-outline-primary"}`} 
          onClick={() => setMode("text")}
        >
        <i class="fas fa-align-center"/> &nbsp; Raw Text
        </button>
      </div>
      
      {mode === "file" ? (
        <div>
          <h2 align="center">Upload Your File Here!</h2>
          <input
            type="file"
            accept=".pdf, .txt"
            onChange={handleFileChange}
            className="form-control mb-3"
          />
        </div>
      ) : (
        <div>
          <h2 align="center">Enter Your Text Here!</h2>
          <textarea
            className="form-control mb-3"
            rows="10"
            onChange={(e) => setFileText(e.target.value)}
            value={fileText}
          ></textarea>
        </div>
      )}

      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>} {/* Show error message */}

      {wordCounts.length > 0 && (
        <div className="mt-4">
          <h4>Top 10 Most Frequent "Buzz Words":</h4>
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
        <button
          className="btn btn-primary mt-3"
          onClick={summarizeText}
        >
          Summarize Text
        </button>
      )}

      {summary && (
        <div className="mt-4">
          <h4>Summary:</h4>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default FileReaderComponent;
