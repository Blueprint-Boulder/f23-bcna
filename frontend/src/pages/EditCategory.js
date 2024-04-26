import { ActionButton } from "../components/ActionButton";
import { useState, useEffect } from "react";
import apiService from "../services/apiService";

export default function EditCategory() {

    const[categories, setCategories] = useState({});
    const[selectedCategory, setSelectedCategory] = useState(null);
    const[fields, setFields] = useState({});
    const[displayedFields, setDisplayedFields] = useState({});
    const[newField, setNewField] = useState("");
    const[addingField, setAddingField] = useState(false);
    const[addingExistingField, setAddingExistingField] = useState(false);
    const[deleting, setDeleting] = useState(false);
    const[subDeletion, setSubDeletion] = useState({
        allowSubChoice: false,
        subWarning: "",
        deleteSubs: false,
        showSubs: false
    });


    const fetchData = async () => { // gets all categories and fields from the database with an API route
        try {
          const data = await apiService.getCategoriesAndFields();
          setCategories(data.categories);
          setFields(data.fields);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {   // fetch data on page load
        fetchData();
    }, []);

    useEffect(() => {   // update selected category if data is changed (i.e. new field is added)
        if(selectedCategory){
            setSelectedCategory(categories[selectedCategory.id]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);
    
    useEffect(() => {   // find fields and determine deletion options
        const findFields = () => {
            const tempFields = {}
            selectedCategory.field_ids.forEach((currId) => tempFields[currId] = fields[currId]);
            setDisplayedFields(tempFields);
        }
        if(selectedCategory){
            findFields();
            setDeleting(false);
            setAddingField(false);
            if(selectedCategory.subcategories.length > 0 && selectedCategory.parent_id){
                const choiceText = `WARNING: This category contains subcategories. Checking this option will delete ALL subcategories.
                 Otherwise, the parent of this category will become the new parent of all subcategories`
                setSubDeletion({...subDeletion, allowSubChoice: true, subWarning: choiceText, deleteSubs: false, showSubs: true})
            }
            else if(selectedCategory.parent_id){
                setSubDeletion({...subDeletion, allowSubChoice: false, subWarning: "Are you sure you want to delete this category?", deleteSubs: false, showSubs: false})
            }
            else if(selectedCategory.subcategories.length > 0){
                const autoText = `WARNING: This category contains subcategories. Since this category has no parent, all subcategories 
                  will automatically be deleted if this category is deleted.`
                setSubDeletion({...subDeletion, allowSubChoice: false, subWarning: autoText, deleteSubs: true, showSubs: true})
            }
            else{
                setSubDeletion({...subDeletion, allowSubChoice: false, subWarning: "Are you sure you want to delete this category?", deleteSubs: true, showSubs: false})
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory])

    const handleCategoryChange = (e) => {
        setSelectedCategory(categories[e.target.value]);
    }

    const addExistingField = async (event) => {
       
        event.preventDefault();
    
        try {

          const formData = new FormData(event.target);
          const response = await apiService.editField(formData);
          console.log(response);
          fetchData();
          
        } catch (error) {
          console.error('Error editing field:', error);
          alert('Failed to edit field');
        }
    }

    const addField = async (event) => {
       
        event.preventDefault();
    
        try {

          const formData = new FormData(event.target);
          const response = await apiService.createField(formData);
          console.log(response);
          fetchData();
          setNewField(""); 

        } catch (error) {
          console.error('Error creating field:', error);
          alert('Failed to create field');
        }
    };

    const toggleSubDeletion = (e) => {
        setSubDeletion({...subDeletion, deleteSubs: e.target.checked})
    }

    const deleteCategory = async() => {
        try {

            let deleteString = `http://127.0.0.1:5000/api/delete-category/?id=${selectedCategory.id}`;
            
            if(subDeletion.deleteSubs){
                deleteString += '&delete-members=true';
            }

            const response = await fetch(deleteString, {method: 'DELETE'});

            if (!response.ok) {
                throw new Error('Failed to create field');
            }
            else{
                alert("Category deleted successfully!");
                window.location.href = window.location.pathname;
            }    

          } catch (error) {
            console.error('Error deleting categories', error);
          }
    }



    return(
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] bg-cover w-screen h-[120vh]">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
                <h1 className="text-3xl font-bold mb-8 pt-4 text-center">Edit Category</h1>
                <div className="w-11/12 flex flex-col items-center mx-auto">
                    <div className="w-full lg:w-3/5 mb-6">
                        <label htmlFor="catName">Category Name</label>
                        <select className="mt-1 mb-4 w-full rounded-md border-gray-300 shadow-sm
                             focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="catName" onChange={handleCategoryChange} defaultValue="default"
                        >
                            <option value="default" disabled defaultValue>--Select a Category--</option>
                            {Object.values(categories).map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                            ))} 
                        </select>
                        {selectedCategory && (
                            <>
                                <p>Current fields:</p>
                                <ul className="mb-8">
                                    {Object.keys(displayedFields).length > 0 ?
                                        Object.values(displayedFields).map(item => (
                                        <div className="flex flex-wrap gap-3 mt-2 mb-6 lg:mb-3 items-center" key={`group-${item.id}`}>
                                            <li key={item.id}>{item.name} ({item.type})</li>
                                            <button key={`button-${item.id}`} className="bg-red-500 rounded-full inline px-4 py-1.5 lg:px-3 lg:py-0.5 text-white font-bold text-lg">-</button>
                                        </div>))
                                     :
                                     <li key="None">None</li>
                                    }
                                </ul>
                                <hr className="w-11/12 md:w-48 h-1 mx-auto my-8 bg-gray-200 border-0 rounded md:my-10"></hr>
                                {addingExistingField && (
                                    <form onSubmit={addExistingField}>
                                    <label htmlFor="existing">Add an Existing Field</label>
                                    <select className="mt-1 mb-8 w-full rounded-md border-gray-300 shadow-sm
                                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="existing" name="field_id" defaultValue="default">
                                        <option value="default" disabled defaultValue>--Select if Applicable--</option>
                                        {Object.values(fields).map(field => (
                                            displayedFields[field.id] ? <></> :
                                                <option key={field.id} value={field.id}>
                                                    {field.name} ({field.type})
                                                </option>
                                        ))} 
                                    </select>
                                    <input type="hidden" value={selectedCategory.id} name="new_category_id"/>
                                    <div className="self-center flex gap-4 my-4 items-center">
                                        <ActionButton onClick={() => setAddingExistingField(false)} color="red" size="lg" type="button">Cancel</ActionButton>
                                        <ActionButton type="submit" size="lg">Add Field</ActionButton>
                                    </div>
                                    </form>
                                )}
                                {addingField && (
                                <form onSubmit={addField}>
                                    <label htmlFor="name">New Field Name</label>
                                    <input type="text" className="mb-4 w-full rounded-md border-gray-300 shadow-sm
                                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="name"
                                        value={newField} onChange={(e) => setNewField(e.target.value)} name="name" required
                                    />
                                    <label htmlFor="type">New Field Type</label>
                                    <select className="mt-1 mb-8 w-full rounded-md border-gray-300 shadow-sm
                                      focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" id="type" name="type" defaultValue="TEXT">
                                        <option value="TEXT">TEXT</option>
                                        <option value="INTEGER">INTEGER</option>
                                        <option value="IMAGE">IMAGE</option>
                                    </select>
                                    <input type="hidden" value={selectedCategory.id} name="category_id"/>
                                    <div className="self-center flex gap-4 my-4 items-center">
                                        <ActionButton onClick={() => { setAddingField(false); setNewField("");}} color="red" size="lg" type="button">Cancel</ActionButton>
                                        <ActionButton type="submit" size="lg">Add Field</ActionButton>
                                    </div>
                                </form>)}
                                {(!addingField && !addingExistingField) && (
                                <div className="flex justify-center lg:justify-start gap-8">
                                    <ActionButton onClick={() => setAddingExistingField(true)} size="lg">Add Existing Field</ActionButton>
                                    <ActionButton onClick={() => setAddingField(true)} size="lg">Add New Field</ActionButton>
                                </div>)
                                }
                                <hr className="w-11/12 md:w-48 h-1 mx-auto my-8 bg-gray-200 border-0 rounded md:my-10"></hr>
                                {deleting ? 
                                <>
                                    <p className="text-red-600 mb-4">{subDeletion.subWarning}</p>
                                    {subDeletion.allowSubChoice &&
                                        <>
                                            <label htmlFor="subs">Delete Subcategories</label>
                                            <input type="checkbox" id="subs" className="mx-4" checked={subDeletion.deleteSubs} onChange={toggleSubDeletion}/>
                                        </>
                                    }
                                    {subDeletion.showSubs && 
                                        <p>Subcategories include: {selectedCategory.subcategories.map(sub => categories[sub].name).join(", ")}</p>
                                    }
                                    <div className="self-center flex gap-4 my-4 items-center">
                                        <ActionButton onClick={() => setDeleting(false)} color="gray" size="lg">Go Back</ActionButton>
                                        <ActionButton onClick={deleteCategory} size="lg" color="red">Delete</ActionButton>
                                    </div>
                                </>
                                :
                                <div className="flex justify-center lg:justify-start">
                                    <ActionButton color="red" size="lg" onClick={() => setDeleting(true)}>Delete Category</ActionButton>
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

