export const ActionButton = ({ onClick, size, color, children, noFocus, disabled, type }) => {
    
  size = size || 'md';

  type = type || 'text';

  let styles = ``;

  switch(color){
    case("red"):
      styles = `text-${size} bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 active:bg-red-700 border-none
                focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-200 font-semibold`;
    break;

    case("gray"):
      styles = `text-${size} bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 active:bg-gray-700 border-none
              focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-200`;
    break;

    case("green"):
      styles = `text-${size} bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-600 active:bg-green-700 border-none
                focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-200`
    break;

    default:
      styles = `text-${size} bg-light-blue text-white py-2 px-4 rounded-md hover:bg-blue-500 active:bg-blue-600 border-none
                focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-200 font-semibold`
    break;
  }
  
  return (
      <button
        onClick={onClick}
        className={styles}
        tabIndex={noFocus ? '-1' : undefined}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    );
  };