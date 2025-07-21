// services/ocr.js
const vision = require('@google-cloud/vision');
const path = require('path');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, '..', 'google-credentials.json')
});

/**
 * Uses Google Cloud Vision AI to extract text from an image.
 * @param {string} imagePath - The path to the image file.
 * @returns {Promise<string>} - A promise that resolves to the extracted text.
 */
async function getTextFromImage(imagePath) {
    try {
        const [result] = await client.textDetection(imagePath);
        const detections = result.textAnnotations;
        
        if (detections && detections.length > 0) {
            // The first annotation is the full text block.
            return detections[0].description;
        } else {
            return ''; // Return empty string if no text is found
        }
    } catch (error) {
        console.error('GOOGLE VISION API ERROR:', error);
        throw new Error('Failed to process image with Google Vision AI.');
    }
}

module.exports = { getTextFromImage };