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
        (!productFilter || item.productName.toLowerCase().includes(productFilter.toLowerCase()))
    );
    setFiltered(filteredData);
  }, [minFollowers, productFilter, interests]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Creator Interests</h1>
          <Link to="/dashboard/brand">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <div className="w-full lg:w-1/4 bg-gray-900 p-4 rounded-lg">
            <h2 className="font-semibold mb-4">Filters</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Minimum Followers</label>
              <input
                type="number"
                value={minFollowers}
                onChange={(e) => setMinFollowers(Number(e.target.value))}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Product Name</label>
              <input
                type="text"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                placeholder="e.g. Sneakers"
              />
            </div>
          </div>

          {/* Creator interest list */}
          <div className="w-full lg:w-3/4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-400">No matching interests found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="mb-2">
                      <h2 className="font-bold text-lg">{item.creatorName}</h2>
                      <p className="text-sm text-gray-400">
                        Interested in: {item.productName}
                      </p>
                      <p className="text-sm text-yellow-400">
                        {item.followers} Followers
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Link to={`/brand/creator-profile/${item.creatorId}`}>
                        <Button size="sm">View Profile</Button>
                      </Link>
                      <Link to={`/product/${item.productId}`}>
                        <Button size="sm" variant="outline">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatorInterests;
