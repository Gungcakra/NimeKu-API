import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';
import stringSimilarity from 'string-similarity';
const app = express();
const PORT = 3000;

// Middleware to support CORS
app.use(cors());
//DIALOG
// Endpoint untuk mendapatkan status dialog
// Endpoint untuk mendapatkan status dialog
// Global status dialog
let globalDialogStatus = {
  showDialog: true,
  dialogContent: '<h2>cakrAnime</h2><p>Welcome!</p>',
  lastUpdated: Date.now()
};

// Endpoint untuk mendapatkan status dialog global
app.get('/api/dialog-status', (req, res) => {
  res.json(globalDialogStatus);
});

// Endpoint untuk mengatur status dialog global (misalnya dari admin)
app.post('/api/dialog-status', (req, res) => {
  const { showDialog, dialogContent } = req.body;
  if (showDialog !== undefined) globalDialogStatus.showDialog = showDialog;
  if (dialogContent) globalDialogStatus.dialogContent = dialogContent;
  globalDialogStatus.lastUpdated = Date.now(); // Update timestamp
  res.json({ success: true });
});

// Endpoint untuk mengatur ulang status dialog global
app.post('/api/dialog-status/reset', (req, res) => {
  globalDialogStatus.showDialog = false;
  globalDialogStatus.lastUpdated = Date.now();
  res.json({ success: true });
});


// DIALOG



// NEW ANIME
async function scrapeAnimeData() {
  const urls = [
    'https://gojonime.com/',
  ];

  // Prepare an array to hold the extracted anime data
  const animeData = [];

  try {
    // Iterate over each URL
    for (const url of urls) {
      // Fetch the HTML content of the page
      const { data } = await axios.get(url);
      // Load the HTML into cheerio for parsing
      const $ = cheerio.load(data);

      // Select <article> elements with the class "stylesix"
      $('article.bs').each((index, element) => {
        if (index < 11) {
          // Extract the title from the <a> tag's title attribute
          const title = $(element).find('a[itemprop="url"]').attr('title')?.trim() || '';

          // Extract the URL from the <a> tag's href attribute
          const url = $(element).find('a[itemprop="url"]').attr('href')?.trim() || '';

          // Extract the image URL from the <img> tag's src attribute
          const imageUrl = $(element).find('img.ts-post-image').attr('data-src')?.trim() ||
                 $(element).find('img.ts-post-image').attr('data-lazy-src')?.trim() ||
                 $(element).find('img.ts-post-image').attr('src')?.trim() || '';


          // Extract the episode number from the .epx span
          const episodeNumber = $(element).find('.bt .epx').text().trim();

          // Extract the type from the .typez div (e.g., Anime, Manga)
          const type = $(element).find('.typez').text().trim();

          // Extract the release time from the .timeago div
          const releaseTime = $(element).find('.timeago').text().trim();

          // Extract the anime series title
          const seriesTitle = $(element).find('.tt').contents().first().text().trim();

          // Push the extracted data into the animeData array
          animeData.push({
            title,
            url,
            imageUrl,
            episodeNumber,
            type,
            releaseTime,
            seriesTitle,
          });
        }
      });
    }

    // Return the combined data
    return animeData;
  } catch (error) {
    console.error('Error fetching anime data from multiple pages:', error);
    return [];
  }
}

// Call the function and log the results (for demonstration purposes)
scrapeAnimeData().then(animeData => {
  console.log(animeData);
});
// Endpoint to get anime data from the first 6 <article> elements
app.get('/api/new', async (req, res) => {
  try {
    const animeData = await scrapeAnimeData();
    res.json(animeData);
  } catch (error) {
    console.error('Error fetching anime data:', error);
    res.status(500).send('Error fetching anime data');
  }
});
// NEW ANIME

app.get('/api/tes', async (req, res) => {
  try {
      const url = 'https://anime-indo.lol/one-piece-episode-1114/';
      
      // Ambil HTML dari URL
      const { data } = await axios.get(url);
      
      // Load HTML ke cheerio
      const $ = cheerio.load(data);
      
      // Ambil URL video dari elemen <a> di dalam <div class="servers">
      const serverData = [];
      $('.servers a').each((index, element) => {
          const videoUrl = $(element).attr('data-video');
          const serverName = $(element).text().trim();
          if (videoUrl) {
              // Tambahkan 'https:' di depan URL jika serverName adalah 'GDRIVE'
              const formattedUrl = serverName === 'GDRIVE' ? `https:${videoUrl}` : videoUrl;
              serverData.push({
                  serverName,
                  videoUrl: formattedUrl
              });
          }
      });
      
      // Kirim data ke client
      res.json(serverData);
  } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan saat mengambil data');
  }
});


// RECOMEND

async function scrapePopularAnime() {
  try {
    const url = 'https://gojonime.com/anime/?status=ongoing&type=&order=popular';
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const popularAnime = [];

    // Select the appropriate elements using Cheerio
    $('.listupd article.bs .bsx').each((index, element) => {
      const animeElement = $(element);
      const titleElement = animeElement.find('h2[itemprop="headline"]');
      const title = titleElement.text().trim();
      const href = animeElement.find('a[itemprop="url"]').attr('href');
      const image = animeElement.find('.bsx img.ts-post-image').attr('data-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-lazy-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-original')?.trim() || // Check for data-original
      $(element).find('.bsx img.ts-post-image').attr('src')?.trim() ||
      '';

      const status = animeElement.find('.limit .bt span').text().trim();
      const episodeNumber = animeElement.find('.tt span i').text().trim();

      popularAnime.push({
        title,
        href,
        image,
        status,
        episodeNumber,
      });
    });

    return popularAnime;
  } catch (error) {
    console.error('Error while scraping:', error.message);
    return [];
  }
}

// Express route to fetch the scraped data
app.get('/api/recommend', async (req, res) => {
  try {
    const popularAnime = await scrapePopularAnime();
    res.json(popularAnime);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// RECOMEND

// ON GOING
async function scrapeOnGoingAnime() {
  try {
    const url = 'https://gojonime.com/on-going-anime/';
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const popularAnime = [];

    // Select the appropriate elements using Cheerio
    $('.listupd article.bs .bsx').each((index, element) => {
      const animeElement = $(element);
      const titleElement = animeElement.find('h2[itemprop="headline"]');
      const title = titleElement.text().trim();
      const href = animeElement.find('a[itemprop="url"]').attr('href');
      const image = animeElement.find('.bsx img.ts-post-image').attr('data-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-lazy-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-original')?.trim() || // Check for data-original
      $(element).find('.bsx img.ts-post-image').attr('src')?.trim() ||
      '';

      const status = animeElement.find('.limit .bt span').text().trim();
      const episodeNumber = animeElement.find('.tt span i').text().trim();

      popularAnime.push({
        title,
        href,
        image,
        status,
        episodeNumber,
      });
    });

    return popularAnime;
  } catch (error) {
    console.error('Error while scraping:', error.message);
    return [];
  }
}
app.get('/api/ongoing', async (req, res) => {
  try {
    const popularAnime = await scrapeOnGoingAnime();
    res.json(popularAnime);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ON GOING








//COMPLETE ANIME
async function scrapeComplete(url) {
  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);
    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(data);

    // Extracting anime list items
    const animeList = [];

    // Select <article> elements with the class "bs"
    $('article.bs').each((index, element) => {
      // Extract the title from the <a> tag's title attribute
      const title = $(element).find('a[itemprop="url"]').attr('title').trim();

      // Extract the URL from the <a> tag's href attribute
      const href = $(element).find('a[itemprop="url"]').attr('href').trim();

      // Extract the image URL from the <img> tag's src attribute
      const imageUrl = $(element).find('.bsx img.ts-post-image').attr('data-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-lazy-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-original')?.trim() || // Check for data-original
      $(element).find('.bsx img.ts-post-image').attr('src')?.trim() ||
      '';


      // Extract the status from the .status div
      const status = $(element).find('.status').text().trim();

      // Extract the type from the .typez div (e.g., Anime, Manga)
      const type = $(element).find('.typez').text().trim();

      // Extract the episode number or completion status from the .epx span
      const episodeNumber = $(element).find('.bt .epx').text().trim();

      // Push the extracted data into the animeList array
      animeList.push({
        title,
        href,
        imageUrl,
        status,
        type,
        episodeNumber
      });
    });

    // Return the extracted anime list
    return animeList;
  } catch (error) {
    // Log any errors that occur during the request
    console.error('Error fetching anime list:', error);
    return [];
  }
}

// Function to combine and filter data from multiple URLs
async function scrapeAllUrls(urls) {
  try {
    // Fetch data from all URLs concurrently with Promise.all
    const results = await Promise.all(urls.map(url => scrapeComplete(url)));

    // Combine the results into a single array
    const combinedAnimeList = [].concat(...results);

    // Use a Set to track unique titles and filter out duplicates
    const seenTitles = new Set();
    const uniqueAnimeList = combinedAnimeList.filter(anime => {
      if (seenTitles.has(anime.title)) {
        return false; // Skip duplicates
      } else {
        seenTitles.add(anime.title);
        return true; // Keep unique entries
      }
    });

    return uniqueAnimeList;
  } catch (error) {
    console.error('Error fetching and combining anime data:', error);
    return [];
  }
}

// Endpoint to get anime list from multiple URLs and filter duplicates
app.get('/api/completed', async (req, res) => {
  try {
    // Define the URLs to scrape
    const urls = [
      'https://gojonime.com/completed-anime/',
      'https://gojonime.com/completed-anime/page/2/',
    ];

    // Get the combined and filtered anime list
    const animeData = await scrapeAllUrls(urls);

    // Send the filtered list as a JSON response
    res.json(animeData);
  } catch (error) {
    // Log any errors and send a 500 status response
    console.error('Error fetching anime list:', error);
    res.status(500).send('Error fetching anime list');
  }
});

//COMPLETE ANIME


// ANIME LIST
async function scrapeAnimeList() {
  try {
    const { data } = await axios.get('https://oploverz.ch/series/list-mode/');
    const $ = cheerio.load(data);

    // Extracting anime list items
    const animeList = [];
    $('.soralist .blix ul li a.series').each((index, element) => {
      if (index < 12) { // Limit to 25 items
        const title = $(element).text().trim();
        const href = $(element).attr('href');
        animeList.push({ title, href });
      }
    });

    return animeList;
  } catch (error) {
    console.error('Error fetching anime list:', error);
    return [];
  }
}

// Function to scrape anime image from individual anime pages
async function scrapeAnimeImage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract the image URL from the div with class 'thumb'
    const image = $('div.thumb img').attr('src');
    return image ? (image.startsWith('http') ? image : `https:${image}`) : null;
  } catch (error) {
    console.error('Error fetching anime image:', error);
    return null;
  }
}

app.get('/api/anime-list', async (req, res) => {
  try {
    const animeList = await scrapeAnimeList();

    // Fetch images concurrently with Promise.all
    const animeWithImages = await Promise.all(
      animeList.map(async (anime) => {
        // Use the image fetching function only if necessary
        const image = await scrapeAnimeImage(anime.href);
        return { ...anime, image };
      })
    );

    res.json(animeWithImages);
  } catch (error) {
    console.error('Error fetching anime list with images:', error);
    res.status(500).send('Error fetching anime list');
  }
});
// ANIME LIST


// GENRELIST
app.get('/api/data', async (req, res) => {
  try {
    // URL dari halaman yang ingin di-scrape
    const url = 'https://gojonime.com/anime/list-mode/';

    // Mengambil data dari halaman
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Mengambil genre
    const genres = [];
    $('.filter.dropdown').first().find('ul.dropdown-menu li').each((i, el) => {
        const genre = $(el).find('label').text();
        genres.push(genre);
    });

    // Mengambil season
    const seasons = [];
    $('.filter.dropdown').eq(1).find('ul.dropdown-menu li').each((i, el) => {
        const season = $(el).find('label').text();
        seasons.push(season);
    });

    // Mengambil studio
    const studios = [];
    $('.filter.dropdown').eq(2).find('ul.dropdown-menu li').each((i, el) => {
        const studio = $(el).find('label').text();
        studios.push(studio);
    });

    // Mengambil status
    const statuses = [];
    $('.filter.dropdown').eq(3).find('ul.dropdown-menu li').each((i, el) => {
        const status = $(el).find('label').text();
        statuses.push(status);
    });

    // Mengambil type
    const types = [];
    $('.filter.dropdown').eq(4).find('ul.dropdown-menu li').each((i, el) => {
        const type = $(el).find('label').text();
        types.push(type);
    });

    // Mengambil order
    const orders = [];
    $('.filter.dropdown').eq(5).find('ul.dropdown-menu li').each((i, el) => {
        const order = $(el).find('label').text();
        orders.push(order);
    });

    // Mengirimkan data yang diambil sebagai respons
    res.json({
        genres,
        seasons,
        studios,
        statuses,
        types,
        orders
    });
} catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).send('Error scraping data');
}
});


app.get('/api/komikbaca', async (req, res) => {
  try {
    const { data } = await axios.get('https://komiku.id/i-alone-leveling-chapter-96/');
    const $ = cheerio.load(data);
    
    const imageUrls = [];
    
    $('#Baca_Komik img').each((index, element) => {
      const imgUrl = $(element).attr('src');
      if (imgUrl) {
        imageUrls.push(imgUrl);
      }
    });
    
    res.json(imageUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
// GENRELIST


//JADWAL
app.get('/api/jadwal', async (req, res) => {
  try {
    // Fetch the webpage
    const { data } = await axios.get('https://gojonime.com/jadwal-on-going-anime/'); // Replace with the actual URL if needed

    // Load the webpage content into cheerio
    const $ = cheerio.load(data);

    // Prepare an array to hold the schedule data
    const schedule = [];

    // Select each day section and iterate over it
    $('.bixbox.schedulepage').each((index, element) => {
      const day = $(element).find('.releases h3 span').text();
      const animeList = [];
    
      // Select each anime item within the current day section
      $(element).find('.bsx').each((i, el) => {
        const title = $(el).find('a').attr('title');
        const url = $(el).find('a').attr('href');
        const time = $(el).find('.epx').text();
        const episode = $(el).find('.sb.Sub').text();
    
        // Get the correct image URL
        const imageUrl = 
            $(el).find('img').attr('data-src')?.trim() ||  // Use data-src first
            $(el).find('img').attr('data-lazy-src')?.trim() || // Use data-lazy-src second
            $(el).find('img').attr('src')?.trim() || // Use src as the last resort
            '';
    
        animeList.push({
          title,
          url,
          time,
          episode,
          imageUrl,
        });
      });
    
      schedule.push({
        day,
        animeList,
      });
    });

    // Respond with the schedule data in JSON format
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while fetching schedule.');
  }
});
// JADWAL


// DETAIL ANIME
async function scrapeAnimeDetails(url) {  
  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);
    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(data);
    // Prepare an object to hold the extracted anime details
    const animeDetails = {};

    animeDetails.title = $('h1.entry-title').text().trim();

    // Extract the image URL from the div thumbook img
    animeDetails.image = 
        $('.thumbook .thumb img').attr('data-src')?.trim() ||  // Use data-src first
        $('.thumbook .thumb img').attr('data-lazy-src')?.trim() || // Use data-lazy-src second
        $('.thumbook .thumb img').attr('src')?.trim() || // Use src as the last resort
        '';
    
    // Extract tags into an array from .genxed a
    animeDetails.tags = [];
    $('.genxed a').each((index, element) => {
        animeDetails.tags.push($(element).text().trim());
    });
    
    // Extract synopsis from .desc
    animeDetails.synopsis = $('.desc').text().trim();
    
    // Extract description from .mindesc
    animeDetails.description = $('.entry-content p').text().trim();
    animeDetails.seriesSynopsis = $('.mindesc').text().trim();
    
    // Extract rating (if available) from .rating strong
    const ratingText = $('.rating strong').text().trim();
    const ratingMatch = ratingText.match(/Rating (\d+\.\d+)/);
    animeDetails.rating = ratingMatch ? ratingMatch[1] : null;
    
    // Extract additional details (e.g., status, studio) into an object
    animeDetails.details = {};
    $('.info-content .spe span').each((index, element) => {
        const text = $(element).text().trim();
        const [key, value] = text.split(':').map((str) => str.trim());
        if (key && value) {
            animeDetails.details[key] = value;
        }
    });
    // Extract episodes into an array
    animeDetails.episodes = [];
    $('.eplister ul li').each((index, element) => {
      const episodeNumber = $(element).find('.epl-num').text().trim();
      const episodeTitle = $(element).find('.epl-title').text().trim();
      const episodeDate = $(element).find('.epl-date').text().trim();
      const episodeUrl = $(element).find('a').attr('href');

      animeDetails.episodes.push({
        number: episodeNumber,
        title: episodeTitle,
        date: episodeDate,
        url: episodeUrl,
      });
    });

    // Return the extracted anime details
    return animeDetails;
  } catch (error) {
    // Log any errors that occur during the request
    console.error(`Error fetching anime details from ${url}:`, error);
    return null; // Return null if there's an error
  }
}

app.get('/api/anime-details/:id', async (req, res) => {
  const id = req.params.id;

  // Define the URLs to check
  const urls = [
    `https://gojonime.com/anime/${id}/`
  ];

  try {
    // Attempt to fetch anime details from the URLs in order
    let animeDetails = null;
    for (const url of urls) {
      animeDetails = await scrapeAnimeDetails(url);
      if (animeDetails) {
        break; // Stop if anime details are successfully fetched
      }
    }

    // Check if anime details were found
    if (animeDetails) {
      res.json(animeDetails); // Send the anime details as a JSON response
    } else {
      res.status(404).send('Anime details not found'); // Send a 404 status if not found
    }
  } catch (error) {
    // Log any errors and send a 500 status response
    console.error('Error fetching anime details:', error);
    res.status(500).send('Error fetching anime details');
  }
});
// DETAIL ANIME



// SEARCH
const scrapeSearch = async (url) => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const results = [];

  $('article.bs').each((index, element) => {
    const link = $(element).find('a').attr('href');
    const title = $(element).find('h2[itemprop="headline"]').text().trim();
    const imageUrl =
      $(element).find('.bsx img.ts-post-image').attr('data-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-lazy-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-original')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('src')?.trim() ||
      '';

    const status = $(element).find('span.epx').text().trim();

    results.push({
      title,
      link,
      imageUrl,
      status,
    });
  });

  return results;
};

// Function to merge results and avoid duplication based on the title
const mergeResults = (results1, results2) => {
  const combinedResults = [...results1];
  const titles = new Set(results1.map((item) => item.title));

  results2.forEach((item) => {
    if (!titles.has(item.title)) {
      combinedResults.push(item);
      titles.add(item.title);
    }
  });

  return combinedResults;
};

// API endpoint to search data
app.get('/api/search/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // URL from the search page
    const url1 = `https://gojonime.com/?s=${id}`;
    const url2 = `https://gojonime.com/page/2/?s=${id}`;

    // Fetch data from the first URL
    const data1 = await scrapeSearch(url1);

    let combinedResults = data1;

    // Only fetch from the second URL if the first has more than 12 results
    if (data1.length > 12) {
      const data2 = await scrapeSearch(url2);
      // Merge results from both sources without duplication
      combinedResults = mergeResults(data1, data2);
    }

    // Send results as JSON
    res.json(combinedResults);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while scraping data');
  }
});


// SEARCH
// SEARCH




// SEARCH
// GENRE
const scrapeGenre = async (url) => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const results = [];

  $('article.bs').each((index, element) => {
    const link = $(element).find('a').attr('href');
    const title = $(element).find('h2[itemprop="headline"]').text().trim();

    // Try to get the correct image URL
    const imageUrl =
      $(element).find('.bsx img.ts-post-image').attr('data-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-lazy-src')?.trim() ||
      $(element).find('.bsx img.ts-post-image').attr('data-original')?.trim() || // Check for data-original
      $(element).find('.bsx img.ts-post-image').attr('src')?.trim() ||
      '';

    const status = $(element).find('span.epx').text().trim();

    results.push({
      title,
      link,
      imageUrl,
      status,
    });
  });

  return results;
};

// Fungsi untuk menggabungkan hasil dan menghindari duplikasi berdasarkan title
const mergeResultGenre = (results1, results2) => {
  const combinedResults = [...results1];
  const titles = new Set(results1.map((item) => item.title));

  results2.forEach((item) => {
    if (!titles.has(item.title)) {
      combinedResults.push(item);
      titles.add(item.title);
    }
  });

  return combinedResults;
};

// Endpoint API untuk mencari data
app.get('/api/genre/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // URL dari halaman pencarian
    const url1 = `https://gojonime.com/anime/?genre%5B%5D=${id}&status=&type=&order=`;
    const url2 = `https://gojonime.com/anime/?page=2&genre%5B0%5D=${id}&status=&type=&order=`;

    // Mengambil data dari URL pertama
    const data1 = await scrapeGenre(url1);

    // Mengambil data dari URL kedua jika data1 lebih dari 12
    let combinedResults = data1;
    if (data1.length > 12) {
      const data2 = await scrapeGenre(url2);
      // Menggabungkan hasil dari kedua sumber tanpa duplikasi
      combinedResults = mergeResultGenre(data1, data2);
    }

    // Mengirimkan hasil dalam format JSON
    res.json(combinedResults);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while scraping data');
  }
});


// SEARCH



// EPISODE
// Function to scrape iframe src from download page
// Function to scrape iframe src from download page
// Function to convert download link to iframe src
function convertToIframeSrc(downloadUrl) {
  try {
    // Extract the relevant part of the URL and convert to iframe src
    const regex = /https:\/\/acefile\.co\/f\/(\d+)(?:\/.*)?/;
    const match = downloadUrl.match(regex);
    if (match) {
      return `https://acefile.co/player/${match[1]}#/`;
    }
    return 'N/A';
  } catch (error) {
    console.error('Error converting download URL:', downloadUrl, error);
    return 'N/A';
  }
}
function decodeIframeValues($) {
  const decodedIframes = [];

  // Select all option elements within the <select> element
  $('select.mirror option').each((i, option) => {
    const serverName = $(option).text().trim();
    const value = $(option).attr('value');

    // Check if the option has a value attribute
    if (value) {
      // Decode the Base64-encoded value
      const decodedValue = Buffer.from(value, 'base64').toString('utf-8');

      // Use Cheerio to parse the decoded HTML and extract the src attribute from the iframe
      const iframeSrc = cheerio.load(decodedValue)('iframe').attr('src');

      // Push the server name and iframe src to the array
      decodedIframes.push({
        server: serverName,
        iframeSrc: iframeSrc || 'N/A', // Use 'N/A' if src is not found
      });
    }
  });

  return decodedIframes;
}



// Function to scrape main URL and handle iframe scraping
async function scrapeIframeURL(url) {
  try {
    // Fetch the HTML content of the page
    const { data } = await axios.get(url);

    // Load the HTML into cheerio for parsing
    const $ = cheerio.load(data);

    // Extracting existing information
    const title = $('.item.meta .title-section .entry-title').text().trim() || 'N/A';
    const description = $('.item.meta .year').text().trim() || 'N/A';
    const episodeNumber = $('.item.meta [itemprop="episodeNumber"]').attr('content') || 'N/A';
    const releaseDate = $('.item.meta .year .updated').text().trim() || 'N/A';
    const imageUrl = $('.item.meta .tb img').attr('src') || 'N/A';
    const iframeSrc = $('div.player-embed iframe').attr('data-lazy-src') || $('div.player-embed iframe').attr('src') || 'N/A';
    
    // Convert to absolute URL
    const absoluteImageUrl = new URL(imageUrl, url).href;
    const absoluteIframeSrc = iframeSrc ? new URL(iframeSrc, url).href : 'N/A';

    // Extracting new information from the updated HTML structure
    const seriesTitle = $('.single-info.bixbox .infox .infolimit h2[itemprop="partOfSeries"]').text().trim() || 'N/A';
    const alternateTitles = $('.single-info.bixbox .infox .infolimit .alter').text().trim() || 'N/A';
    const ratingText = $('.single-info.bixbox .infox .rating strong').text().trim();
    const rating = ratingText ? ratingText.replace('Rating', '').trim() : 'N/A';
    const status = $('.single-info.bixbox .infox .info-content .spe span:contains("Status")').text().replace('Status:', '').trim() || 'N/A';
    const studio = $('.single-info.bixbox .infox .info-content .spe span:contains("Studio") a').text().trim() || 'N/A';
    const releaseYear = $('.single-info.bixbox .infox .info-content .spe span:contains("Released")').text().replace('Released:', '').trim() || 'N/A';
    const duration = $('.single-info.bixbox .infox .info-content .spe span:contains("Duration")').text().replace('Duration:', '').trim() || 'N/A';
    const season = $('.single-info.bixbox .infox .info-content .spe span:contains("Season") a').text().trim() || 'N/A';
    const type = $('.single-info.bixbox .infox .info-content .spe span:contains("Type")').text().replace('Type:', '').trim() || 'N/A';
    const episodes = $('.single-info.bixbox .infox .info-content .spe span:contains("Episodes")').text().replace('Episodes:', '').trim() || 'N/A';
    const director = $('.single-info.bixbox .infox .info-content .spe span:contains("Director") a').text().trim() || 'N/A';

    // Extract cast list
    const cast = [];
    $('.single-info.bixbox .infox .info-content .spe span:contains("Casts") a').each((i, element) => {
      cast.push($(element).text().trim());
    });

    // Extract genres list
    const genres = [];
    $('.single-info.bixbox .infox .info-content .genxed a').each((i, element) => {
      genres.push($(element).text().trim());
    });

    // Corrected selector for seriesDescription
    const seriesDescription = $('.single-info.bixbox .infox .info-content .desc').text().trim() || 'N/A';
    const seriesImageUrl = 
    $('.thumb img.ts-post-image').attr('data-src')?.trim() ||  // Use data-src first
    $('.thumb img.ts-post-image').attr('data-lazy-src')?.trim() || // Use data-lazy-src second
    $('.thumb img.ts-post-image').attr('src')?.trim() ||  // Use src as the last resort
    '';


    // Extract href from <a> tag inside .nvs nvsc
    const animeUrl = $('.nvs.nvsc a').attr('href') || 'N/A';

    // Extracting download links for 480p, 720p, and 1080p
    const downloadLinks = [];
    $('.soraurlx').each((i, element) => {
      const quality = $(element).find('strong').text().trim();
      $(element)
        .find('a')
        .each((j, link) => {
          const href = $(link).attr('href');
          if (
            (quality === '480p' || quality === '720p' || quality === '1080p' || quality === '480P' || quality === '720P' || quality === '1080P') &&
            href.includes('acefile') &&
            href.endsWith('-mp4')
          ) {
            downloadLinks.push({ quality, link: href, iframeSrc: convertToIframeSrc(href) });
          }
        });
    });

    // Decode iframe values and extract src attributes
    const decodedIframes = decodeIframeValues($);

    return {
      // Returning existing data
      title,
      description,
      episodeNumber,
      releaseDate,
      imageUrl: absoluteImageUrl,
      iframeSrc: absoluteIframeSrc,

      // Returning new data
      seriesTitle,
      alternateTitles,
      rating,
      status,
      studio,
      releaseYear,
      duration,
      season,
      type,
      episodes,
      director,
      cast,
      genres,
      seriesDescription,
      seriesImageUrl,
      animeUrl,

      // New download links field with iframe src
      downloadLinks,

      // Decoded iframe src attributes
      decodedIframes,
    };
  } catch (error) {
    // Log any errors that occur during the request
    console.error("Error fetching iframe URL from", url, error);
    return null; // Return null to indicate failure
  }
}


// Endpoint for fetching episode details
app.get('/api/episode-details/:episodeId', async (req, res) => {
  const episodeId = req.params.episodeId;

  // Define the URLs to check
  const urls = [
    `https://gojonime.com/${episodeId}/`,
  ];

  let iframeURL = null;

  // Try each URL until data is found
  for (const url of urls) {
    console.log(`Trying URL: ${url}`); // Log URL being tried
    iframeURL = await scrapeIframeURL(url);
    if (iframeURL) {
      break; // Break the loop if valid data is retrieved
    }
  }

  // Send response based on retrieved data
  if (iframeURL) {
    res.json({ iframeURL }); // Send data if found
  } else {
    res.status(404).send("Error: Episode details not found"); // Send 404 if no data is found
  }
});






// EPISODE



// IMAGE PROXY
app.get('/api/wever', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
