import React from 'react'
import Index from '../../Index'

export default function DataNotFound() {
      return (
            <Index.TableRow>
                  <Index.TableCell className='table-not-found-td' colSpan={12}>
                        <Index.Box className="data-not-found-main">
                              <Index.Typography className='data-not-found-text'>Data Not Found</Index.Typography>
                        </Index.Box>
                  </Index.TableCell>
            </Index.TableRow>
      )
}
