import {Component} from 'react'
import * as Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'
import FiltersGroup from '../FiltersGroup'
import Ratings from '../Ratings'
import JobsCard from '../JobsCard'
import Profile from '../Profile'
import './index.css'

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const sortbyOptions = [
  {
    optionId: 'PRICE_HIGH',
    displayText: 'Price (High-Low)',
  },
  {
    optionId: 'PRICE_LOW',
    displayText: 'Price (Low-High)',
  },
]

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

let tagcat = 0

let tagrat = 0

class AllJobsSection extends Component {
  state = {
    search: '',
    jobsList: [],
    isLoading: apiStatusConstants.initial,
    activeOptionId: sortbyOptions[0].optionId,
    cat: '',
    ser: '',
    rat: '',
  }

  componentDidMount() {
    this.getProducts()
  }

  getProducts = async () => {
    this.setState({
      isLoading: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')

    const {activeOptionId, cat, ser, rat} = this.state
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${cat}&minimum_package=${rat}&search=${ser}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = fetchedData.jobs.map(each => ({
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
        id: each.id,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        title: each.title,
        rating: each.rating,
      }))
      this.setState({
        jobsList: updatedData,
        isLoading: apiStatusConstants.success,
      })
    } else if (response.status === 401) {
      this.setState({
        isLoading: apiStatusConstants.failure,
      })
    }
  }

  renderProductsList = () => {
    const {jobsList, activeOptionId} = this.state

    if (jobsList.length === 0) {
      return (
        <div className="no">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="noproducts"
          />
          <h1 className="noproductshead">No Jobs Found</h1>
          <p className="noproductshead">
            We cannot seem to find the page you are looking for
          </p>
        </div>
      )
    }
    return (
      <div className="all-products-container">
        <ul className="products-list">
          {jobsList.map(product => (
            <JobsCard productData={product} key={product.id} />
          ))}
        </ul>
      </div>
    )
  }

  renderLoader = () => (
    <div className="products-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  rendererrorsList = () => (
    <>
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="errorimg"
      />
      <h1 className="noproductshead">Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you are looking for</p>
      <button type="button">Retry</button>
    </>
  )

  renderCat = value => {
    if (tagcat % 2 === 0) {
      this.setState({cat: value}, this.getProducts)
      tagcat = tagcat + 1
    } else if (tagcat % 2 === 1) {
      this.setState({cat: ''}, this.getProducts)
      tagcat = tagcat + 1
    }
  }

  onChangeSearch = event => {
    this.setState({search: event.target.value})
  }

  onSearchTab = event => {
    event.preventDefault()
    const {search} = this.state
    this.setState({ser: search}, this.getProducts)
  }

  allClear = () => {
    this.setState({cat: '', rat: '', ser: ''}, this.getProducts)
  }

  renderRat = value => {
    if (tagrat % 2 === 0) {
      this.setState({rat: value}, this.getProducts)
      tagrat = tagrat + 1
    } else if (tagrat % 2 === 1) {
      this.setState({rat: ''}, this.getProducts)
      tagrat = tagrat + 1
    }
  }

  render() {
    const {isLoading, ser} = this.state

    return (
      <div className="all-products-section">
        <div className="filters-group-container">
          <div className="profilebox">
            <Profile />
          </div>

          <form className="form-container" onSubmit={this.onSearchTab}>
            <input
              className="inpp"
              type="search"
              onChange={this.onChangeSearch}
              placeholder="Search"
            />
            <button type="button">
              <BsSearch className="search-icon" />
            </button>
          </form>
          <ul className="unorderedlist" style={{listStyleType: 'none'}}>
            <li>
              <h1 className="top">Type of Employment</h1>
            </li>
            {employmentTypesList.map(cate => (
              <FiltersGroup
                categoryData={cate}
                renderCat={this.renderCat}
                key={cate.employmentTypeId}
              />
            ))}
          </ul>
          <ul className="unorderedlist" style={{listStyleType: 'none'}}>
            <li>
              <h1 className="top">Salary Range</h1>
            </li>
            {salaryRangesList.map(rate => (
              <Ratings
                ratingData={rate}
                renderRat={this.renderRat}
                key={rate.salaryRangeId}
              />
            ))}
          </ul>
          <button type="button" className="clearbutton" onClick={this.allClear}>
            Clear Filters
          </button>
        </div>

        {isLoading === apiStatusConstants.inProgress && this.renderLoader()}
        {isLoading === apiStatusConstants.failure && this.rendererrorsList()}
        {isLoading === apiStatusConstants.success && this.renderProductsList()}
      </div>
    )
  }
}

export default AllJobsSection