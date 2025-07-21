// services/utils.js

/**
 * Normalizes a name into a standard format (uppercase, words sorted alphabetically).
 * @param {string} name - The name to normalize.
 * @returns {string} - The normalized name.
 */
function normalizeName(name) {
    if (!name || typeof name !== 'string') {
        return '';
    }
    
    return name
        .toUpperCase()         // Convert to uppercase
        .split(' ')            // Split into an array of words
        .filter(word => word)  // Remove any empty strings from double spaces
        .sort()                // Sort the words alphabetically
        .join(' ');            // Join them back with a single space
}

module.exports = { normalizeName };