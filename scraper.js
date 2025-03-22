// Function to clean and format the title
function cleanTitle(title) {
    return title
        .replace(/&#8217;/g, "'")  
        .replace(/&#8211;/g, "-")  
        .replace(/&#[0-9]+;/g, "");
}

// Function to find and unpack any obfuscated scripts
function placeholder(html) {
    const obfuscatedScript = html.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
    if (obfuscatedScript) {
        const unpackedScript = unpack(obfuscatedScript[1]);
        console.log("Unpacked Script:", unpackedScript);
        return unpackedScript;
    }
    return null;
}

// Deobfuscation Code (P.A.C.K.E.R. decoder)
class Unbaser {
    constructor(base) {
        this.ALPHABET = {
            62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            95: "' !\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'",
        };
        this.dictionary = {};
        this.base = base;
        if (36 < base && base < 62) {
            this.ALPHABET[base] = this.ALPHABET[base] ||
                this.ALPHABET[62].substr(0, base);
        }
        if (2 <= base && base <= 36) {
            this.unbase = (value) => parseInt(value, base);
        }
        else {
            try {
                [...this.ALPHABET[base]].forEach((cipher, index) => {
                    this.dictionary[cipher] = index;
                });
            }
            catch (er) {
                throw Error("Unsupported base encoding.");
            }
            this.unbase = this._dictunbaser;
        }
    }

    _dictunbaser(value) {
        let ret = 0;
        [...value].reverse().forEach((cipher, index) => {
            ret = ret + ((Math.pow(this.base, index)) * this.dictionary[cipher]);
        });
        return ret;
    }
}

function detect(source) {
    return source.replace(" ", "").startsWith("eval(function(p,a,c,k,e,");
}

function unpack(source) {
    let { payload, symtab, radix, count } = _filterargs(source);
    if (count !== symtab.length) {
        throw Error("Malformed p.a.c.k.e.r. symtab.");
    }
    let unbase;
    try {
        unbase = new Unbaser(radix);
    } catch (e) {
        throw Error("Unknown p.a.c.k.e.r. encoding.");
    }

    function lookup(match) {
        const word = match;
        let word2;
        if (radix === 1) {
            word2 = symtab[parseInt(word)];
        } else {
            word2 = symtab[unbase.unbase(word)];
        }
        return word2 || word;
    }

    source = payload.replace(/\b\w+\b/g, lookup);
    return _replacestrings(source);

    function _filterargs(source) {
        const juicers = [
            /}$begin:math:text$'(.*)', *(\\d+|\\[\\]), *(\\d+), *'(.*)'\\.split\\('\\|'$end:math:text$, *(\d+), *(.*)\)\)/,
            /}$begin:math:text$'(.*)', *(\\d+|\\[\\]), *(\\d+), *'(.*)'\\.split\\('\\|'$end:math:text$/,
        ];
        for (const juicer of juicers) {
            const args = juicer.exec(source);
            if (args) {
                let a = args;
                if (a[2] === "[]") {
                }
                try {
                    return {
                        payload: a[1],
                        symtab: a[4].split("|"),
                        radix: parseInt(a[2]),
                        count: parseInt(a[3]),
                    };
                } catch (ValueError) {
                    throw Error("Corrupted p.a.c.k.e.r. data.");
                }
            }
        }
        throw Error("Could not make sense of p.a.c.k.e.r data (unexpected code structure)");
    }

    function _replacestrings(source) {
        return source;
    }
}

// Function to extract search results from the HTML of the search page
function searchResults(html) {
    const results = [];

    // Look for obfuscated script (if any)
    const unpackedScript = placeholder(html); 

    // Assuming the script gives you video data after deobfuscation
    if (unpackedScript) {
        // Extract titles, URLs, and thumbnails here based on unpackedScript
        // Example: Extract titles and thumbnails after unpacking
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

            if (title && href) {
                results.push({
                    title: title.trim(),
                    image: imageUrl.trim(),
                    href: href.trim()
                });
            }
        });
    } else {
        // Regular scraping if no obfuscated script found
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

            if (title && href) {
                results.push({
                    title: title.trim(),
                    image: imageUrl.trim(),
                    href: href.trim()
                });
            }
        });
    }

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