import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import BrandAPI from "../brandApi";

const CreatorInterests = () => {
  const [interests, setInterests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [minFollowers, setMinFollowers] = useState(0);
  const [productFilter, setProductFilter] = useState("");
  const [creatorNameFilter, setCreatorNameFilter] = useState("");

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
    const filteredData = interests.filter(
      (item) =>
        item.followers >= minFollowers &&
        (!productFilter || item.productName.toLowerCase().includes(productFilter.toLowerCase())) &&
        (!creatorNameFilter || item.creatorName.toLowerCase().includes(creatorNameFilter.toLowerCase()))
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Creator Interests</h1>
            <p className="text-gray-300">Discover creators interested in your products</p>
          </div>
          <Link to="/dashboard/brand">
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
                type="text"
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
                    <h2 className="font-bold text-xl text-gray-100 truncate">{item.creatorName}</h2>
                    <div className="flex items-center text-yellow-600 bg-yellow-900 bg-opacity-30 px-2 py-1 rounded-full text-xs font-medium">
                      <svg className="w-4 h-4 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>

                      {item.followers.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">Interested in:</span>
                  </div>
                  <p className="text-sm text-gray-200 font-medium bg-[#2B2B2B] px-3 py-1 rounded-lg">
                    {item.productName}
                  </p>
                </div>


                {/* Address */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-400 mb-1">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Address:</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed break-words pl-6">
                    {item.data.address}
                  </p>
                </div>

                {/* Note Section */}
                {item.data.note && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">Note:</span>
                    </div>
                    <div className="bg-yellow-900 bg-opacity-20 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                      <p className="text-sm text-gray-200 italic leading-relaxed">
                        "{item.data.note}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected Options */}
                {Object.keys(item.data.selectedOptions).length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium">Preferences:</span>
                    </div>
                    <div className="space-y-2 pl-6">
                      {Object.entries(item.data.selectedOptions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-[#2B2B2B] px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-sm text-gray-200 font-medium">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                  <Link to={`/brand/creator-profile/${item.creatorId}`} className="w-full">
                    <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2">
                      View Profile
                    </Button>
                  </Link>
                  <Link to={`/product/${item.productId}`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 font-medium py-2">
                      View Product
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CreatorInterests;