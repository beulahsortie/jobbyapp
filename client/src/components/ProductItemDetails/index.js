import {Component} from 'react'

import * as Loader from 'react-loader-spinner'

import Cookies from 'js-cookie'

import {Link} from 'react-router-dom'

import {BsFillStarFill, BsBriefcase} from 'react-icons/bs'

import {GoLocation} from 'react-icons/go'

import Header from '../Header'

import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productsList: {},
    spData: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProducts()
  }

  getProducts = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')

    const {match} = this.props
    const {params} = match
    const {id} = params

    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedJobData = {
        companyLogoUrl: fetchedData.job_details.company_logo_url,
        companyWebsiteUrl: fetchedData.job_details.company_website_url,
        employmentType: fetchedData.job_details.employment_type,
        id: fetchedData.job_details.id,
        jobDescription: fetchedData.job_details.job_description,
        skills: fetchedData.job_details.skills,
        lifeAtCompany: fetchedData.job_details.life_at_company,
        location: fetchedData.job_details.location,
        packagePerAnnum: fetchedData.job_details.package_per_annum,
        rating: fetchedData.job_details.rating,
      }
      const similarJobsData = fetchedData.similar_jobs.map(product => ({
        companyLogoUrl: product.company_logo_url,
        employmentType: product.employment_type,
        id: product.id,
        jobDescription: product.job_description,
        location: product.location,
        title: product.title,
        rating: product.rating,
      }))
      this.setState({
        productsList: updatedJobData,
        spData: similarJobsData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderFailureView = () => (
    <div className="products-error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="products-failure-img"
      />
      <h1 className="product-failure-heading-text">
        Oops! Something Went Wrong
      </h1>
      <p className="products-failure-description">
        We cannot seem to find the page you are looking for
      </p>

      <Link to="/Jobs" className="nav-link">
        <button>Retry</button>
      </Link>
    </div>
  )

  renderProductsListView = () => {
    const {productsList, spData} = this.state
    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      id,
      jobDescription,
      skills,
      lifeAtCompany,
      location,
      packagePerAnnum,
      rating,
    } = productsList
    const shouldShowProductsList = true

    return shouldShowProductsList ? (
      <div className="thebg">
        <div className="thetop">
          <div className="theicon">
            <img
              src={companyLogoUrl}
              className="theiconimage"
              alt="job details company logo"
            />
            <div className="logotitle">
              <p className="employmenttype">{employmentType}</p>
              <p className="therate">
                <span>
                  <BsFillStarFill />
                </span>
                {rating}
              </p>
            </div>
          </div>
          <div className="thedetails">
            <div className="theline">
              <p>
                <GoLocation />
                {location}
              </p>
              <p>
                <span>
                  <BsBriefcase />
                </span>
                {employmentType}
              </p>
              <p>{packagePerAnnum}</p>
            </div>
            <hr
              style={{
                color: 'black',
                background: 'black',
                borderColor: 'black',
                height: '3px',
                width: '100%',
              }}
            />
            <h1>Description</h1>
            <p className="rdescription">{jobDescription}</p>
            <a href={companyWebsiteUrl}>Visit</a>
            <h1>Life at Company</h1>
            <div className="life">
              <p className="rdescriptionpara">{lifeAtCompany.description}</p>
              <img
                src={lifeAtCompany.image_url}
                className="lifeatcompany"
                alt="life at company"
              />
            </div>
            <div className="increment">
              <h1>Skills</h1>
              <ul className="skills">
                {skills.map(product => (
                  <div className="skillblock">
                    <img
                      src={product.image_url}
                      className="skilllogo"
                      alt={product.name}
                    />
                    <p>{product.name}</p>
                  </div>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <h1 className="similarjobs">Similar Jobs</h1>
        <ul className="simproductscontainer">
          {spData.map(product => (
            <SimilarProductItem productData={product} key={product.id} />
          ))}
        </ul>
      </div>
    ) : (
      <div className="no-products-view">
        <img
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          className="no-products-img"
          alt="no jobs"
        />
        <h1 className="no-products-heading">Jobs Not Found</h1>
        <p className="no-products-description">
          We could not find any Jobs. Try other filters.
        </p>
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="products-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderAllProducts = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductsListView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="all-products-section">{this.renderAllProducts()}</div>
      </>
    )
  }
}

export default ProductItemDetails