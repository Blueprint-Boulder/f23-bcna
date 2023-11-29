const GridResult = ({ data }) => {
    return (
        <tr className="grid-result">
            <td>{data.name}</td>
            <td>{data.subcategory}</td>
        </tr>
    )
}

export default GridResult