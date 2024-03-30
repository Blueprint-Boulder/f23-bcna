import { ActionButton } from "../components/ActionButton"

export default function AddWildlife() {

    // get route for fields based on category

    // populate input types based on datatype

    const handleCategoryChange = () => {

    }

    return(
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-[120vh]">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
                <h1 className="text-3xl font-bold mb-8 pt-4 text-center">Add Wildlife</h1>
                <form action="" className="w-11/12 flex flex-col items-center lg:items-start mx-auto">
                    <div className="w-full lg:w-3/5">
                        <label htmlFor="categoryName">Category</label>
                        <select className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="categoryName"
                             onChange={handleCategoryChange}
                        >
                            <option disabled selected value> -- Select A Category -- </option>
                            <option value="">Example 1</option>
                            <option value="">Example 2</option>
                        </select>
                        <label htmlFor="wildlifeName">Wildlife Name</label>
                        <input type="text" className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="wildlifeName"
                        />
                        <label htmlFor="scientific">Scientific Name</label>
                        <input type="text" className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="scientific"
                        />
                        <label htmlFor="wingspan">Wingspan</label>
                        <input type="number" className="mt-1 mb-4 w-1/3 block rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="wingspan"
                             step="0.01" min="0"
                        />
                        <label htmlFor="color">Color</label>
                        <select className="mt-1 mb-4 w-1/2 block rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="color"
                        >
                            <option value="">Red</option>
                            <option value="">Yellow</option>
                            <option value="">Blue</option>
                        </select>
                    </div>
                    <div className="self-center flex gap-8 my-4 items-center">
                            <ActionButton color="red" size="lg">Cancel</ActionButton>
                            <ActionButton size="lg" disabled="true">Confirm</ActionButton>
                    </div>
                </form>
            </div>
        </div>
    )
}