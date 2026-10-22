import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import BrandAPI from "../brandApi";
import { OfferAPI } from "../utils/marketplaceApi";
import { Handshake } from "lucide-react";

const CreatorInterests = () => {
  const [interests, setInterests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [minFollowers, setMinFollowers] = useState(0);
  const [productFilter, setProductFilter] = useState("");
  const [creatorNameFilter, setCreatorNameFilter] = useState("");

  // Offer Creation Modal State
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [offerBudget, setOfferBudget] = useState("");
  const [offerTerms, setOfferTerms] = useState("");
  const [creatingOffer, setCreatingOffer] = useState(false);
  const navigate = useNavigate();

  const handleMakeOffer = (item) => {
    setSelectedInterest(item);
    setOfferBudget("");
    setOfferTerms(`Campaign collaboration for ${item.productName}`);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerBudget || Number(offerBudget) < 0) {
      alert("Please specify a valid budget");
      return;
    }
    try {
      setCreatingOffer(true);
      const res = await OfferAPI.create({
        product_id: selectedInterest.productId,
        creator_id: selectedInterest.creatorId,
        budget: Number(offerBudget),
        terms: offerTerms,
      });
      alert("Offer sent successfully! Redirecting to deal workspace...");
      navigate(`/offers/${res.data.offer.id}`);
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.offer) {
        alert("An offer is already active for this product! Opening deal workspace...");
        navigate(`/offers/${err.response.data.offer.id}`);
      } else {
        alert(err.response?.data?.msg || "Failed to create offer");
      }
    } finally {
      setCreatingOffer(false);
    }
  };

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await BrandAPI.get("/interests");
        setInterests(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Failed to fetch creator interests:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterests();
  }, []);

  useEffect(() => {
    const minFollowersNum = Number(minFollowers) || 0;
    const filteredData = interests.filter(
      (item) =>
        (item.followers || 0) >= minFollowersNum &&
        (!productFilter || (item.productName || "").toLowerCase().includes(productFilter.toLowerCase())) &&
        (!creatorNameFilter || (item.creatorName || "").toLowerCase().includes(creatorNameFilter.toLowerCase()))
    );
    setFiltered(filteredData);
  }, [minFollowers, productFilter, creatorNameFilter, interests]);

  const clearFilters = () => {
    setMinFollowers(0);
    setProductFilter("");
    setCreatorNameFilter("");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Creator Interests</h1>
            <p className="text-gray-300">Discover creators interested in your products</p>
          </div>
          <Link to="/dashboard/brand" className="self-start sm:self-auto">
            <Button variant="outline" className="px-6 border-gray-600 text-gray-200 hover:bg-gray-700">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Filters Section */}
        <Card className="p-6 mb-8 bg-[#242424] border-l-4 border-l-yellow-400 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 ">
            <div className="md:col-span-4" >
              <label className="block text-sm font-medium text-gray-300 mb-2">Creator Name</label>
              <input
                type="text"
                placeholder="Search by creator name..."
                value={creatorNameFilter}
                onChange={(e) => setCreatorNameFilter(e.target.value)}
                className="w-full px-4 py-2 bg-[#2B2B2B]  border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
              <input
                type="text"
                placeholder="Search by product..."
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-4 py-2 bg-[#2B2B2B] border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Followers</label>
              <input
                type="number"
                min="0"
                placeholder="Min Followers..."
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                className="w-full px-4 py-2 bg-[#2B2B2B] border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
              />
            </div>



            <div className="flex items-end md:col-span-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 "
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filtered.length} of {interests.length} creator interests
          </div>
        </Card>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mb-4"></div>
            <p className="text-gray-300 text-lg">Loading creator interests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-gray-800 border-gray-700">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No matching interests found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more results.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow duration-300 bg-[#2E2E2E] border border-gray-700 hover:border-gray-600">
                {/* Creator Header */}
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-bold text-xl text-white truncate">{item.creatorName}</h2>
                    <div className="flex items-center text-yellow-300 bg-yellow-400/20 border border-yellow-400/30 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <svg className="w-4 h-4 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      {(item.followers || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-300 mb-2">
                    <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">Interested in:</span>
                  </div>
                  <p className="text-sm text-yellow-300 font-semibold bg-[#1a1a1a] border border-gray-700 px-3 py-1.5 rounded-lg truncate">
                    {item.productName}
                  </p>
                </div>

                {/* Address */}
                {item.data?.address && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-300 mb-1">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Address:</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed break-words pl-6">
                      {item.data.address}
                    </p>
                  </div>
                )}

                {/* Note Section */}
                {item.data?.note && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">Note:</span>
                    </div>
                    <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                      <p className="text-sm text-gray-100 italic leading-relaxed">
                        "{item.data.note}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected Options */}
                {item.data?.selectedOptions && Object.keys(item.data.selectedOptions).length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium">Preferences:</span>
                    </div>
                    <div className="space-y-2 pl-6">
                      {Object.entries(item.data.selectedOptions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-[#1a1a1a] border border-gray-700/80 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-sm text-yellow-300 font-semibold">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-700">
                  <Button
                    onClick={() => handleMakeOffer(item)}
                    size="sm"
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Handshake className="w-4 h-4" />
                    Make Collaboration Offer
                  </Button>
                  <div className="flex items-center gap-2">
                    <Link to={`/brand/creator-profile/${item.creatorId}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 py-1.5 text-xs">
                        View Profile
                      </Button>
                    </Link>
                    <Link to={`/product/${item.productId}`} className="flex-1">
                      <Button size="sm" variant="secondary" className="w-full font-medium py-1.5 text-xs">
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Make Offer Modal */}
        {selectedInterest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1c1c1e] border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
                <div className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-bold text-lg">Send Collaboration Offer</h3>
                </div>
                <button
                  onClick={() => setSelectedInterest(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-[#242428] rounded-xl text-xs space-y-1 mb-4 text-neutral-300">
                <p><strong>Product:</strong> {selectedInterest.productName}</p>
                <p><strong>Creator:</strong> {selectedInterest.creatorName}</p>
                <p><strong>Followers:</strong> {selectedInterest.followers?.toLocaleString() || 0}</p>
              </div>

              <form onSubmit={handleOfferSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Initial Proposed Budget (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    placeholder="e.g. 15000"
                    value={offerBudget}
                    onChange={(e) => setOfferBudget(e.target.value)}
                    className="w-full bg-[#141416] border border-neutral-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Deliverables &amp; Campaign Scope
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={offerTerms}
                    onChange={(e) => setOfferTerms(e.target.value)}
                    placeholder="e.g. 1 Instagram Reel + 2 Stories featuring product unboxing..."
                    className="w-full bg-[#141416] border border-neutral-700 rounded-xl p-3 text-xs text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInterest(null)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-xs font-semibold hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingOffer}
                    className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {creatingOffer ? "Sending..." : "Send Offer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CreatorInterests;