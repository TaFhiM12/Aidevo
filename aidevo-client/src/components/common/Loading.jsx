const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-teal-500 border-t-emerald-600"></div>
        <p className="mt-4 text-lg font-medium text-teal-700">Loading Tasks...</p>
      </div>
    </div>
  );
};

export default Loading;