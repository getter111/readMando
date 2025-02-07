export default function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-blue-600">ReadMando</div>
        <select className="bg-gray-200 p-2 rounded-md text-sm">
          <option>Words</option>
          <option>All Words</option>
        </select>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search dictionary..."
          className="p-2 border border-gray-300 rounded-md w-64"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Login / Register
        </button>
      </div>
    </header>
  );
}
