import { ActionButton } from "../components/ActionButton";
import { useState } from "react";

export default function AddCategory() {

    const [fieldsText, setFieldsText] = useState("Fields: ");

    const addField = () => {

    }

    return(
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-[120vh]">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
                <h1 className="text-3xl font-bold mb-8 pt-4 text-center">Add Category</h1>
                <form action="" className="w-11/12 flex flex-col items-center lg:items-start mx-auto">
                    <div className="w-full lg:w-3/5">
                        <label htmlFor="name">Category Name</label>
                        <input type="text" className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="name"
                        />
                        <label htmlFor="name">Parent Category</label>
                        <select className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="parent"
                        >
                            <option value="">Example 1</option>
                            <option value="">Example 2</option>
                        </select>
                    
                        {/* <ActionButton onClick={addField()}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span className="text-lg">Add Field</span>
                        </ActionButton> */}


                    </div>
                </form>
            </div>
        </div>
    )
}