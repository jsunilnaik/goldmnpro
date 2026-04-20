// India Cities Database — Tier 1 through Tier 4
// Organized by state with tier classification

const INDIA_CITIES = {
  // ─── TIER 1: Megacities ────────────────────────
  'Maharashtra': {
    state: 'Maharashtra',
    region: 'West',
    cities: [
      { name: 'Mumbai', tier: 1 },
      { name: 'Pune', tier: 1 },
      { name: 'Nagpur', tier: 2 },
      { name: 'Nashik', tier: 2 },
      { name: 'Chhatrapati Sambhajinagar', tier: 2 },
      { name: 'Amravati', tier: 2 },
      { name: 'Kolhapur', tier: 2 },
      { name: 'Solapur', tier: 3 },
      { name: 'Jalgaon', tier: 3 },
      { name: 'Akola', tier: 3 },
      { name: 'Nanded', tier: 3 },
      { name: 'Sangli', tier: 3 },
      { name: 'Wai', tier: 4 },
      { name: 'Shirur', tier: 4 },
      { name: 'Mahabaleshwar', tier: 4 },
      { name: 'Pandharpur', tier: 4 },
      { name: 'Alibaug', tier: 4 },
    ],
  },
  'Karnataka': {
    state: 'Karnataka',
    region: 'South',
    cities: [
      { name: 'Bengaluru', tier: 1 },
      { name: 'Mysuru', tier: 2 },
      { name: 'Hubballi-Dharwad', tier: 2 },
      { name: 'Mangaluru', tier: 2 },
      { name: 'Belagavi', tier: 2 },
      { name: 'Udupi', tier: 3 },
      { name: 'Shivamogga', tier: 3 },
      { name: 'Tumakuru', tier: 3 },
      { name: 'Davanagere', tier: 3 },
      { name: 'Ballari', tier: 3 },
      { name: 'Sandur', tier: 4 },
      { name: 'Haliyal', tier: 4 },
      { name: 'Nanjangud', tier: 4 },
      { name: 'Virajpet', tier: 4 },
      { name: 'Byndoor', tier: 4 },
    ],
  },
  'Telangana': {
    state: 'Telangana',
    region: 'South',
    cities: [
      { name: 'Hyderabad', tier: 1 },
      { name: 'Warangal', tier: 2 },
      { name: 'Nizamabad', tier: 3 },
      { name: 'Karimnagar', tier: 3 },
      { name: 'Khammam', tier: 3 },
      { name: 'Bhongir', tier: 4 },
      { name: 'Gadwal', tier: 4 },
      { name: 'Jagtial', tier: 4 },
      { name: 'Medak', tier: 4 },
    ],
  },
  'Tamil Nadu': {
    state: 'Tamil Nadu',
    region: 'South',
    cities: [
      { name: 'Chennai', tier: 1 },
      { name: 'Coimbatore', tier: 2 },
      { name: 'Madurai', tier: 2 },
      { name: 'Tiruchirappalli', tier: 2 },
      { name: 'Salem', tier: 2 },
      { name: 'Hosur', tier: 3 },
      { name: 'Tirunelveli', tier: 3 },
      { name: 'Erode', tier: 3 },
      { name: 'Vellore', tier: 3 },
      { name: 'Coonoor', tier: 4 },
      { name: 'Kodaikanal', tier: 4 },
      { name: 'Arakkonam', tier: 4 },
      { name: 'Tenkasi', tier: 4 },
    ],
  },
  'West Bengal': {
    state: 'West Bengal',
    region: 'East',
    cities: [
      { name: 'Kolkata', tier: 1 },
      { name: 'Asansol', tier: 2 },
      { name: 'Siliguri', tier: 2 },
      { name: 'Durgapur', tier: 2 },
      { name: 'Kharagpur', tier: 3 },
      { name: 'Haldia', tier: 3 },
      { name: 'Bardhaman', tier: 3 },
      { name: 'Baharampur', tier: 3 },
      { name: 'Kalimpong', tier: 4 },
      { name: 'Kurseong', tier: 4 },
      { name: 'Bishnupur', tier: 4 },
      { name: 'Bolpur', tier: 4 },
    ],
  },
  'Gujarat': {
    state: 'Gujarat',
    region: 'West',
    cities: [
      { name: 'Ahmedabad', tier: 1 },
      { name: 'Surat', tier: 2 },
      { name: 'Vadodara', tier: 2 },
      { name: 'Rajkot', tier: 2 },
      { name: 'Bhavnagar', tier: 2 },
      { name: 'Jamnagar', tier: 2 },
      { name: 'Gandhinagar', tier: 3 },
      { name: 'Junagadh', tier: 3 },
      { name: 'Anand', tier: 3 },
      { name: 'Navsari', tier: 3 },
      { name: 'Bharuch', tier: 3 },
      { name: 'Dwarka', tier: 4 },
      { name: 'Mandvi', tier: 4 },
      { name: 'Halol', tier: 4 },
      { name: 'Dholka', tier: 4 },
      { name: 'Umreth', tier: 4 },
    ],
  },
  'Delhi': {
    state: 'Delhi',
    region: 'North',
    cities: [
      { name: 'Delhi', tier: 1 },
    ],
  },
  'Uttar Pradesh': {
    state: 'Uttar Pradesh',
    region: 'North',
    cities: [
      { name: 'Lucknow', tier: 2 },
      { name: 'Kanpur', tier: 2 },
      { name: 'Agra', tier: 2 },
      { name: 'Varanasi', tier: 2 },
      { name: 'Meerut', tier: 2 },
      { name: 'Prayagraj', tier: 2 },
      { name: 'Gorakhpur', tier: 2 },
      { name: 'Jhansi', tier: 3 },
      { name: 'Mathura', tier: 3 },
      { name: 'Aligarh', tier: 3 },
      { name: 'Bareilly', tier: 3 },
      { name: 'Moradabad', tier: 3 },
      { name: 'Saharanpur', tier: 3 },
      { name: 'Etawah', tier: 3 },
      { name: 'Khurja', tier: 4 },
      { name: 'Nakur', tier: 4 },
      { name: 'Sardhana', tier: 4 },
      { name: 'Deoband', tier: 4 },
    ],
  },
  'Rajasthan': {
    state: 'Rajasthan',
    region: 'North',
    cities: [
      { name: 'Jaipur', tier: 2 },
      { name: 'Jodhpur', tier: 2 },
      { name: 'Kota', tier: 2 },
      { name: 'Bikaner', tier: 2 },
      { name: 'Ajmer', tier: 2 },
      { name: 'Udaipur', tier: 3 },
      { name: 'Alwar', tier: 3 },
      { name: 'Bhilwara', tier: 3 },
      { name: 'Nathdwara', tier: 4 },
      { name: 'Phalodi', tier: 4 },
      { name: 'Rajsamand', tier: 4 },
      { name: 'Pilani', tier: 4 },
    ],
  },
  'Punjab': {
    state: 'Punjab',
    region: 'North',
    cities: [
      { name: 'Ludhiana', tier: 2 },
      { name: 'Amritsar', tier: 2 },
      { name: 'Jalandhar', tier: 2 },
      { name: 'Bathinda', tier: 3 },
      { name: 'Patiala', tier: 3 },
      { name: 'Pathankot', tier: 3 },
      { name: 'Hoshiarpur', tier: 3 },
      { name: 'Kotkapura', tier: 4 },
      { name: 'Nabha', tier: 4 },
      { name: 'Faridkot', tier: 4 },
      { name: 'Roopnagar', tier: 4 },
    ],
  },
  'Haryana': {
    state: 'Haryana',
    region: 'North',
    cities: [
      { name: 'Faridabad', tier: 2 },
      { name: 'Gurugram', tier: 2 },
      { name: 'Rohtak', tier: 3 },
      { name: 'Panipat', tier: 3 },
      { name: 'Hisar', tier: 3 },
      { name: 'Karnal', tier: 3 },
      { name: 'Ambala', tier: 3 },
      { name: 'Kalka', tier: 4 },
      { name: 'Pehowa', tier: 4 },
      { name: 'Hansi', tier: 4 },
      { name: 'Narnaul', tier: 4 },
    ],
  },
  'Madhya Pradesh': {
    state: 'Madhya Pradesh',
    region: 'Central',
    cities: [
      { name: 'Indore', tier: 2 },
      { name: 'Bhopal', tier: 2 },
      { name: 'Gwalior', tier: 2 },
      { name: 'Jabalpur', tier: 2 },
      { name: 'Ujjain', tier: 3 },
      { name: 'Sagar', tier: 3 },
      { name: 'Ratlam', tier: 3 },
      { name: 'Satna', tier: 3 },
      { name: 'Rewa', tier: 3 },
      { name: 'Khajuraho', tier: 4 },
      { name: 'Pachmarhi', tier: 4 },
      { name: 'Maihar', tier: 4 },
      { name: 'Itarsi', tier: 4 },
      { name: 'Sehore', tier: 4 },
    ],
  },
  'Kerala': {
    state: 'Kerala',
    region: 'South',
    cities: [
      { name: 'Kochi', tier: 2 },
      { name: 'Thiruvananthapuram', tier: 2 },
      { name: 'Kozhikode', tier: 2 },
      { name: 'Thrissur', tier: 3 },
      { name: 'Kollam', tier: 3 },
      { name: 'Palakkad', tier: 3 },
      { name: 'Alappuzha', tier: 3 },
      { name: 'Varkala', tier: 4 },
      { name: 'Munnar', tier: 4 },
      { name: 'Sulthan Bathery', tier: 4 },
      { name: 'Chengannur', tier: 4 },
    ],
  },
  'Andhra Pradesh': {
    state: 'Andhra Pradesh',
    region: 'South',
    cities: [
      { name: 'Visakhapatnam', tier: 2 },
      { name: 'Vijayawada', tier: 2 },
      { name: 'Guntur', tier: 2 },
      { name: 'Rajahmundry', tier: 3 },
      { name: 'Tirupati', tier: 3 },
      { name: 'Nellore', tier: 3 },
      { name: 'Kurnool', tier: 3 },
      { name: 'Punganur', tier: 4 },
      { name: 'Bapatla', tier: 4 },
      { name: 'Tadipatri', tier: 4 },
      { name: 'Palakollu', tier: 4 },
    ],
  },
  'Bihar': {
    state: 'Bihar',
    region: 'East',
    cities: [
      { name: 'Patna', tier: 2 },
      { name: 'Muzaffarpur', tier: 3 },
      { name: 'Gaya', tier: 3 },
      { name: 'Bhagalpur', tier: 3 },
      { name: 'Hajipur', tier: 3 },
      { name: 'Bodh Gaya', tier: 4 },
      { name: 'Forbesganj', tier: 4 },
      { name: 'Rajgir', tier: 4 },
      { name: 'Raxaul', tier: 4 },
    ],
  },
  'Odisha': {
    state: 'Odisha',
    region: 'East',
    cities: [
      { name: 'Bhubaneswar', tier: 2 },
      { name: 'Cuttack', tier: 2 },
      { name: 'Rourkela', tier: 2 },
      { name: 'Berhampur', tier: 3 },
      { name: 'Sambalpur', tier: 3 },
      { name: 'Balasore', tier: 3 },
      { name: 'Konark', tier: 4 },
      { name: 'Barbil', tier: 4 },
      { name: 'Jeypore', tier: 4 },
      { name: 'Rayagada', tier: 4 },
    ],
  },
  'Jharkhand': {
    state: 'Jharkhand',
    region: 'East',
    cities: [
      { name: 'Ranchi', tier: 2 },
      { name: 'Jamshedpur', tier: 2 },
      { name: 'Dhanbad', tier: 2 },
      { name: 'Bokaro', tier: 3 },
      { name: 'Hazaribagh', tier: 3 },
      { name: 'Deoghar', tier: 3 },
    ],
  },
  'Assam': {
    state: 'Assam',
    region: 'Northeast',
    cities: [
      { name: 'Guwahati', tier: 2 },
      { name: 'Dibrugarh', tier: 3 },
      { name: 'Silchar', tier: 3 },
      { name: 'Tezpur', tier: 3 },
      { name: 'Haflong', tier: 4 },
      { name: 'Majuli', tier: 4 },
      { name: 'Goalpara', tier: 4 },
      { name: 'Margherita', tier: 4 },
    ],
  },
  'Chhattisgarh': {
    state: 'Chhattisgarh',
    region: 'Central',
    cities: [
      { name: 'Raipur', tier: 2 },
      { name: 'Bhilai', tier: 2 },
      { name: 'Bilaspur', tier: 3 },
      { name: 'Korba', tier: 3 },
      { name: 'Durg', tier: 3 },
      { name: 'Dongargarh', tier: 4 },
      { name: 'Kanker', tier: 4 },
      { name: 'Mahasamund', tier: 4 },
    ],
  },
  'Uttarakhand': {
    state: 'Uttarakhand',
    region: 'North',
    cities: [
      { name: 'Dehradun', tier: 2 },
      { name: 'Roorkee', tier: 3 },
      { name: 'Haridwar', tier: 3 },
      { name: 'Haldwani', tier: 3 },
      { name: 'Almora', tier: 4 },
      { name: 'Pauri', tier: 4 },
      { name: 'Ranikhet', tier: 4 },
      { name: 'Uttarkashi', tier: 4 },
    ],
  },
  'Chandigarh': {
    state: 'Chandigarh',
    region: 'North',
    cities: [
      { name: 'Chandigarh', tier: 2 },
    ],
  },
  'Jammu & Kashmir': {
    state: 'Jammu & Kashmir',
    region: 'North',
    cities: [
      { name: 'Srinagar', tier: 2 },
    ],
  },
};

// ─── Helper: Get all states ─────────────────────
export function getAllStates() {
  return Object.keys(INDIA_CITIES).sort();
}

// ─── Helper: Get cities for a state ─────────────
export function getCitiesForState(stateName) {
  return INDIA_CITIES[stateName]?.cities || [];
}

// ─── Helper: Get all cities (flat list) ─────────
export function getAllCities() {
  const all = [];
  for (const [state, data] of Object.entries(INDIA_CITIES)) {
    for (const city of data.cities) {
      all.push({ ...city, state, region: data.region });
    }
  }
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Helper: Find city tier ─────────────────────
export function getCityTier(cityName, stateName) {
  if (stateName && INDIA_CITIES[stateName]) {
    const city = INDIA_CITIES[stateName].cities.find(
      c => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (city) return city.tier;
  }
  // Fallback: search all states
  for (const data of Object.values(INDIA_CITIES)) {
    const city = data.cities.find(
      c => c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (city) return city.tier;
  }
  return null;
}

// ─── Helper: Get unique tiers ───────────────────
export function getAllTiers() {
  return [1, 2, 3, 4];
}

export default INDIA_CITIES;
