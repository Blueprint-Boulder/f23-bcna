import { ActionButton } from "../components/ActionButton";

export default function Admin() {
    return(
        <div className="bg-[url('https://images.squarespace-cdn.com/content/v1/5373ca62e4b0875c414542a1/1405111543624-681EMTDC5LLPE19MEUXH/image-asset.jpeg')] w-screen h-[120vh]">
            <div className="h-8"></div>
            <div className="bg-neutral-50 rounded-lg w-11/12 lg:w-3/5 mx-auto shadow-lg">
                <h1 className="text-3xl font-bold mb-8 pt-4 text-center">Admin Page</h1>
                <h2 className="text-2xl font-bold text-center mb-3">Add Data</h2>
                <div className="flex justify-center mb-8 gap-5">
                    <ActionButton size="xl" noFocus><a href="/">Add Category</a></ActionButton>
                    <ActionButton size="xl" noFocus><a href="/">Add Wildlife</a></ActionButton>
                </div>
                <h2 className="text-2xl font-bold text-center mb-3">Edit Data</h2>
                <div className="flex justify-center pb-6 gap-5">
                    <ActionButton size="xl" noFocus><a href="/">Edit Category</a></ActionButton>
                    <ActionButton size="xl" noFocus><a href="/">Edit Wildlife</a></ActionButton>
                </div>
            </div>
        </div>
    )
}