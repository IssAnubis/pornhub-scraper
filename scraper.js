function searchResults(html) {
    const results = [];
    
    // Ensure the regex matches the video container correctly
    const filmListRegex = /<div class="video-item"[\s\S]*?<\/div>/g;  // Ensure correct class name
    const items = html.match(filmListRegex) || [];

    items.forEach((itemHtml) => {
        const titleMatch = itemHtml.match(/<a href="([^"]+)">([^<]+)<\/a>/);
        const href = titleMatch ? titleMatch[1] : '';
        let title = titleMatch ? titleMatch[2] : '';
        title = cleanTitle(title);

        // Adjust regex to capture thumbnail URL
        const imgMatch = itemHtml.match(/<img[^>]*class="thumb"[^>]*src="([^"]+)"[^>]*>/);
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
