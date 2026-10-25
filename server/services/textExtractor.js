const fs = require("fs");
const path = require("path");
const pdfModule = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Clean and normalize extracted text to remove excessive spacing and control chars
 */
function cleanExtractedText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

/**
 * Extract plain text from PDF file buffer
 * Fully compatible with pdf-parse v2.x (class-based PDFParse) and v1.x (function-based)
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    // 1. pdf-parse v2.x API (Class-based PDFParse)
    const PDFParseClass = pdfModule.PDFParse || (typeof pdfModule === "function" ? pdfModule : null);
    if (pdfModule.PDFParse && typeof pdfModule.PDFParse === "function") {
      const parser = new pdfModule.PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
      return result.text || "";
    }

    // 2. pdf-parse v1.x API (Direct function call)
    if (typeof pdfModule === "function") {
      const data = await pdfModule(dataBuffer);
      return data.text || "";
    }

    // 3. Fallback for ES module default exports
    if (pdfModule.default && typeof pdfModule.default === "function") {
      const data = await pdfModule.default(dataBuffer);
      return data.text || "";
    }

    throw new Error("Compatible PDFParse function/class could not be resolved from pdf-parse module.");
  } catch (error) {
    console.error("PDF Parsing Error:", error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract plain text from DOCX file buffer
 */
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  } catch (error) {
    console.error("DOCX Parsing Error:", error.message);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Unified Resume Text Extractor
 * Automatically handles .pdf and .docx files
 *
 * @param {string} filePath - Absolute or relative path to uploaded file
 * @param {string} originalName - Original uploaded filename
 * @returns {Promise<string>} - Clean plain text representation of resume
 */
async function extractResumeText(filePath, originalName = "") {
  const ext = path.extname(originalName || filePath).toLowerCase();
  let text = "";

  if (ext === ".pdf") {
    text = await extractTextFromPDF(filePath);
  } else if (ext === ".docx" || ext === ".doc") {
    text = await extractTextFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file extension (${ext}). Only .pdf and .docx are supported.`);
  }

  const cleaned = cleanExtractedText(text);

  if (!cleaned || cleaned.length < 20) {
    console.warn(`Warning: Resume text extraction produced very little text (${cleaned.length} chars). File might be scanned or image-based.`);
  }

  return cleaned;
}

module.exports = {
  extractResumeText,
  cleanExtractedText,
};