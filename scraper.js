function cleanTitle(title) {
  return title
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#[0-9]+;/g, "");
}

function searchResults(html) {
  const results = [];
  // Your scraping logic here
  return results;
}

function extractDetails(html) {
  const details = [];
  // Your scraping logic here
  return details;
}

function extractEpisodes(html) {
  const episodes = [];
  // Your scraping logic here
  return episodes;
}

function extractStreamUrl(html) {
  const sourceRegex = /<source[^>]+id="iframevideo"[^>]+src="([^"]+)"/;
  const match = html.match(sourceRegex);
  return match ? match[1] : null;
}
