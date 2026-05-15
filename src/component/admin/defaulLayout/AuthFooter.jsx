import React from 'react'
import Index from '../../Index'
import PagesIndex from '../../PagesIndex'



export default function AuthFooter() {
      return (
            <>
                  <Index.Box className="social-main">
                        <Index.List className="social-ul">
                              <Index.ListItem className="social-li">
                                    <Index.Link className="social-link text-decoration-none">
                                          <Index.Box className="social-box">
                                                <img src={PagesIndex.Svg.facebook} className="social-icons"  alt="Facebook"/>
                                          </Index.Box>
                                    </Index.Link>
                              </Index.ListItem>
                              <Index.ListItem className="social-li">
                                    <Index.Link className="social-link text-decoration-none">
                                          <Index.Box className="social-box">
                                                <img src={PagesIndex.Svg.instagram} className="social-icons"  alt="Instagram" />
                                          </Index.Box>
                                    </Index.Link>
                              </Index.ListItem>
                              <Index.ListItem className="social-li">
                                    <Index.Link className="social-link text-decoration-none">
                                          <Index.Box className="social-box">
                                                <img src={PagesIndex.Svg.
                                                      twitter} className="social-icons" alt="Twitter"/>
                                          </Index.Box>
                                    </Index.Link>
                              </Index.ListItem>
                              <Index.ListItem className="social-li">
                                    <Index.Link className="social-link text-decoration-none">
                                          <Index.Box className="social-box">
                                                <img src={PagesIndex.Svg.
                                                      linkdin} className="social-icons" alt='Linkdin'/>
                                          </Index.Box>
                                    </Index.Link>
                              </Index.ListItem>
                              <Index.ListItem className="social-li">
                                    <Index.Link className="social-link text-decoration-none">
                                          <Index.Box className="social-box">
                                                <img src={PagesIndex.Svg.
                                                      discord} className="social-icons" alt='Discord'/>
                                          </Index.Box>
                                    </Index.Link>
                              </Index.ListItem>
                        </Index.List>
                  </Index.Box>
            </>
      )
}
