export const ActionButton = ({ onClick, size, color, children, noFocus }) => {
    
  size = size || 'md';

  let styles = ``;

  switch(color){
    case("red"):
      styles = `text-${size} bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring focus:border-light-blue-dark`;
    break;

    case("green"):
      styles = `text-${size} bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring focus:border-light-blue-dark`
    break;

    default:
      styles = `text-${size} bg-light-blue text-white py-2 px-4 rounded-md hover:bg-blue-500 active:bg-blue-600 focus:outline-none focus:ring focus:border-light-blue-dark`
    break;
  }
  
  return (
      <button
        onClick={onClick}
        className={styles}
        tabindex={noFocus ? '-1' : undefined}
      >
        {children}
      </button>
    );
  };