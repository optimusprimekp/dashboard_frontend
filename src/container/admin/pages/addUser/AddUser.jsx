import React from 'react'
import Index from '../../../Index';
import PagesIndex from '../../../PagesIndex';


export default function AddUser() {

      // for open handleChangedropdown 

      const [age, setAge] = React.useState('');

      const handleChangedropdown = (event) => {
            setAge(event.target.value);
      };
      return (
            <Index.Box className="admin-dashboard-content admin-add-user-containt">
                  <Index.Typography className='admin-page-title' component='h2' variant='h2'>Add User</Index.Typography>
                  <Index.Box className="admin-page-border">
                        <Index.Typography className='admin-common-para admin-add-basic-text' component='p' variant='p'>Basic Information</Index.Typography>
                        <Index.Typography className='admin-common-para admin-add-section-text' component='p' variant='p'>Section to config basic product information</Index.Typography>
                        <Index.Box className="add-user-data-main">
                              <Index.Box sx={{ width: 1 }} className="grid-main">
                                    <Index.Box display="grid" className="admin-display-row" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 0, sm: 0, md: 0, lg: 0 }}>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input">
                                                      <Index.FormHelperText className='admin-form-lable'>User Name</Index.FormHelperText>
                                                      <Index.Box className="admin-form-group">
                                                            <Index.TextField
                                                                  fullWidth
                                                                  id="fullWidth"
                                                                  className="admin-form-control"
                                                                  placeholder=""
                                                            />
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input">
                                                      <Index.FormHelperText className='admin-form-lable'>Code</Index.FormHelperText>
                                                      <Index.Box className="admin-form-group">
                                                            <Index.TextField
                                                                  fullWidth
                                                                  id="fullWidth"
                                                                  className="admin-form-control"
                                                                  placeholder=""
                                                            />
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input">
                                                      <Index.FormHelperText className='admin-form-lable'>Bulk Discount Price</Index.FormHelperText>
                                                      <Index.Box className="admin-form-group">
                                                            <Index.TextField
                                                                  fullWidth
                                                                  id="fullWidth"
                                                                  className="admin-form-control"
                                                                  placeholder=""
                                                            />
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input">
                                                      <Index.FormHelperText className='admin-form-lable'>Tax Rate(%)</Index.FormHelperText>
                                                      <Index.Box className="admin-form-group">
                                                            <Index.TextField
                                                                  fullWidth
                                                                  id="fullWidth"
                                                                  className="admin-form-control"
                                                                  placeholder=""
                                                            />
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input">
                                                      <Index.FormHelperText className='admin-form-lable'>SKU</Index.FormHelperText>
                                                      <Index.Box className="admin-form-group">
                                                            <Index.Box className='admin-dropdown-box'>
                                                                  <Index.FormControl className='admin-form-control'>
                                                                        <Index.Select className='admin-dropdown-select '
                                                                              value={age}
                                                                              onChange={handleChangedropdown}
                                                                              displayEmpty
                                                                              inputProps={{ 'aria-label': 'Without label' }}
                                                                        >
                                                                              <Index.MenuItem value="" className='admin-menuitem'>
                                                                                    USD
                                                                              </Index.MenuItem>
                                                                              <Index.MenuItem value={10} className='admin-menuitem'>USD</Index.MenuItem>
                                                                              <Index.MenuItem value={20} className='admin-menuitem'>USD</Index.MenuItem>
                                                                              <Index.MenuItem value={30} className='admin-menuitem'>USD</Index.MenuItem>
                                                                        </Index.Select>
                                                                  </Index.FormControl>
                                                            </Index.Box>
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input admin-radio-main">
                                                      <Index.FormHelperText className='admin-form-lable'>Price Limit</Index.FormHelperText>
                                                      <Index.RadioGroup
                                                            row
                                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                                            name="row-radio-buttons-group"
                                                            className='admin-radiogroup'
                                                      >
                                                            <Index.FormControlLabel value="female" control={<Index.Radio className='admin-radio' />} label="$100k" />
                                                            <Index.FormControlLabel value="male" control={<Index.Radio className='admin-radio' />} label="$200k" />
                                                            <Index.FormControlLabel value="other" control={<Index.Radio className='admin-radio' />} label="$300k" />
                                                      </Index.RadioGroup>
                                                </Index.Box>
                                          </Index.Box>
                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 12", lg: "span 12" }} className="grid-column">
                                                <Index.Box className="admin-input-box admin-add-user-input">
                                                      <Index.FormHelperText className='admin-form-lable'>Description</Index.FormHelperText>
                                                      <Index.Box className="admin-form-group">
                                                            <Index.TextareaAutosize
                                                                  aria-label="minimum height"
                                                                  // minRows={3}
                                                                  placeholder=""
                                                                  className="admin-form-control-textarea"
                                                            />
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>

                                          <Index.Box gridColumn={{ xs: "span 12", sm: "span 12", md: "span 12", lg: "span 12" }} className="grid-column">
                                                <Index.Box className="admin-user-btn-flex">
                                                      <Index.Box className="admin-discard-btn-main border-btn-main">
                                                            <Index.Button className='admin-discard-user-btn border-btn'>Discard</Index.Button>
                                                      </Index.Box>
                                                      <Index.Box className="admin-save-btn-main border-btn-main">
                                                            <Index.Button className='admin-save-user-btn border-btn'><img src={PagesIndex.Svg.save} className="admin-user-save-icon" alt='Save'></img>Save</Index.Button>
                                                      </Index.Box>
                                                </Index.Box>
                                          </Index.Box>
                                    </Index.Box>
                              </Index.Box>
                        </Index.Box>
                  </Index.Box>
            </Index.Box>
      )
}
