export const ActionButton = ({ onClick, children }) => {
    return (
      <button
        onClick={onClick}
        className="bg-light-blue text-white py-2 px-7 rounded-md hover:bg-opacity-75"
      >
        {children}
      </button>
    );
  };