import './index.css'

const FiltersGroup = props => {
  const {categoryData, renderCat} = props
  const {employmentTypeId, label} = categoryData
  const catty = () => {
    renderCat(employmentTypeId)
  }

  return (
    <li className="listu">
      <input type="radio" id={employmentTypeId} name="kill" onClick={catty} />
      <label htmlFor={employmentTypeId} className="listlist">
        {' '}
        {label}
      </label>
    </li>
  )
}

export default FiltersGroup