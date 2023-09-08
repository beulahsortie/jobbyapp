import {BsFillStarFill, BsBriefcase} from 'react-icons/bs'

import {GoLocation} from 'react-icons/go'

import './index.css'

const SimilarProductItem = props => {
  const {productData} = props
  const {
    companyLogoUrl,
    employmentType,
    id,
    jobDescription,
    location,
    title,
    rating,
  } = productData

  return (
    <li className="spdatalist">
      <img
        src={companyLogoUrl}
        alt="similar job company logo"
        className="spdataimage"
      />
      <h1 className="spdatatitle">{title}</h1>
      <p className="spdatabrand">
        <span className="spanicon">
          <BsBriefcase />
        </span>
        {employmentType}
      </p>
      <p className="spdatabrand">
        <span className="spanicon">
          <GoLocation />
        </span>
        {location}
      </p>
      <p className="spdatabrand">
        <BsFillStarFill />
        <span>{rating}</span>
      </p>
      <h1>Description</h1>
      <p className="spdatabrand">{jobDescription}</p>
    </li>
  )
}
export default SimilarProductItem