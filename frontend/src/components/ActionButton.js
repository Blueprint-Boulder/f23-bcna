export const ActionButton = ({ onClick, children }) => {
    return (
      <button
        onClick={onClick}
        className="bg-light-blue text-white py-2 px-4 rounded-md 
        hover:bg-blue-500 active:bg-blue-600
        focus:outline-none focus:ring focus:border-light-blue-dark"
      >
        {children}
      </button>
    );
  };