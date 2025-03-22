// Function to clean and format the title
function cleanTitle(title) {
    return title
        .replace(/&#8217;/g, "'")  
        .replace(/&#8211;/g, "-")  
        .replace(/&#[0-9]+;/g, "");
}

// Function to extract search results from the HTML of the search page
function searchResults(html) {
    const results = [];
    
    // Regular expression to match video elements in the HTML
    const filmListRegex = /<div class="video-wrapper"[\s\S]*?<\/div>/g;
    const items = html.match(filmListRegex) || [];

    items.forEach((itemHtml) => {
        const titleMatch = itemHtml.match(/<a href="([^"]+)">([^<]+)<\/a>/);
        const href = titleMatch ? titleMatch[1] : '';
        let title = titleMatch ? titleMatch[2] : '';
        title = cleanTitle(title);

        // Match the thumbnail image URL
        const imgMatch = itemHtml.match(/<img[^>]*class="thumb"[^>]*src="([^"]+)"[^>]*>/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        // If title and href are found, push the result
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

// Function to extract detailed information from the video page
function extractDetails(html) {
    const details = [];

    // Extract description
    const descriptionMatch = html.match(/<meta name="description" content="([^"]+)">/);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    // Extract aliases (sometimes this can be the title of the video)
    const aliasesMatch = html.match(/<title>([^<]+)<\/title>/);
    const aliases = aliasesMatch ? aliasesMatch[1] : '';

    // Extract year of release
    const airdateMatch = html.match(/<div class="textd">Year:<\/div>\s*<div class="textc">([^<]+)<\/div>/);
    const airdate = airdateMatch ? airdateMatch[1] : '';

    if (description && airdate) {
        details.push({
            description: description,
            aliases: aliases || 'N/A',
            airdate: airdate
        });
    }

    return details;
}

// Function to extract episode information (if applicable)
function extractEpisodes(html) {
    const episodes = [];

    const episodeLinks = html.match(/<a href="([^"]+)"[^>]*><div class="centerv">(\d+)<\/div>/g);
    
    if (!episodeLinks) return episodes;

    episodeLinks.forEach((link) => {
        const hrefMatch = link.match(/href="([^"]+)"/);
        const numberMatch = link.match(/<div class="centerv">(\d+)<\/div>/);

        if (hrefMatch && numberMatch) {
            let href = hrefMatch[1];
            const number = numberMatch[1];

            episodes.push({
                href: href,
                number: number
            });
        }
    });

    return episodes;
}

// Function to extract the stream URL for the video
function extractStreamUrl(html) {
    // Search for the direct video stream URL in the HTML source
    const sourceRegex = /<source[^>]+id="iframevideo"[^>]+src="([^"]+)"/;
    const match = html.match(sourceRegex);
    return match ? match[1] : null;
}

// Export all functions as needed by Sora
module.exports = {
    cleanTitle,
    searchResults,
    extractDetails,
    extractEpisodes,
    extractStreamUrl
};
