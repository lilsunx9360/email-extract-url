import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Home = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [emails, setEmails] = useState([]);
  const [taskId, setTaskId] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleReset = () => {
    setTextareaValue('');
    setEmails([]);
    setTaskId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clear file input
    }
  };

  const handleExtract = async () => {
    if (!textareaValue.trim() && !fileInputRef.current?.files[0]) {
      alert('Please enter URLs or upload an Excel file.');
      return;
    }

    setShowPopup(true);
    const formData = new FormData();
    if (fileInputRef.current?.files[0]) formData.append('excelFile', fileInputRef.current.files[0]);
    if (textareaValue.trim()) formData.append('urls', textareaValue);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setTaskId(data.taskId);
      pollTaskStatus(data.taskId);
    } catch (error) {
      console.error('Error:', error);
      setShowPopup(false);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const domains = jsonData.flat().filter(Boolean).join('\n');
      setTextareaValue(domains);
    };
    reader.readAsArrayBuffer(file);
  };

  const pollTaskStatus = (taskId) => {
    const interval = setInterval(async () => {
      const response = await fetch(`http://localhost:5000/api/task/${taskId}`);
      const task = await response.json();
      if (task.status === 'completed') {
        clearInterval(interval);
        fetchEmails(taskId);
        setShowPopup(false); // Hide popup when done
      }
    }, 5000); // Poll every 5 seconds
  };

  const fetchEmails = async (taskId) => {
    const response = await fetch(`http://localhost:5000/api/emails/${taskId}`);
    const emails = await response.json();
    setEmails(emails);
  };

  const downloadCSV = () => {
    const csv = emails.map(e => `${e.email},${e.url}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emails.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <div className="text-2xl font-bold text-cyan-400">Email Finder</div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="hover:underline focus:outline-none"
          >
            My Account
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Section */}
      <div className="flex flex-col items-center justify-center mt-16 px-4">
        <h1 className="text-3xl font-bold mb-4">Web Email Finder</h1>
        <p className="mb-6 text-center max-w-xl text-gray-300">
          Extract email addresses and phone numbers from any website!
        </p>

        <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-4xl">
          {/* Labels Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <label className="text-red-400 font-semibold mb-2 md:mb-0">
              Enter one domain/URL per line: *
            </label>
            <div>
              <label className="text-green-300 font-semibold mr-2">Upload Excel Sheet:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="text-black"
              />
            </div>
          </div>

          {/* Full Width Textarea */}
          <textarea
            rows="8"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            className="w-full p-2 rounded text-black"
            placeholder="e.g., example.com"
          ></textarea>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4 flex-wrap justify-start">
            <button
              onClick={handleExtract}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Extract Emails
            </button>
            <button
              onClick={handleReset}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Email Results Table */}
        {emails.length > 0 && (
          <div className="mt-6 w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-2">Extracted Emails</h2>
            <table className="w-full bg-gray-800 rounded shadow-md">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 border-b">Email</th>
                  <th className="p-2 border-b">URL</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{email.email}</td>
                    <td className="p-2">{email.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={downloadCSV}
            >
              Download CSV
            </button>
          </div>
        )}

        {taskId && (
          <p className="mt-4 text-gray-400">Task ID: {taskId} - Processing...</p>
        )}

        {/* Popup Box */}
        {showPopup && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-[300px] h-[300px] bg-white text-black rounded-lg shadow-lg 
                          flex items-center justify-center text-center text-xl font-semibold z-50">
            Email is scrapping,<br />wait a minute...
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;