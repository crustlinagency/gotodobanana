/**
 * Strips HTML tags and returns plain text
 * Used for displaying task description previews
 */
export function stripHtml(html: string): string {
    if (!html) return "";
    
    // Create a temporary div to parse HTML
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    
    // Get text content and clean up whitespace
    const text = tmp.textContent || tmp.innerText || "";
    return text.trim().replace(/\s+/g, " ");
}

/**
 * Truncates text to a maximum length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
}

/**
 * Strips HTML and truncates for clean task previews
 */
export function getTaskPreview(html: string, maxLength: number = 100): string {
    const plainText = stripHtml(html);
    return truncateText(plainText, maxLength);
}