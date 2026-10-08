// Travel Recommendation JavaScript

let travelData = null;

// Timezone mapping for Task 10 (Optional Country Date & Time)
const timeZones = {
  'Sydney, Australia': 'Australia/Sydney',
  'Melbourne, Australia': 'Australia/Melbourne',
  'Tokyo, Japan': 'Asia/Tokyo',
  'Kyoto, Japan': 'Asia/Tokyo',
  'Rio de Janeiro, Brazil': 'America/Sao_Paulo',
  'São Paulo, Brazil': 'America/Sao_Paulo',
  'Angkor Wat, Cambodia': 'Asia/Phnom_Penh',
  'Taj Mahal, India': 'Asia/Kolkata',
  'Bora Bora, French Polynesia': 'Pacific/Tahiti',
  'Copacabana Beach, Brazil': 'America/Sao_Paulo'
};

// Task 6: Fetch data from the travel_recommendation_api.json file using fetch() API
function loadTravelData() {
  fetch('./travel_recommendation_api.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      travelData = data;
      // Task 6: Console.log to verify data access
      console.log('Travel Recommendations Data successfully fetched:', travelData);
    })
    .catch((error) => {
      console.error('Error fetching travel recommendations:', error);
      // Fallback try root relative path if needed
      fetch('travel_recommendation_api.json')
        .then((res) => res.json())
        .then((data) => {
          travelData = data;
          console.log('Travel Recommendations Data fetched via fallback path:', travelData);
        })
        .catch((err) => console.error('Fallback fetch also failed:', err));
    });
}

// Task 10: Country date and time helper
function getPlaceTime(placeName) {
  const timeZone = timeZones[placeName];
  if (!timeZone) return '';
  try {
    const options = {
      timeZone: timeZone,
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    const localTime = new Date().toLocaleTimeString('en-US', options);
    console.log(`Current time in ${placeName} (${timeZone}):`, localTime);
    return localTime;
  } catch (err) {
    console.error('Error calculating time for timezone:', timeZone, err);
    return '';
  }
}

// Task 7 & Task 8: Recommendation logic & Keyword searching
function searchRecommendations() {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('recommendation-results');
  const resultsWrapper = document.getElementById('recommendations-section');

  if (!searchInput || !resultsContainer) return;

  const rawKeyword = searchInput.value.trim();
  const keyword = rawKeyword.toLowerCase();

  if (!keyword) {
    alert('Please enter a destination or keyword (e.g. beach, temple, country).');
    return;
  }

  if (!travelData) {
    console.warn('Data not yet loaded, fetching now...');
    fetch('./travel_recommendation_api.json')
      .then((res) => res.json())
      .then((data) => {
        travelData = data;
        executeSearch(keyword, resultsContainer, resultsWrapper);
      });
  } else {
    executeSearch(keyword, resultsContainer, resultsWrapper);
  }
}

function executeSearch(keyword, resultsContainer, resultsWrapper) {
  let recommendations = [];

  // Match keyword variations: beach / beaches
  if (keyword.includes('beach')) {
    recommendations = travelData.beaches || [];
  }
  // Match keyword variations: temple / temples
  else if (keyword.includes('temple')) {
    recommendations = travelData.temples || [];
  }
  // Match keyword variations: country / countries
  else if (keyword.includes('countr')) {
    // Show all cities from all countries (at least 2 recommendations)
    if (travelData.countries) {
      travelData.countries.forEach((country) => {
        if (country.cities) {
          recommendations.push(...country.cities);
        }
      });
    }
  }
  // Match specific country names (e.g., australia, japan, brazil)
  else if (travelData.countries) {
    const matchedCountry = travelData.countries.find((c) =>
      c.name.toLowerCase().includes(keyword)
    );
    if (matchedCountry && matchedCountry.cities) {
      recommendations = matchedCountry.cities;
    } else {
      // Check city names directly
      travelData.countries.forEach((country) => {
        country.cities.forEach((city) => {
          if (city.name.toLowerCase().includes(keyword)) {
            recommendations.push(city);
          }
        });
      });
    }
  }

  // Display recommendations
  displayResults(recommendations, resultsContainer, resultsWrapper, keyword);
}

// Display recommendations dynamically with images, descriptions and local time
function displayResults(results, container, wrapper, keyword) {
  container.innerHTML = '';
  if (wrapper) {
    wrapper.style.display = 'flex';
  }

  if (results.length === 0) {
    container.innerHTML = `
      <div class="no-results-box">
        <svg viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <h3>No recommendations found</h3>
        <p>Try searching for "beach", "temple", "country", or a destination like "Australia", "Japan", "Brazil".</p>
      </div>
    `;
    return;
  }

  // Task 8: Display at least two recommendations, image and description using display: grid
  results.forEach((item) => {
    const localTime = getPlaceTime(item.name);
    const timeBadgeHtml = localTime
      ? `<div class="card-time-badge">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
             <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
           </svg>
           <span>${localTime}</span>
         </div>`
      : '';

    const card = document.createElement('div');
    card.className = 'recommendation-card';
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.imageUrl}" alt="${item.name}" class="card-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';">
        ${timeBadgeHtml}
      </div>
      <div class="card-body">
        <h4 class="card-title">${item.name}</h4>
        <p class="card-desc">${item.description}</p>
        <button class="card-action-btn" onclick="alert('Proceeding to booking details for ${item.name}!')">Visit Now</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Smooth scroll into results on smaller devices
  if (window.innerWidth <= 1024) {
    container.scrollIntoView({ behavior: 'smooth' });
  }
}

// Task 9: Clear button logic
function clearResults() {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('recommendation-results');

  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }

  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }

  console.log('Results cleared.');
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  loadTravelData();

  const searchBtn = document.getElementById('btn-search');
  const resetBtn = document.getElementById('btn-reset');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', searchRecommendations);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', clearResults);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchRecommendations();
      }
    });
  }
});
