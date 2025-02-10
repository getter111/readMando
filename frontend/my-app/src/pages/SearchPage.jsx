import { useParams } from "react-router-dom";

export default function SearchPage() {
  const { vocab } = useParams();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Search Results for: {vocab}</h2>
      <p>dictionary results for: {vocab}</p>
    </div>
  );
}
