import './underMaintenance.css'
import Index from '../../Index'
import PagesIndex from '../../PagesIndex'

export default function UnderMaintenance() {
      return (
            <>
                  <Index.Box className="site-under-maintenance-page">
                        <Index.Box className="maintenance-content">
                              <img src={PagesIndex.Png.maintenanceimg} className='maintenance-img' />
                              <Index.Typography className='maintenance-title'>Sorry, We are down for maintenance</Index.Typography>
                              <Index.Typography className='maintenance-para'>Our website is under constructions currently, Get a notification on your e-mail for updates.</Index.Typography>
                              <Index.Button className='maintenance-btn'> <span className='gmail-round-box'>
                                    <img src={PagesIndex.Svg.gmailicon} className='gmail-icon' /></span>Notify me <span >
                                          <img src={PagesIndex.Svg.rightarrow} className='right-arrow' /></span></Index.Button>
                        </Index.Box>
                        <Index.Box className="maintenance-footer">
                              <Index.Typography className='maintenance-copy-right-text'>Copyright © 2023 Zoon. All Rights Reserved.</Index.Typography>
                        </Index.Box>
                  </Index.Box>
            </>
      )
}
