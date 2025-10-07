export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">Tailwind Test</h1>
      <div className="bg-red-500 p-4 rounded-lg">
        <p className="text-white">If you can see this with styling, Tailwind is working!</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-green-500 p-4 rounded">Green</div>
        <div className="bg-blue-500 p-4 rounded">Blue</div>
        <div className="bg-purple-500 p-4 rounded">Purple</div>
      </div>
    </div>
  );
}
