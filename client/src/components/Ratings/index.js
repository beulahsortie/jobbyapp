import './index.css'

const Ratings = props => {
  const {ratingData, renderRat} = props
  const {salaryRangeId, label} = ratingData
  const ratty = () => {
    renderRat(salaryRangeId)
  }

  return (
    <li className="listu">
      <input type="radio" id={salaryRangeId} name="run" onClick={ratty} />
      <label htmlFor={salaryRangeId} className="ratinglist">
        {' '}
        {label}
      </label>
    </li>
  )
}

export default Ratings