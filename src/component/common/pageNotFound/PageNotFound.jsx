import React from 'react'
import Index from '../../Index'
import PagesIndex from '../../PagesIndex'
import './pageNotFound.css'

export default function PageNotFound() {
      return (
            <>
                  <Index.Box className="page-not-found-section">
                        <Index.Box className="page-not-found-content-main">
                              {/* <img src={PagesIndex.Png.pagenotfoundimg} className='page-not-found-img' /> */}
                              <Index.Typography className='page-404-text'>404</Index.Typography>
                              <Index.Typography className='page-not-found-title'>Sorry Page not found!</Index.Typography>
                              <Index.Button className='page-not-found-btn'>Go to Homepage<span >
                                          <img src={PagesIndex.Svg.rightarrow} className='page-right-arrow' /></span></Index.Button>
                        </Index.Box>
                  </Index.Box>
            </>
      )
}
