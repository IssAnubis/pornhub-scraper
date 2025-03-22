// Function to clean the title (remove unwanted characters or encode HTML)
function cleanTitle(title) {
    return title
        .replace(/&#8217;/g, "'")  // Replace HTML entity for apostrophes
        .replace(/&#8211;/g, "-")  // Replace HTML entity for dashes
        .replace(/&#[0-9]+;/g, ""); // Remove any remaining HTML entities
}

// Function to parse search results from the HTML response
function searchResults(html) {
    const results = [];
    const baseUrl = "https://www.pornhub.com";
    
    // Regex to match video links and titles in search results
    const filmListRegex = /<div class="videoBox"[\s\S]*?<\/div>/g;
    const items = html.match(filmListRegex) || [];

    items.forEach((itemHtml) => {
        const titleMatch = itemHtml.match(/<a href="([^"]+)">([^<]+)<\/a>/);
        const href = titleMatch ? titleMatch[1] : '';
        let title = titleMatch ? titleMatch[2] : '';  
        title = cleanTitle(title); // Clean the title before adding
        const imgMatch = itemHtml.match(/<img[^>]*class="img"[^>]*src="([^"]+)"[^>]*>/);
        const imageUrl = imgMatch ? imgMatch[1] : '';

        if (title && href) {
            results.push({
                title: title.trim(),
                image: imageUrl.trim(),
                href: baseUrl + href.trim()  // Make sure to append base URL to relative href
            });
        }
    });

    return results;  // Return an array of search results
}

// Function to extract detailed information about a video
function extractDetails(html) {
    const details = [];

    // Extract description of the video
    const descriptionMatch = html.match(/<meta name="description" content="([^"]+)"/);
    let description = descriptionMatch ? descriptionMatch[1] : '';

    // Extract the aliases/keywords
    const aliasesMatch = html.match(/<div class="keywords">([\s\S]*?)<\/div>/);
    let aliases = aliasesMatch ? aliasesMatch[1] : '';

    // Extract the release year or date
    const airdateMatch = html.match(/<div class="date">([^<]+)<\/div>/);
    let airdate = airdateMatch ? airdateMatch[1] : '';

    if (description && airdate) {
        details.push({
            description: description.trim(),
            aliases: aliases.trim() || 'N/A',
            airdate: airdate.trim()
        });
    }

    return details;  // Return the details extracted
}

// Function to extract episodes (if applicable)
function extractEpisodes(html) {
    const episodes = [];
    const baseUrl = "https://www.pornhub.com";

    const episodeLinks = html.match(/<a class="episodeLink"[^>]*href="([^"]+)"/g);
    
    if (!episodeLinks) {
        return episodes;  // No episodes found
    }

    episodeLinks.forEach(link => {
        const hrefMatch = link.match(/href="([^"]+)"/);

        if (hrefMatch) {
            let href = hrefMatch[1];
            if (!href.startsWith("https")) {
                href = baseUrl + href;  // Ensure the full URL is formed
            }

            episodes.push({
                href: href.trim()
            });
        }
    });

    episodes.reverse();  // Reverse to have the latest episode first
    return episodes;
}

// Function to extract the streaming video URL from a video page
function extractStreamUrl(html) {
    const sourceRegex = /<source[^>]+id="player"[^>]+src="([^"]+)"/;
    const match = html.match(sourceRegex);
    return match ? match[1] : null;  // Return the stream URL or null if not found
}
