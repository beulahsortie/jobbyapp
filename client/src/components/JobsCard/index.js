import {Link} from 'react-router-dom'
import './index.css'

const JobsCard = props => {
  const {productData} = props
  const {
    title,
    companyLogoUrl,
    rating,
    employmentType,
    jobDescription,
    location,
    packagePerAnnum,
    id,
  } = productData

  return (
    <Link to={`/jobs/${id}`} className="productswithid">
      <li className="product-item">
        <div className="product-details">
          <img src={companyLogoUrl} alt="company logo" className="thumbnail" />
          <div className="titlebox">
            <h1 className="title">{title}</h1>
            <div className="rating-container">
              <p className="rating">{rating}</p>

              <img
                src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                alt="star"
                className="star"
              />
            </div>
          </div>
        </div>
        <div className="producttails">
          <div className="package">
            <p className="brand">{employmentType}</p>
            <p className="brand">{location}</p>
          </div>
          <div>
            <p className="price">{packagePerAnnum}</p>
          </div>
        </div>
        <hr
          style={{
            color: '#cbd5e1',
            background: '#cbd5e1',
            borderColor: '#cbd5e1',
            height: '3px',
            width: '100%',
          }}
        />
        <h1 className="titleDes">Description</h1>
        <p className="description">{jobDescription}</p>
      </li>
    </Link>
  )
}
export default JobsCard
