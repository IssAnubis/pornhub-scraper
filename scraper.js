// Function to clean and format the title
function cleanTitle(title) {
    return title
        .replace(/&#8217;/g, "'")  
        .replace(/&#8211;/g, "-")  
        .replace(/&#[0-9]+;/g, "");
}

// Function to extract search results from HentaiHaven search page
function searchResults(html) {
    const results = [];
    
    // Regular expression to match video elements
    const filmListRegex = /<div class="video-block"[\s\S]*?<\/div>/g;
    const items = html.match(filmListRegex) || [];

    items.forEach((itemHtml) => {
        const titleMatch = itemHtml.match(/<a href="([^"]+)"[^>]*title="([^"]+)"/);
        const href = titleMatch ? titleMatch[1] : '';
        let title = titleMatch ? titleMatch[2] : '';
        title = cleanTitle(title);

        // Match the thumbnail image URL
        const imgMatch = itemHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        if (title && href) {
            results.push({
                title: title.trim(),
                image: imageUrl.trim(),
                href: href.trim()
            });
        }
    });

    return results;
}

// Function to extract video details
function extractDetails(html) {
    const details = [];

    // Extract description
    const descriptionMatch = html.match(/<div class="post-content"[^>]*>\s*<p>([^<]+)<\/p>/);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    // Extract aliases (title alternative)
    const aliasesMatch = html.match(/<h1 class="post-title">([^<]+)<\/h1>/);
    const aliases = aliasesMatch ? aliasesMatch[1] : '';

    if (description) {
        details.push({
            description: description,
            aliases: aliases || 'N/A'
        });
    }

    return details;
}

// Function to extract the stream URL from the video page
function extractStreamUrl(html) {
    // Search for the direct video stream URL in the HTML source
    const sourceRegex = /<source[^>]+src="([^"]+)"/;
    const match = html.match(sourceRegex);
    return match ? match[1] : null;
}

// Export functions for Sora
module.exports = {
    cleanTitle,
    searchResults,
    extractDetails,
    extractStreamUrl
};