const Spinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-emerald-500 rounded-full" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

export default Spinner;
