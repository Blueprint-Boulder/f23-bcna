export const ActionButton = ({ onClick, size, color, children, noFocus, disabled, type }) => {
    
  size = size || 'md';

  type = type || 'text';

  let styles = ``;

  switch(color){
    case("red"):
      styles = `text-${size} bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 active:bg-red-700 
                focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-700`;
    break;

    case("green"):
      styles = `text-${size} bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-600 active:bg-green-700
                focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-700`
    break;

    default:
      styles = `text-${size} bg-light-blue text-white py-2 px-4 rounded-md hover:bg-blue-500 active:bg-blue-600
                focus:outline-none focus:ring focus:border-light-blue-dark flex gap-2 disabled:bg-gray-200`
    break;
  }
  
  return (
      <button
        onClick={onClick}
        className={styles}
        tabindex={noFocus ? '-1' : undefined}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    );
  };