import { ActionButton } from "../components/ActionButton";
import { useState, useEffect } from "react";

export default function EditCategory() {

    const[categories, setCategories] = useState([]);
    const[selectedCategory, setSelectedCategory] = useState(null);
    const[fields, setFields] = useState({});
    const[displayedFields, setDisplayedFields] = useState([]);
    const[newField, setNewField] = useState("");
    const[addingField, setAddingField] = useState(false);

    const fetchData = async () => {
        try {
          const response = await fetch('/api/get-categories-and-fields/');
          const data = await response.json();
          setCategories(data.categories);
          setFields(data.fields);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if(selectedCategory){
            setSelectedCategory(categories.find(cat => cat.id == selectedCategory.id));
        }
    }, [categories]);
    
    useEffect(() => {
        console.log("ive been called!")
        const findFields = () => {
            const tempFields = []
            selectedCategory.field_ids.forEach((currId) => tempFields.push(fields[currId]));
            setDisplayedFields(tempFields);
        }
        if(selectedCategory){
            findFields();
        }
    }, [selectedCategory])

    const handleCategoryChange = (e) => {
        setSelectedCategory(categories.find(cat => cat.id == e.target.value));
        console.log(selectedCategory);
    }

    const addField = async (event) => {
       
        event.preventDefault();
    
        try {

          const formData = new FormData(event.target);
          const response = await fetch('/api/create-field/', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to create field');
          }
          else{
            fetchData();
            setNewField("");
          }     

        } catch (error) {
          console.error('Error creating field:', error);
          alert('Failed to create field');
        }
    };

    return(
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-[120vh]">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
                <h1 className="text-3xl font-bold mb-8 pt-4 text-center">Edit Category</h1>
                <div className="w-11/12 flex flex-col items-center lg:items-start mx-auto">
                    <div className="w-full lg:w-3/5 mb-6">
                        <label htmlFor="catName">Category Name</label>
                        <select className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="catName" onChange={handleCategoryChange}
                        >
                            <option value="" disabled selected>--Select a Category--</option>
                            {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                            ))}
                        </select>
                        {selectedCategory && (
                            <>
                                <p>Current fields:</p>
                                <ul className="mb-8">
                                    {displayedFields.length > 0 ?
                                        displayedFields.map(item => (
                                        <li key={item.id}>{item.name}</li>))
                                     :
                                     <li key="None">None</li>
                                    }
                                </ul>
                                <hr class="w-11/12 md:w-48 h-1 mx-auto my-8 bg-gray-200 border-0 rounded md:my-10"></hr>
                                {addingField ? 
                                <form onSubmit={addField}>
                                    <label htmlFor="name">New Field Name<span className="text-red-500">*</span></label>
                                    <input type="text" className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="name"
                                        value={newField} onChange={(e) => setNewField(e.target.value)} name="name" required
                                    />
                                    <label htmlFor="type">New Field Type<span className="text-red-500">*</span></label>
                                    <select className="mt-1 mb-8 w-full rounded-md border-gray-300 shadow-sm
                                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="type" name="type" required>
                                        <option value="TEXT" default selected>TEXT</option>
                                        <option value="INTEGER">INTEGER</option>
                                    </select>
                                    <input type="hidden" value={selectedCategory.id} name="category_id"/>
                                    <div className="self-center flex gap-4 my-4 items-center">
                                        <ActionButton onClick={() => { setAddingField(false); setNewField("");}} color="red" size="lg">Cancel</ActionButton>
                                        <ActionButton type="submit" size="lg">Add Field</ActionButton>
                                    </div>
                                </form>
                                : 
                                <div className="flex justify-center lg:justify-start">
                                    <ActionButton onClick={() => setAddingField(true)} size="lg">Add New Field</ActionButton>
                                </div>
                                }
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}