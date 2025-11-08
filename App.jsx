import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, MapPin, Heart, MessageSquare, Home, Palette, Coffee, Sun, Moon, Zap, Wind, ArrowLeft, RotateCcw, AlertCircle, Filter, X, DollarSign, Bed, Square, ExternalLink, Sliders, Menu, ChevronRight, HelpCircle } from 'lucide-react';
import { searchWithQuery, searchRentals } from './services/rapidApi';

// Mock rental data with mood/feel properties
const mockRentals = [
  {
    id: 1,
    title: "Minimalist Zen Loft",
    location: "Downtown Austin",
    price: 2800,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    mood: ["peaceful", "minimalist", "modern"],
    colors: ["white", "gray", "natural"],
    vibe: "calm and serene",
    features: ["natural light", "plants", "meditation space"],
    bedrooms: 2,
    type: "apartment"
  },
  {
    id: 2,
    title: "Vibrant Artist's Studio",
    location: "Brooklyn, NY",
    price: 3200,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    mood: ["energetic", "creative", "eclectic"],
    colors: ["colorful", "bold", "vibrant"],
    vibe: "inspiring and lively",
    features: ["high ceilings", "art walls", "workspace"],
    bedrooms: 1,
    type: "loft"
  },
  {
    id: 3,
    title: "Cozy Scandinavian Retreat",
    location: "Portland, OR",
    price: 2400,
    image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
    mood: ["cozy", "warm", "hygge"],
    colors: ["warm wood", "soft white", "natural"],
    vibe: "comfortable and inviting",
    features: ["fireplace", "reading nook", "warm lighting"],
    bedrooms: 2,
    type: "house"
  },
  {
    id: 4,
    title: "Sleek Tech Haven",
    location: "San Francisco, CA",
    price: 4200,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    mood: ["modern", "sophisticated", "smart"],
    colors: ["black", "white", "tech blue"],
    vibe: "futuristic and efficient",
    features: ["smart home", "tech setup", "city views"],
    bedrooms: 2,
    type: "apartment"
  },
  {
    id: 5,
    title: "Bohemian Garden Cottage",
    location: "Sedona, AZ",
    price: 2100,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    mood: ["bohemian", "natural", "artistic"],
    colors: ["earth tones", "green", "terracotta"],
    vibe: "free-spirited and earthy",
    features: ["garden", "outdoor space", "natural materials"],
    bedrooms: 1,
    type: "cottage"
  },
  {
    id: 6,
    title: "Luxe Urban Penthouse",
    location: "Miami, FL",
    price: 5800,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    mood: ["luxurious", "glamorous", "sophisticated"],
    colors: ["gold", "white", "navy"],
    vibe: "elegant and upscale",
    features: ["ocean view", "rooftop", "premium finishes"],
    bedrooms: 3,
    type: "penthouse"
  },
  {
    id: 7,
    title: "Industrial Chic Warehouse",
    location: "Chicago, IL",
    price: 3400,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    mood: ["industrial", "edgy", "urban"],
    colors: ["brick", "metal", "concrete"],
    vibe: "raw and authentic",
    features: ["exposed brick", "high ceilings", "open floor"],
    bedrooms: 2,
    type: "loft"
  },
  {
    id: 8,
    title: "Coastal Breeze Villa",
    location: "Santa Monica, CA",
    price: 4600,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    mood: ["breezy", "relaxed", "coastal"],
    colors: ["blue", "white", "sand"],
    vibe: "light and airy",
    features: ["beach access", "ocean view", "terrace"],
    bedrooms: 3,
    type: "villa"
  }
];

const vibeOptions = [
  { id: 'bright', icon: Sun, label: "Bright & Airy", keywords: ['bright', 'airy', 'light', 'sunny'] },
  { id: 'cozy', icon: Moon, label: "Cozy & Intimate", keywords: ['cozy', 'warm', 'intimate', 'comfortable'] },
  { id: 'modern', icon: Zap, label: "Modern & Minimal", keywords: ['modern', 'minimalist', 'sleek', 'contemporary'] },
  { id: 'colorful', icon: Palette, label: "Colorful & Bold", keywords: ['colorful', 'vibrant', 'bold', 'creative'] },
  { id: 'warm', icon: Coffee, label: "Warm & Inviting", keywords: ['warm', 'inviting', 'hygge', 'comfortable'] },
  { id: 'coastal', icon: Wind, label: "Coastal & Fresh", keywords: ['coastal', 'breezy', 'fresh', 'ocean'] }
];

const amenityOptions = [
  'Parking', 'Pet Friendly', 'Laundry', 'Air Conditioning', 'Heating', 
  'Dishwasher', 'Gym', 'Pool', 'Balcony', 'Elevator', 'Fireplace', 'Garden'
];

const followUpSuggestions = [
  "Show me something brighter",
  "More affordable options",
  "Bigger spaces with more bedrooms",
  "Something more modern",
  "Show me cozy alternatives"
];

const getDescriptionPreview = (description, vibe) => {
  const rawText = description && description.trim().length > 0
    ? description.trim()
    : (vibe ? `Feels ${vibe}` : '');
  
  if (!rawText) return '';
  return rawText.length > 160 ? `${rawText.slice(0, 157)}...` : rawText;
};

const parsePriceConstraints = (query) => {
  const filters = {};
  const underMatch = query.match(/under\s*\$?\s*(\d+[kK]?)/i) || query.match(/below\s*\$?\s*(\d+[kK]?)/i);
  if (underMatch) {
    filters.maxPrice = parseInt(underMatch[1].replace(/[kK]/, '000'), 10);
  }

  const overMatch = query.match(/over\s*\$?\s*(\d+[kK]?)/i) || query.match(/above\s*\$?\s*(\d+[kK]?)/i);
  if (overMatch) {
    filters.minPrice = parseInt(overMatch[1].replace(/[kK]/, '000'), 10);
  }

  const rangeMatch = query.match(/\$?\s*(\d+[kK]?)\s*[-–—to]\s*\$?\s*(\d+[kK]?)/i);
  if (rangeMatch) {
    filters.minPrice = parseInt(rangeMatch[1].replace(/[kK]/, '000'), 10);
    filters.maxPrice = parseInt(rangeMatch[2].replace(/[kK]/, '000'), 10);
  }

  const lowerQuery = query.toLowerCase();
  if ((lowerQuery.includes('affordable') || lowerQuery.includes('budget') || lowerQuery.includes('cheap')) && !filters.maxPrice) {
    filters.maxPrice = 2000;
  }
  if ((lowerQuery.includes('luxury') || lowerQuery.includes('upscale') || lowerQuery.includes('premium')) && !filters.minPrice) {
    filters.minPrice = 4000;
  }

  return filters;
};

export default function App() {
  const [activeView, setActiveView] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', message: 'Hi! I\'m your AI rental assistant. Tell me what kind of space you\'re dreaming of - describe the mood, colors, or feeling you want, and I\'ll find your perfect match! ✨' }
  ]);
  const [allRentals, setAllRentals] = useState(mockRentals);
  const [filteredRentals, setFilteredRentals] = useState(mockRentals);
  const [favorites, setFavorites] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchContext, setSearchContext] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [usingRealData, setUsingRealData] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null); // Track current search location
  const chatEndRef = useRef(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    location: { city: '', state: '' },
    selectedVibes: [],
    priceRange: { min: 0, max: 10000 },
    bedrooms: null,
    bathrooms: null,
    squareFootage: { min: 0, max: 5000 },
    selectedAmenities: [],
    propertyType: null
  });

  // Example questions that work
  const exampleQuestions = [
    "I am looking for a cozy modern apartment in Dallas under 2000$",
    "cozy apartment in dallas under 2000$ with a vibey area",
    "Are there short term rentals available near me",
    "Show me affordable 2 bedroom apartments in Austin TX",
    "I need a bright spacious loft in San Francisco CA under 3000",
    "Find me a luxury penthouse in Miami FL with ocean view",
    "cozy warm apartment in Portland OR under 2500",
    "modern minimalist 1 bedroom in Seattle WA",
    "pet friendly rentals in Denver CO under 2000",
    "2 bed 2 bath apartment in Chicago IL",
    "affordable studio in New York NY",
    "luxury apartment in Los Angeles CA with parking",
    "cozy house in Boston MA under 3000",
    "bright modern loft in Atlanta GA",
    "1 bedroom apartment in Phoenix AZ under 1500",
    "spacious 3 bedroom in Houston TX",
    "coastal apartment in San Diego CA",
    "affordable housing in Philadelphia PA",
    "modern apartment in Detroit MI under 2000",
    "cozy studio in Minneapolis MN"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  // Apply filters to rentals
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, allRentals]);

  const applyFilters = () => {
    let filtered = [...allRentals];

    // Location filter
    if (filters.location.city) {
      filtered = filtered.filter(r => 
        r.location.toLowerCase().includes(filters.location.city.toLowerCase())
      );
    }
    if (filters.location.state) {
      filtered = filtered.filter(r => 
        r.location.toLowerCase().includes(filters.location.state.toLowerCase())
      );
    }

    // Vibe filter
    if (filters.selectedVibes.length > 0) {
      filtered = filtered.filter(r => {
        const rentalMoods = r.mood.map(m => m.toLowerCase());
        return filters.selectedVibes.some(vibeId => {
          const vibe = vibeOptions.find(v => v.id === vibeId);
          return vibe && vibe.keywords.some(keyword => 
            rentalMoods.some(mood => mood.includes(keyword))
          );
        });
      });
    }

    // Price filter
    filtered = filtered.filter(r => 
      r.price >= filters.priceRange.min && r.price <= filters.priceRange.max
    );

    // Bedrooms filter
    if (filters.bedrooms !== null) {
      filtered = filtered.filter(r => r.bedrooms >= filters.bedrooms);
    }

    // Bathrooms filter
    if (filters.bathrooms !== null) {
      filtered = filtered.filter(r => r.bathrooms >= filters.bathrooms);
    }

    // Square footage filter
    filtered = filtered.filter(r => {
      if (!r.squareFootage) return true; // Include if no square footage data
      return r.squareFootage >= filters.squareFootage.min && 
             r.squareFootage <= filters.squareFootage.max;
    });

    // Amenities filter
    if (filters.selectedAmenities.length > 0) {
      filtered = filtered.filter(r => {
        const rentalFeatures = r.features.map(f => f.toLowerCase());
        return filters.selectedAmenities.every(amenity => 
          rentalFeatures.some(feature => feature.includes(amenity.toLowerCase()))
        );
      });
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(r => 
        r.type.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    setFilteredRentals(filtered);
  };

  const toggleVibe = (vibeId) => {
    setFilters(prev => ({
      ...prev,
      selectedVibes: prev.selectedVibes.includes(vibeId)
        ? prev.selectedVibes.filter(id => id !== vibeId)
        : [...prev.selectedVibes, vibeId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: { city: '', state: '' },
      selectedVibes: [],
      priceRange: { min: 0, max: 10000 },
      bedrooms: null,
      bathrooms: null,
      squareFootage: { min: 0, max: 5000 },
      selectedAmenities: [],
      propertyType: null
    });
  };

  const analyzeQuery = async (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Try to use RentCast API first
    try {
      console.log('🔎 Analyzing query:', query);
      console.log('📍 Previous location context:', currentLocation);
      const apiResults = await searchWithQuery(query, currentLocation);
      console.log('📋 API Results:', apiResults);
      
      if (apiResults && apiResults.length > 0) {
        console.log('✅ Using', apiResults.length, 'real listings');
        setUsingRealData(true);
        setApiError(null);
        setAllRentals(apiResults);
        
        // Extract and save location from results for context
        if (apiResults.length > 0) {
          const firstResult = apiResults[0];
          const locationMatch = firstResult.location.match(/([^,]+),\s*([A-Z]{2})/);
          if (locationMatch) {
            setCurrentLocation({
              city: locationMatch[1].trim(),
              state: locationMatch[2]
            });
          }
        }
        
        return apiResults;
      } else if (apiResults && apiResults.length === 0) {
        console.log('⚠️ API returned empty results, falling back to mock data');
        setApiError('No listings found for this location. Showing demo data instead.');
        setUsingRealData(false);
      } else {
        console.log('⚠️ API returned null, falling back to mock data');
        setUsingRealData(false);
      }
    } catch (error) {
      console.error('❌ API search failed, falling back to mock data:', error);
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('inactive') || errorMessage.includes('401') || errorMessage.includes('403')) {
        setApiError('API key error. Please check your RapidAPI key in the .env file.');
      } else {
        setApiError(`Using demo data. ${errorMessage}`);
      }
      setUsingRealData(false);
    }
    
    // Fallback to mock data filtering
    setUsingRealData(false);
    
    // Extract location from query for mock data too
    const location = currentLocation || extractLocationFromQuery(query);
    const priceFilters = parsePriceConstraints(query);
    
    // Check for price-related queries
    const affordable = lowerQuery.includes('affordable') || lowerQuery.includes('cheap') || lowerQuery.includes('budget');
    const expensive = lowerQuery.includes('luxury') || lowerQuery.includes('upscale') || lowerQuery.includes('premium');
    
    // Check for size queries
    const bigger = lowerQuery.includes('bigger') || lowerQuery.includes('larger') || lowerQuery.includes('spacious');
    const bedrooms = lowerQuery.match(/(\d+)\s*bed/);
    
    let results = mockRentals.filter(rental => {
      const searchText = `${rental.title} ${rental.mood.join(' ')} ${rental.colors.join(' ')} ${rental.vibe} ${rental.features.join(' ')} ${rental.location} ${rental.type}`.toLowerCase();
      
      // Location filter - strict matching
      if (location && location.city) {
        const rentalLocation = (rental.location || '').toLowerCase();
        const searchCity = location.city.toLowerCase();
        if (!rentalLocation.includes(searchCity)) {
          return false;
        }

        if (location.state) {
          const searchState = location.state.toLowerCase();
          const addressString = (rental.address || '').toLowerCase();
          const addressStateMatch = (rental.address || '').match(/\b([A-Z]{2})\b/);
          const addressState = addressStateMatch ? addressStateMatch[1].toLowerCase() : null;
          const originalStateRaw = rental.originalData?.state || rental.originalData?.addressState || rental.originalData?.stateCode || '';
          const originalState = originalStateRaw ? String(originalStateRaw).toLowerCase() : '';
          const locationHasState = rentalLocation.includes(searchState);
          const matchesState = locationHasState || addressString.includes(searchState) || (addressState && addressState === searchState) || (originalState && originalState === searchState);
          const hasReliableState = Boolean(locationHasState || addressState || originalState);

          if (!matchesState && hasReliableState) {
            return false;
          }
        }
      }
      
      const words = lowerQuery.split(' ').filter(w => w.length > 2);
      const matchesKeywords = words.some(word => searchText.includes(word));
      
      // Apply filters
      if (affordable && rental.price > 3000) return false;
      if (expensive && rental.price < 4000) return false;
      if (priceFilters.maxPrice && rental.price > priceFilters.maxPrice) return false;
      if (priceFilters.minPrice && rental.price < priceFilters.minPrice) return false;
      if (bigger && rental.bedrooms < 2) return false;
      if (bedrooms && rental.bedrooms !== parseInt(bedrooms[1])) return false;
      
      return matchesKeywords || affordable || expensive || bigger;
    });

    // If no results, return all as suggestions (but still filter by location if specified)
    if (results.length === 0 && location && location.city) {
      // If location was specified but no matches, return empty
      results = [];
    } else if (results.length === 0) {
      results = mockRentals;
    }
    
    setAllRentals(results);
    return results;
  };

  const generateAIResponse = (query, resultCount) => {
    const lowerQuery = query.toLowerCase();
    
    if (resultCount === 0) {
      return "I couldn't find exact matches for that, but here are some amazing spaces I think you'll love! Try refining your search or ask me follow-up questions. 💫";
    }
    
    if (lowerQuery.includes('affordable') || lowerQuery.includes('budget')) {
      return `Great choice! I found ${resultCount} budget-friendly ${resultCount === 1 ? 'property' : 'properties'} that still look amazing! 💰`;
    }
    
    if (lowerQuery.includes('bright') || lowerQuery.includes('light')) {
      return `Perfect! Found ${resultCount} bright and airy ${resultCount === 1 ? 'space' : 'spaces'} with tons of natural light! ☀️`;
    }
    
    if (lowerQuery.includes('cozy') || lowerQuery.includes('warm')) {
      return `Love it! Here ${resultCount === 1 ? 'is' : 'are'} ${resultCount} cozy ${resultCount === 1 ? 'space' : 'spaces'} perfect for relaxing! 🏡`;
    }
    
    return `Excellent! I found ${resultCount} perfect ${resultCount === 1 ? 'match' : 'matches'} for "${query}". Want me to refine this further? 🎯`;
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatHistory([...chatHistory, { type: 'user', message: userMessage }]);
    setSearchContext([...searchContext, userMessage]);
    setIsTyping(true);
    setIsLoading(true);
    setApiError(null);

    try {
      const results = await analyzeQuery(userMessage);
      setFilteredRentals(results);
      
      const responseMessage = generateAIResponse(userMessage, results.length);
      
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: responseMessage,
        showSuggestions: true 
      }]);
      setIsTyping(false);
      setIsLoading(false);
      setActiveView('results');
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setIsTyping(false);
      setIsLoading(false);
      setApiError('Search failed. Please try again.');
    }

    setChatMessage('');
  };

  const handleQuickFilter = async (query) => {
    setChatHistory([...chatHistory, { type: 'user', message: query }]);
    setSearchContext([...searchContext, query]);
    setIsTyping(true);
    setIsLoading(true);
    setApiError(null);

    try {
      const results = await analyzeQuery(query);
      setFilteredRentals(results);
      
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: generateAIResponse(query, results.length),
        showSuggestions: true
      }]);
      setIsTyping(false);
      setIsLoading(false);
      setActiveView('results');
    } catch (error) {
      console.error('Error in handleQuickFilter:', error);
      setIsTyping(false);
      setIsLoading(false);
      setApiError('Search failed. Please try again.');
    }
  };

  const handleFollowUp = (suggestion) => {
    handleQuickFilter(suggestion);
  };

  const resetSearch = () => {
    setAllRentals(mockRentals);
    setFilteredRentals(mockRentals);
    setSearchContext([]);
    setChatHistory([
      { type: 'ai', message: 'Let\'s start fresh! What kind of space are you looking for? ✨' }
    ]);
    setActiveView('chat');
    setUsingRealData(false);
    setApiError(null);
    setCurrentLocation(null); // Clear location context
    clearFilters();
  };

  const goBackToChat = () => {
    setActiveView('chat');
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  // Helper to extract location from query for mock data
  const extractLocationFromQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const majorCities = [
      'dallas', 'austin', 'houston', 'san antonio', 'portland', 'seattle', 'denver',
      'chicago', 'new york', 'los angeles', 'san francisco', 'miami', 'atlanta',
      'boston', 'philadelphia', 'phoenix', 'san diego', 'detroit', 'minneapolis'
    ];
    
    let city = null;
    const stateMatch = query.match(/\b([A-Z]{2})\b/);
    const state = stateMatch ? stateMatch[1] : null;
    
    for (const cityName of majorCities) {
      if (lowerQuery.includes(cityName)) {
        city = cityName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
    
    return city ? { city, state } : null;
  };

  const handleExampleQuestion = async (question) => {
    setChatMessage(question);
    // Add to chat history
    setChatHistory([...chatHistory, { type: 'user', message: question }]);
    setSearchContext([...searchContext, question]);
    setIsTyping(true);
    setIsLoading(true);
    setApiError(null);

    try {
      const results = await analyzeQuery(question);
      setFilteredRentals(results);
      
      const responseMessage = generateAIResponse(question, results.length);
      
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: responseMessage,
        showSuggestions: true 
      }]);
      setIsTyping(false);
      setIsLoading(false);
      setActiveView('results');
      setChatMessage('');
    } catch (error) {
      console.error('Error in handleExampleQuestion:', error);
      setIsTyping(false);
      setIsLoading(false);
      setApiError('Search failed. Please try again.');
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 z-40 transition-transform duration-300 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto`}>
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Menu className="w-5 h-5" />
              Filters & Help
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Current Location Context */}
          {currentLocation && (
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-slate-400 mb-1">Current Search Location</p>
              <p className="text-sm font-medium text-blue-300">
                {currentLocation.city}, {currentLocation.state}
              </p>
            </div>
          )}

          {/* Filters Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={filters.location.city}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={filters.location.state}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    location: { ...prev.location, state: e.target.value }
                  }))}
                  className="w-20 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 10000 }
                  }))}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
                <Bed className="w-4 h-4" />
                Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  bedrooms: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Bathrooms</label>
              <select
                value={filters.bathrooms || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  bathrooms: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>

            {/* Vibes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Vibes</label>
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map((vibe) => {
                  const Icon = vibe.icon;
                  const isSelected = filters.selectedVibes.includes(vibe.id);
                  return (
                    <button
                      key={vibe.id}
                      onClick={() => toggleVibe(vibe.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-blue-500/50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{vibe.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {amenityOptions.map((amenity) => {
                  const isSelected = filters.selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        selectedAmenities: prev.selectedAmenities.includes(amenity)
                          ? prev.selectedAmenities.filter(a => a !== amenity)
                          : [...prev.selectedAmenities, amenity]
                      }))}
                      className={`px-2 py-1 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-blue-500/50'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-sm text-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          </div>

          {/* Example Questions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Example Questions
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {exampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleQuestion(question)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all text-sm text-slate-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed left-4 top-24 z-30 p-3 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showSidebar ? 'ml-80' : 'ml-0'}`}>
      {/* Header */}
        <header className="fixed top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/50" style={{ left: showSidebar ? '20rem' : '0', right: '0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SpaceAI
                </h1>
                <p className="text-xs text-slate-400">Powered by AI</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {activeView === 'results' && (
                <button
                  onClick={goBackToChat}
                  className="px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <button
                onClick={() => setActiveView('chat')}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  activeView === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setActiveView('results')}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  activeView === 'results'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Results</span>
                {filteredRentals.length < mockRentals.length && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {filteredRentals.length}
                  </span>
                )}
              </button>
              {searchContext.length > 0 && (
                <button
                  onClick={resetSearch}
                  className="px-4 py-2 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2"
                  title="Start new search"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {activeView === 'chat' ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            {searchContext.length === 0 && (
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">AI-Powered Discovery</span>
                  {usingRealData && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full ml-2">
                      Live Data
                    </span>
                  )}
                </div>
                <h2 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Find Your Perfect Space
                </h2>
                <p className="text-xl text-slate-400">
                  Describe your dream rental in your own words
                </p>
                {apiError && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{apiError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Vibe Filters */}
            {searchContext.length === 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Filter by Vibes (Optional)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vibeOptions.map((vibe) => {
                    const Icon = vibe.icon;
                    const isSelected = filters.selectedVibes.includes(vibe.id);
                    return (
                      <button
                        key={vibe.id}
                        onClick={() => toggleVibe(vibe.id)}
                        className={`p-4 rounded-2xl border transition-all text-left group ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500/50'
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 group-hover:scale-110 transition-transform ${
                          isSelected ? 'text-blue-400' : 'text-blue-400'
                        }`} />
                        <p className="text-sm font-medium">{vibe.label}</p>
                        {isSelected && (
                          <span className="text-xs text-blue-400 mt-1">✓ Selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat History */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-6 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {chatHistory.map((chat, idx) => (
                <div key={idx}>
                  <div className={`mb-4 flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        chat.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      {chat.message}
                    </div>
                  </div>
                  {chat.showSuggestions && chat.type === 'ai' && (
                    <div className="mb-4 flex justify-start">
                      <div className="max-w-[90%]">
                        <p className="text-xs text-slate-500 mb-2 ml-1">Try asking:</p>
                        <div className="flex flex-wrap gap-2">
                          {followUpSuggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleFollowUp(suggestion)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-blue-500/50 text-xs text-slate-300 transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-2 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={searchContext.length > 0 ? "Refine your search..." : "E.g., 'bright modern loft with plants' or 'cozy warm space'"}
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {searchContext.length > 0 ? 'Refine' : 'Search'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
              <h2 className="text-3xl font-bold mb-2">
                  {filteredRentals.length === allRentals.length && allRentals.length === mockRentals.length
                  ? 'All Properties'
                    : `Found ${filteredRentals.length} ${filteredRentals.length === 1 ? 'Match' : 'Matches'}`}
              </h2>
              <p className="text-slate-400">
                  {filteredRentals.length === allRentals.length && allRentals.length === mockRentals.length
                  ? 'Discover amazing spaces across the country'
                  : 'AI-curated rentals based on your preferences'}
              </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={filters.location.city}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="State (e.g., TX)"
                        value={filters.location.state}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          location: { ...prev.location, state: e.target.value }
                        }))}
                        className="w-24 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange.min || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                        }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max || ''}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 10000 }
                        }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      Bedrooms
                    </label>
                    <select
                      value={filters.bedrooms || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        bedrooms: e.target.value ? parseInt(e.target.value) : null
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Vibes */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Vibes</label>
                  <div className="flex flex-wrap gap-2">
                      {vibeOptions.map((vibe) => {
                        const Icon = vibe.icon;
                        const isSelected = filters.selectedVibes.includes(vibe.id);
                        return (
                      <button
                            key={vibe.id}
                            onClick={() => toggleVibe(vibe.id)}
                            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-blue-500/50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{vibe.label}</span>
                      </button>
                        );
                      })}
                  </div>
                </div>

                  {/* Amenities */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map((amenity) => {
                        const isSelected = filters.selectedAmenities.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              selectedAmenities: prev.selectedAmenities.includes(amenity)
                                ? prev.selectedAmenities.filter(a => a !== amenity)
                                : [...prev.selectedAmenities, amenity]
                            }))}
                            className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-blue-500/50'
                            }`}
                          >
                            {amenity}
                          </button>
                        );
                      })}
            </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="group bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-slate-800/50 overflow-hidden hover:border-blue-500/50 transition-all hover:scale-[1.02]"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-800">
                    <img
                      src={rental.image}
                      alt={rental.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800`;
                      }}
                    />
                    <button
                      onClick={() => toggleFavorite(rental.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-950/70 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(rental.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-white'
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                      {rental.mood.slice(0, 2).map((m, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm text-xs font-medium border border-slate-700/50"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{rental.title}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {rental.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-4">
                      {getDescriptionPreview(rental.description, rental.vibe)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">
                          {rental.price > 0 ? (
                            <>
                              ${rental.price.toLocaleString()}
                              <span className="text-sm text-slate-400 font-normal">/mo</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">Price on request</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{rental.bedrooms} bed · {rental.type}</p>
                      </div>
                      {rental.url && rental.url.startsWith('http') ? (
                        <a
                          href={rental.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(rental.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
                        >
                          View
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <button 
                          className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-medium"
                          disabled
                          title="Property link not available"
                        >
                          No Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
